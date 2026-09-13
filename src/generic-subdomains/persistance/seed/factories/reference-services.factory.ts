import type { Prisma } from '../../prisma/generated/client';
import type { SeedDb } from '../config';
import type { DocumentSnapshot } from '../../../../domains/documents-management/pdf';

/* eslint-disable max-lines-per-function -- deterministic reference service fixture. */

const projectTitle =
	'[DEV-AGIAS-REFERENCE] Pesquisa aplicada em tecnologia educacional';
const participationCode = 'a'.repeat(48);
const enrollmentCode = 'b'.repeat(48);

/** Seed a complete, reviewable example for the Ensino/Pesquisa/Extensão flows. */
export async function seedReferenceServices(
	db: SeedDb,
	_reference: unknown,
	_passwordHash: string,
) {
	const student = await db.user.findUniqueOrThrow({
		where: { email: 'student.reference@dev.agias.example' },
		include: {
			studentProfile: {
				include: { course: { include: { department: true } } },
			},
			campus: { include: { institution: true } },
		},
	});
	const professor = await db.user.findUniqueOrThrow({
		where: { email: 'professor.reference.art@dev.agias.example' },
	});
	const staff = await db.user.findUniqueOrThrow({
		where: { email: 'staff.reference@dev.agias.example' },
	});
	const startsAt = new Date('2026-08-10T03:00:00.000Z');
	const endsAt = new Date('2026-09-10T02:59:59.000Z');
	const projectData = {
		campusId: student.campusId,
		coordinatorId: professor.id,
		departmentId: student.studentProfile?.course?.departmentId,
		code: 'DEV-AGIAS-REF-2026-001',
		year: 2026,
		origin: 'internal' as const,
		title: projectTitle,
		kind: 'research' as const,
		objectives:
			'Investigar estratégias de aprendizagem ativa e documentar uma oficina aplicada a estudantes do campus.',
		researchLine: 'Tecnologias educacionais e aprendizagem ativa',
		knowledgeArea: 'Ciência da Computação',
		researchGroup: 'Grupo AGIAS de Inovação Pedagógica',
		fundingAgency: 'IFRS',
		callName: 'Edital interno de iniciação científica 2026',
		nature: 'Pesquisa aplicada',
		researchType: 'Iniciação científica',
		startsAt,
		endsAt,
		status: 'completed' as const,
		finalReportStatus: 'approved' as const,
	};
	const current = await db.institutionalProject.findFirst({
		where: { campusId: student.campusId, title: projectTitle },
	});
	const project = current
		? await db.institutionalProject.update({
				where: { id: current.id },
				data: projectData,
			})
		: await db.institutionalProject.create({ data: projectData });
	const participant = await db.projectParticipant.upsert({
		where: { projectId_userId: { projectId: project.id, userId: student.id } },
		update: {
			role: 'Bolsista de iniciação científica',
			workPlan:
				'Levantar referências, conduzir entrevistas, organizar os dados e apresentar os resultados.',
			startsAt,
			endsAt,
			approvedHours: 40,
			hoursApprovedBy: staff.id,
			hoursApprovedAt: new Date('2026-09-11T12:00:00.000Z'),
		},
		create: {
			projectId: project.id,
			userId: student.id,
			role: 'Bolsista de iniciação científica',
			workPlan:
				'Levantar referências, conduzir entrevistas, organizar os dados e apresentar os resultados.',
			startsAt,
			endsAt,
			approvedHours: 40,
			hoursApprovedBy: staff.id,
			hoursApprovedAt: new Date('2026-09-11T12:00:00.000Z'),
		},
	});
	const reportBody =
		'Foram realizadas as entrevistas previstas, os dados foram organizados e a oficina foi apresentada à comunidade acadêmica.';
	const report = await db.projectReport.findFirst({
		where: {
			projectId: project.id,
			title: '[DEV-AGIAS-REFERENCE] Relatório final',
		},
	});
	if (report)
		await db.projectReport.update({
			where: { id: report.id },
			data: {
				authorId: student.id,
				body: reportBody,
				approved: true,
				reviewedBy: staff.id,
				reviewedAt: new Date('2026-09-12T12:00:00.000Z'),
			},
		});
	else
		await db.projectReport.create({
			data: {
				projectId: project.id,
				authorId: student.id,
				title: '[DEV-AGIAS-REFERENCE] Relatório final',
				body: reportBody,
				approved: true,
				reviewedBy: staff.id,
				reviewedAt: new Date('2026-09-12T12:00:00.000Z'),
			},
		});
	await seedProjectEvent(
		db,
		project.id,
		professor.id,
		'created',
		'Projeto de referência criado.',
	);
	await seedProjectEvent(
		db,
		project.id,
		staff.id,
		'report_approved',
		'Relatório final homologado pela secretaria.',
	);
	await seedProjectEvent(
		db,
		project.id,
		staff.id,
		'hours_approved',
		'Carga horária da participação validada: 40 horas.',
	);
	await seedProjectEvent(
		db,
		project.id,
		staff.id,
		'completed',
		'Projeto concluído para demonstração.',
	);

	const institution = student.campus.institution;
	const baseSnapshot = {
		institution: institution.name,
		campus: student.campus.name,
		address: `${student.campus.address}, ${student.campus.city}/${student.campus.state}`,
		subjectName: student.name,
		issuerName: staff.name,
		issuedAt: '2026-09-12T15:00:00.000Z',
	} satisfies Omit<DocumentSnapshot, 'title' | 'paragraphs'>;
	await upsertDocument(db, {
		verificationCode: participationCode,
		campusId: student.campusId,
		subjectUserId: student.id,
		issuedByUserId: staff.id,
		kind: 'participation',
		snapshot: {
			...baseSnapshot,
			title: 'Certificado de participação em projeto',
			paragraphs: [
				`Certificamos que ${student.name} participou do projeto “${project.title}”, na função de ${participant.role}, de 10/08/2026 a 10/09/2026, com carga horária validada de 40 horas.`,
			],
		},
	});
	await upsertDocument(db, {
		verificationCode: enrollmentCode,
		campusId: student.campusId,
		subjectUserId: student.id,
		issuedByUserId: staff.id,
		kind: 'enrollment',
		snapshot: {
			...baseSnapshot,
			title: 'Atestado de matrícula',
			paragraphs: [
				`Declaramos que ${student.name} mantém vínculo acadêmico ativo com o curso ${student.studentProfile?.course?.name ?? 'Técnico em Informática'}.`,
				'Período letivo: 2026.2.',
			],
		},
	});
	return {
		projectId: project.id,
		participantId: participant.id,
		documents: [participationCode, enrollmentCode],
	};
}

