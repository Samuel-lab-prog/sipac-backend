import { prisma } from '@Prisma';
import { UnprocessableEntityError } from '@DomainError';
import { assignedTo, requireClass } from './access';
import { classSelect, lessonSelect, activitySelect } from './selects';
import { studentDashboardPlanSelect } from '../academic-management/infra/commands-repository/student-dashboard-selects';

type Filters = { page?: number; q?: string; classId?: number; from?: string; to?: string };
const pageSize = 25;
function paging(query: Filters) { const page = query.page ?? 1; return { skip: (page - 1) * pageSize, take: pageSize }; }
function result<T>(items: T[], total: number, query: Filters) { return { items, total, page: query.page ?? 1, pageSize }; }
export async function classes(professorId: number, query: Filters) {
	const where = { ...assignedTo(professorId), title: { contains: query.q?.trim() ?? '', mode: 'insensitive' as const } };
	const [items, total] = await prisma.$transaction([prisma.classOffering.findMany({ where, select: classSelect, orderBy: [{ year: 'desc' }, { title: 'asc' }, { id: 'asc' }], ...paging(query) }), prisma.classOffering.count({ where })]);
	return result(items, total, query);
}
export async function detail(professorId: number, classId: number) {
	await requireClass(professorId, classId);
	return prisma.classOffering.findUniqueOrThrow({ where: { id: classId }, select: { ...classSelect, coursePlan: { select: studentDashboardPlanSelect } } });
}
export async function overview(professorId: number) {
	const scope = { classOffering: assignedTo(professorId) };
	const now = new Date();
	const [profile, classCount, students, pendingGrades, lessons] = await Promise.all([
		prisma.professorProfile.findUniqueOrThrow({ where: { id: professorId }, select: { registryCode: true, title: true, workload: true, department: { select: { name: true } }, user: { select: { name: true, email: true } } } }),
		prisma.classOffering.count({ where: assignedTo(professorId) }),
		prisma.enrollment.count({ where: { ...scope, status: 'active' } }),
		prisma.academicActivitySubmission.count({ where: { activity: scope, grade: null, submittedAt: { not: null } } }),
		prisma.classSession.findMany({ where: { ...scope, startsAt: { gte: now }, status: 'scheduled' }, select: lessonSelect, orderBy: [{ startsAt: 'asc' }, { id: 'asc' }], take: 5 }),
	]);
	return { profile, classCount, students, pendingGrades, lessons };
}
export async function lessons(professorId: number, query: Filters) {
	if (query.classId) await requireClass(professorId, query.classId);
	if (!!query.from !== !!query.to || (query.from && query.to && (Date.parse(query.to) <= Date.parse(query.from) || Date.parse(query.to) - Date.parse(query.from) > 62 * 86400000))) throw new UnprocessableEntityError('Informe um intervalo válido de até 62 dias.');
	const where = { classOffering: assignedTo(professorId), classOfferingId: query.classId, ...(query.from ? { startsAt: { gte: new Date(query.from), lt: new Date(query.to!) } } : {}) };
	const [items, total] = await prisma.$transaction([prisma.classSession.findMany({ where, select: lessonSelect, orderBy: [{ startsAt: query.from ? 'asc' : 'desc' }, { id: 'asc' }], ...paging(query) }), prisma.classSession.count({ where })]);
	return result(items, total, query);
}
export async function activities(professorId: number, query: Filters) {
	if (query.classId) await requireClass(professorId, query.classId);
	const where = { classOffering: assignedTo(professorId), classOfferingId: query.classId, title: { contains: query.q?.trim() ?? '', mode: 'insensitive' as const } };
	const [items, total] = await prisma.$transaction([prisma.academicActivity.findMany({ where, select: activitySelect, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], ...paging(query) }), prisma.academicActivity.count({ where })]);
	return result(items, total, query);
}
export async function materials(professorId: number, query: Filters) {
	const where = { classSession: { classOffering: assignedTo(professorId) }, title: { contains: query.q?.trim() ?? '', mode: 'insensitive' as const } };
	const [items, total] = await prisma.$transaction([prisma.classSessionMaterial.findMany({ where, select: { id: true, title: true, url: true, classSessionId: true, classSession: { select: { topic: true, classOfferingId: true, classOffering: { select: { title: true } } } } }, orderBy: { id: 'desc' }, ...paging(query) }), prisma.classSessionMaterial.count({ where })]);
	return result(items, total, query);
}
