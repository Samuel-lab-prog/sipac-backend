import type { Prisma } from '@PrismaGenerated/client';
import {
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { titles, type IssueBody } from './types';
import type { DocumentSnapshot } from './pdf';
const subjectInclude = {
	studentProfile: { include: { course: { include: { department: true } } } },
	campus: { include: { institution: true } },
} as const;
type Subject = Prisma.UserGetPayload<{ include: typeof subjectInclude }>;
const date = (d: Date) =>
	d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
async function participationParagraphs(
	tx: Prisma.TransactionClient,
	subject: Subject,
	body: IssueBody,
) {
	if (!body.participantId)
		throw new UnprocessableEntityError('Selecione a participação.');
	const participant = await tx.projectParticipant.findFirst({
		where: {
			id: body.participantId,
			userId: subject.id,
			approvedHours: { gt: 0 },
			project: { campusId: subject.campusId, status: 'completed' },
		},
		include: { project: true },
	});
	if (!participant)
		throw new UnprocessableEntityError(
			'O certificado exige projeto concluído e carga horária aprovada.',
		);
	return [
		`Certificamos que ${subject.name} participou do projeto “${participant.project.title}”, na função de ${participant.role}, de ${date(participant.startsAt)} a ${date(participant.endsAt)}, com carga horária validada de ${participant.approvedHours} horas.`,
	];
}
async function enrollmentParagraphs(
	tx: Prisma.TransactionClient,
	subject: Subject,
	body: IssueBody,
) {
	const profile = subject.studentProfile,
		course = profile?.course;
	if (
		!profile ||
		!course ||
		profile.status !== 'active' ||
		!['active', 'pending'].includes(subject.status) ||
		course.department.campusId !== subject.campusId
	)
		throw new UnprocessableEntityError(
			'A emissão exige vínculo acadêmico ativo com um curso deste campus.',
		);
	const now = new Date();
	const enrollments = await tx.enrollment.findMany({
		where: {
			studentProfileId: profile.id,
			status: 'active',
			classOffering: {
				courseId: course.id,
				academicPeriod: {
					campusId: subject.campusId,
					startsAt: { lte: now },
					endsAt: { gte: now },
					...(body.academicPeriodId ? { id: body.academicPeriodId } : {}),
				},
			},
		},
		include: { classOffering: { include: { academicPeriod: true } } },
	});
	if (!enrollments.length)
		throw new UnprocessableEntityError(
			'Não há matrícula ativa em período letivo vigente para esta emissão.',
		);
	const paragraphs = [
		`Declaramos que ${subject.name}, matrícula ${profile.academicId}, mantém vínculo acadêmico ativo com o curso ${course.name}.`,
	];
	const periods = [
		...new Set(enrollments.map((e) => e.classOffering.academicPeriod.code)),
	];
	paragraphs.push('Período(s) letivo(s): ' + periods.join(', ') + '.');
	if (body.kind === 'enrollment')
		paragraphs.push(
			'Ofertas com matrícula ativa: ' +
				enrollments
					.map((e) => e.classOffering.title + ' (' + e.classOffering.code + ')')
					.join('; ') +
				'.',
		);
	paragraphs.push(
		'Esta declaração retrata os registros vigentes na data de emissão.',
	);
	return paragraphs;
}
export async function buildSnapshot(
	tx: Prisma.TransactionClient,
	input: {
		subjectId: number;
		campusId: number;
		issuerName: string;
		body: IssueBody;
	},
): Promise<DocumentSnapshot> {
	const { subjectId, campusId, issuerName, body } = input;
	const subject = await tx.user.findFirst({
		where: { id: subjectId, campusId, deletedAt: null },
		include: subjectInclude,
	});
	if (!subject) throw new NotFoundError('Pessoa não encontrada.');
	const { campus } = subject;
	if (!campus.institution.configured)
		throw new ConflictError(
			'A administração precisa configurar a identificação institucional antes da emissão.',
		);
	const paragraphs =
		body.kind === 'participation'
			? await participationParagraphs(tx, subject, body)
			: await enrollmentParagraphs(tx, subject, body);
	return {
		title: titles[body.kind],
		institution: campus.institution.name,
		campus: campus.name,
		address: `${campus.address}, ${campus.city}/${campus.state}`,
		subjectName: subject.name,
		paragraphs,
		issuedAt: new Date().toISOString(),
		issuerName,
	};
}
