import type { SeedDb } from '../config';
import type { SeedPerson } from './reference-people.factory';
import type { ReferenceActivity } from '../catalogs/reference-activities';

export type SubmissionSituation =
	| 'pending'
	| 'submitted'
	| 'late'
	| 'graded'
	| 'zero';

export function submissionSituation(
	studentIndex: number,
	subjectIndex: number,
	activityKey: string,
): SubmissionSituation {
	if (activityKey === 'final' || activityKey === 'portfolio') return 'pending';
	if (activityKey === 'project')
		return (studentIndex + subjectIndex) % 4 === 0 ? 'submitted' : 'pending';
	const rotation =
		(studentIndex + subjectIndex + (activityKey === 'practice' ? 2 : 0)) % 5;
	return (['pending', 'submitted', 'late', 'graded', 'zero'] as const)[
		rotation
	]!;
}

export async function seedReferenceSubmissions(
	db: SeedDb,
	input: {
		activityId: number;
		blueprint: ReferenceActivity;
		students: SeedPerson[];
		subjectIndex: number;
		appliesAt: Date | null;
		professorUserId: number;
	},
) {
	for (const student of input.students) {
		const situation = submissionSituation(
			student.index,
			input.subjectIndex,
			input.blueprint.key,
		);
		if (situation === 'pending') continue;
		const isAssessment = input.blueprint.kind === 'assessment';
		const baseDate = isAssessment
			? input.appliesAt!
			: new Date(input.blueprint.dueAt!);
		const submittedAt =
			input.blueprint.key === 'project'
				? new Date('2026-09-09T18:00:00-03:00')
				: new Date(
						baseDate.getTime() +
							(isAssessment
								? 70 * 60_000
								: situation === 'late'
									? 12 * 60 * 60_000
									: -24 * 60 * 60_000),
					);
		const grade =
			situation === 'zero'
				? '0.00'
				: situation === 'graded'
					? (6 + ((student.index + input.subjectIndex) % 9) * 0.5).toFixed(2)
					: null;
		const data = {
			submittedAt,
			grade,
			feedback:
				grade === null
					? null
					: grade === '0.00'
						? 'A entrega precisa ser refeita. Retome os conceitos e converse com o professor.'
						: 'Conceitos bem aplicados. Revise a justificativa das escolhas e a apresentação dos resultados.',
			createdAt: submittedAt,
		};
		const submission = await db.academicActivitySubmission.upsert({
			where: {
				activityId_studentProfileId: {
					activityId: input.activityId,
					studentProfileId: student.profileId,
				},
			},
			update: data,
			create: {
				...data,
				activityId: input.activityId,
				studentProfileId: student.profileId,
			},
		});
		if (student.index === 0)
			await seedFeedbackThread(
				db,
				submission.id,
				student.userId,
				input.professorUserId,
				submittedAt,
			);
	}
}

async function seedFeedbackThread(
	db: SeedDb,
	submissionId: number,
	studentUserId: number,
	professorUserId: number,
	submittedAt: Date,
) {
	const messages = [
		{
			authorUserId: studentUserId,
			body: '[Demonstração] Entrega registrada. Gostaria de orientação para melhorar minha justificativa.',
			createdAt: submittedAt,
		},
		{
			authorUserId: professorUserId,
			body: '[Demonstração] Revise os exemplos discutidos em aula e explique cada decisão no relatório.',
			createdAt: new Date(submittedAt.getTime() + 60 * 60_000),
		},
	];
	for (const data of messages) {
		const existing = await db.academicActivitySubmissionComment.findFirst({
			where: { submissionId, authorUserId: data.authorUserId, body: data.body },
		});
		if (!existing)
			await db.academicActivitySubmissionComment.create({
				data: { ...data, submissionId },
			});
	}
}