async function seedProjectEvent(
	db: SeedDb,
	projectId: number,
	actorId: number,
	action: string,
	note: string,
) {
	const current = await db.projectEvent.findFirst({
		where: { projectId, action, note },
	});
	if (!current)
		await db.projectEvent.create({
			data: { projectId, actorId, action, note },
		});
}

async function upsertDocument(
	db: SeedDb,
	input: {
		verificationCode: string;
		campusId: number;
		subjectUserId: number;
		issuedByUserId: number;
		kind: string;
		snapshot: DocumentSnapshot;
	},
) {
	await db.issuedDocument.upsert({
		where: { verificationCode: input.verificationCode },
		update: {
			campusId: input.campusId,
			subjectUserId: input.subjectUserId,
			issuedByUserId: input.issuedByUserId,
			kind: input.kind,
			snapshot: input.snapshot as unknown as Prisma.InputJsonValue,
			revokedAt: null,
			revokedByUserId: null,
			revocationReason: null,
		},
		create: {
			verificationCode: input.verificationCode,
			campusId: input.campusId,
			subjectUserId: input.subjectUserId,
			issuedByUserId: input.issuedByUserId,
			kind: input.kind,
			templateVersion: 1,
			snapshot: input.snapshot as unknown as Prisma.InputJsonValue,
			createdAt: new Date('2026-09-12T15:00:00.000Z'),
		},
	});
}
