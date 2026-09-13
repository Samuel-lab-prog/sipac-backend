import { prisma } from '@Prisma';
import { NotFoundError } from '@DomainError';
import type { Prisma } from '@PrismaGenerated/client';
import { accountSelect } from './selects';
import type { UserFilters } from './schemas';

const missingProfile: Prisma.UserWhereInput = {
	OR: [
		{ role: 'professor', professorProfile: { is: null } },
		{ role: 'staff', staffProfile: { is: null } },
		{ role: 'student', status: 'active', studentProfile: { is: null } },
	],
};
const unassignedProfessor: Prisma.UserWhereInput = {
	role: 'professor',
	professorProfile: { is: { teachingAssignments: { none: {} } } },
};

export function userWhere(filters: UserFilters): Prisma.UserWhereInput {
	return {
		deletedAt: null,
		AND: [
			...(filters.team
				? [
						{
							role: { in: ['professor', 'staff', 'admin'] },
						} satisfies Prisma.UserWhereInput,
					]
				: []),
			...(filters.role ? [{ role: filters.role }] : []),
			...(filters.status ? [{ status: filters.status }] : []),
			...(filters.q?.trim()
				? [
						{
							OR: ['name', 'email', 'nickname'].map((field) => ({
								[field]: { contains: filters.q!.trim(), mode: 'insensitive' },
							})),
						},
					]
				: []),
			...(filters.issue === 'missing-profile' ? [missingProfile] : []),
			...(filters.issue === 'unassigned-professor'
				? [unassignedProfessor]
				: []),
		],
	};
}

export async function listUsers(filters: UserFilters) {
	const page = filters.page ?? 1;
	const where = userWhere(filters);
	const [items, total] = await prisma.$transaction([
		prisma.user.findMany({
			where,
			select: accountSelect,
			orderBy: [{ name: 'asc' }, { id: 'asc' }],
			skip: (page - 1) * 20,
			take: 20,
		}),
		prisma.user.count({ where }),
	]);
	return { items, total, page, pageSize: 20 };
}

export async function detail(id: number) {
	const user = await prisma.user.findFirst({
		where: { id, deletedAt: null },
		select: accountSelect,
	});
	if (!user) throw new NotFoundError('Usuário não encontrado.');
	return user;
}

export function departments() {
	return prisma.department.findMany({
		select: { id: true, name: true, code: true },
		orderBy: { name: 'asc' },
	});
}

export async function overview() {
	const [roles, statuses, incomplete, unassigned, classesWithoutProfessor] =
		await prisma.$transaction([
			prisma.user.groupBy({
				by: ['role'],
				where: { deletedAt: null },
				_count: { _all: true },
			}),
			prisma.user.groupBy({
				by: ['status'],
				where: { deletedAt: null },
				_count: { _all: true },
			}),
			prisma.user.count({ where: { deletedAt: null, ...missingProfile } }),
			prisma.user.count({ where: { deletedAt: null, ...unassignedProfessor } }),
			prisma.classOffering.count({
				where: { teachingAssignments: { none: {} } },
			}),
		]);
	return {
		roles: Object.fromEntries(roles.map((r) => [r.role, r._count._all])),
		statuses: Object.fromEntries(
			statuses.map((r) => [r.status, r._count._all]),
		),
		incomplete,
		unassigned,
		classesWithoutProfessor,
	};
}

export function unassignedClasses() {
	return prisma.classOffering.findMany({
		where: { teachingAssignments: { none: {} } },
		select: {
			id: true,
			title: true,
			code: true,
			academicPeriod: { select: { code: true } },
		},
		orderBy: [{ year: 'desc' }, { id: 'asc' }],
	});
}
