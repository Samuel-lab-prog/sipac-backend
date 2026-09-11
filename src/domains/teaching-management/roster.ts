import { prisma } from '@Prisma';
import { UnprocessableEntityError } from '@DomainError';
import type { Static } from 'elysia';
import type * as schema from './schemas';
import { requireClass, requireLesson, requireActivity } from './access';

export async function roster(professorId: number, classId: number, query: { page?: number; q?: string; lessonId?: number; activityId?: number }) {
	await requireClass(professorId, classId);
	if (query.lessonId && (await requireLesson(professorId, query.lessonId)).classOfferingId !== classId) throw new UnprocessableEntityError('Aula de outra turma.');
	if (query.activityId && (await requireActivity(professorId, query.activityId)).classOfferingId !== classId) throw new UnprocessableEntityError('Atividade de outra turma.');
	const page = query.page ?? 1;
	const where = { status: 'active', classOfferingId: classId, studentProfile: { user: { name: { contains: query.q?.trim() ?? '', mode: 'insensitive' as const } } } };
	const [rows, total] = await prisma.$transaction([
			prisma.enrollment.findMany({ where, select: { studentProfile: { select: { id: true, academicId: true, user: { select: { name: true } }, attendanceRecords: { where: { classSessionId: query.lessonId ?? -1 }, select: { status: true } }, activitySubmissions: { where: { activityId: query.activityId ?? -1 }, select: { id: true, submittedAt: true, grade: true, feedback: true, attachments: { select: { id: true, fileName: true, fileUrl: true } } } } } } }, orderBy: [{ studentProfile: { user: { name: 'asc' } } }, { id: 'asc' }], take: 25, skip: (page - 1) * 25 }),
		prisma.enrollment.count({ where }),
	]);
	const items = rows.map(({ studentProfile: s }) => { const submission = s.activitySubmissions[0]; return { id: s.id, academicId: s.academicId, name: s.user.name, attendance: s.attendanceRecords[0]?.status ?? null, submission: submission ? { ...submission, grade: submission.grade === null ? null : Number(submission.grade) } : null }; });
	return { items, total, page, pageSize: 25 };
}
export async function markAttendance(professorId: number, lessonId: number, body: Static<typeof schema.attendanceBody>) {
	const lesson = await requireLesson(professorId, lessonId);
	if (['cancelled', 'rescheduled', 'missed'].includes(lesson.status) || lesson.startsAt > new Date()) throw new UnprocessableEntityError('Registre presença apenas em aulas iniciadas e não canceladas, remarcadas ou não realizadas.');
	const ids = body.records.map((record) => record.studentProfileId);
	if (new Set(ids).size !== ids.length) throw new UnprocessableEntityError('Há alunos repetidos na chamada.');
	await prisma.$transaction(async (tx) => {
		const count = await tx.enrollment.count({ where: { classOfferingId: lesson.classOfferingId, status: 'active', studentProfileId: { in: ids } } });
		if (count !== ids.length) throw new UnprocessableEntityError('A chamada deve conter apenas alunos com matrícula ativa nesta turma.');
		await Promise.all(body.records.map((record) => tx.attendanceRecord.upsert({ where: { classSessionId_studentProfileId: { classSessionId: lessonId, studentProfileId: record.studentProfileId } }, create: { ...record, classSessionId: lessonId, markedByProfessorProfileId: professorId }, update: { status: record.status, markedByProfessorProfileId: professorId } })));
	});
	return { success: true };
}
export async function grade(professorId: number, activityId: number, body: Static<typeof schema.gradeBody>) {
	const activity = await requireActivity(professorId, activityId);
	if (body.grade !== null && (activity.maxGrade === null || body.grade > activity.maxGrade)) throw new UnprocessableEntityError('A nota deve respeitar a nota máxima definida na atividade.');
	await prisma.$transaction(async (tx) => {
		if (!await tx.enrollment.count({ where: { classOfferingId: activity.classOfferingId, studentProfileId: body.studentProfileId, status: 'active' } })) throw new UnprocessableEntityError('Aluno sem matrícula ativa nesta turma.');
		await tx.academicActivitySubmission.upsert({ where: { activityId_studentProfileId: { activityId, studentProfileId: body.studentProfileId } }, create: { ...body, activityId }, update: { grade: body.grade, feedback: body.feedback } });
	});
	return { success: true };
}
