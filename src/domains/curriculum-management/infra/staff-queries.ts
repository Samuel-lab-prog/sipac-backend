import { prisma } from '@Prisma';
import { NotFoundError } from '@DomainError';
import type { ClassOfferingGetPayload } from '../../../generic-subdomains/persistance/prisma/generated/models/ClassOffering';

const pageSize = 25;
const classSelect = {
	id: true,
	courseId: true,
	academicPeriodId: true,
	shift: true,
	term: true,
	year: true,
	code: true,
	title: true,
	course: { select: { id: true, name: true, code: true } },
	academicPeriod: {
		select: {
			id: true,
			code: true,
			year: true,
			term: true,
			startsAt: true,
			endsAt: true,
		},
	},
	_count: { select: { enrollments: { where: { status: 'active' } } } },
	teachingAssignments: {
		select: {
			professorProfile: {
				select: { id: true, user: { select: { name: true } } },
			},
		},
		orderBy: { id: 'asc' },
	},
} as const;
type ClassRow = ClassOfferingGetPayload<{ select: typeof classSelect }>;
function toSummary({ _count, teachingAssignments, ...row }: ClassRow) {
	return {
		...row,
		activeEnrollments: _count.enrollments,
		professors: teachingAssignments.map(({ professorProfile: p }) => ({
			id: p.id,
			name: p.user.name,
		})),
	};
}

export async function listStaffClasses(query: {
	page?: number;
	q?: string;
	academicPeriodId?: number;
	courseId?: number;
}) {
	const page = query.page ?? 1;
	const q = query.q?.trim();
	const where = {
		academicPeriodId: query.academicPeriodId,
		courseId: query.courseId,
		...(q
			? {
					OR: [
						{ title: { contains: q, mode: 'insensitive' as const } },
						{ code: { contains: q, mode: 'insensitive' as const } },
					],
				}
			: {}),
	};
	const [rows, total] = await prisma.$transaction([
		prisma.classOffering.findMany({
			where,
			select: classSelect,
			orderBy: [{ year: 'desc' }, { title: 'asc' }, { id: 'asc' }],
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.classOffering.count({ where }),
	]);
	return { items: rows.map(toSummary), total, page, pageSize };
}
export async function getStaffClass(id: number) {
	const row = await prisma.classOffering.findUnique({
		where: { id },
		select: classSelect,
	});
	if (!row) throw new NotFoundError('Turma não encontrada.');
	return toSummary(row);
}
export const listCourseOptions = () =>
	prisma.course.findMany({
		select: { id: true, name: true, code: true },
		orderBy: { name: 'asc' },
	});

export async function listStudentOptions(query: {
	page?: number;
	q?: string;
	courseId?: number;
}) {
	const page = query.page ?? 1;
	const q = query.q?.trim();
	const where = {
		status: 'active',
		user: {
			role: 'student' as const,
			status: { in: ['active' as const, 'pending' as const] },
		},
		AND: [
			...(query.courseId
				? [{ OR: [{ courseId: query.courseId }, { courseId: null }] }]
				: []),
			...(q
				? [
						{
							OR: [
								{ academicId: { contains: q, mode: 'insensitive' as const } },
								{
									user: { name: { contains: q, mode: 'insensitive' as const } },
								},
							],
						},
					]
				: []),
		],
	};
	const [rows, total] = await prisma.$transaction([
		prisma.studentProfile.findMany({
			where,
			select: {
				id: true,
				academicId: true,
				courseId: true,
				user: { select: { name: true } },
			},
			orderBy: [{ user: { name: 'asc' } }, { id: 'asc' }],
			take: pageSize,
			skip: (page - 1) * pageSize,
		}),
		prisma.studentProfile.count({ where }),
	]);
	return {
		items: rows.map(({ user, ...row }) => ({ ...row, name: user.name })),
		total,
		page,
		pageSize,
	};
}
export async function listProfessorOptions(query: {
	page?: number;
	q?: string;
}) {
	const page = query.page ?? 1;
	const where = {
		user: {
			role: 'professor' as const,
			status: 'active' as const,
			name: { contains: query.q?.trim() ?? '', mode: 'insensitive' as const },
		},
	};
	const [rows, total] = await prisma.$transaction([
		prisma.professorProfile.findMany({
			where,
			select: { id: true, user: { select: { name: true } } },
			orderBy: [{ user: { name: 'asc' } }, { id: 'asc' }],
			take: pageSize,
			skip: (page - 1) * pageSize,
		}),
		prisma.professorProfile.count({ where }),
	]);
	return {
		items: rows.map((row) => ({ id: row.id, name: row.user.name })),
		total,
		page,
		pageSize,
	};
}
export async function listRoster(
	classOfferingId: number,
	query: { page?: number; q?: string },
) {
	await getStaffClass(classOfferingId);
	const page = query.page ?? 1;
	const q = query.q?.trim();
	const where = {
		classOfferingId,
		...(q
			? {
					studentProfile: {
						OR: [
							{ academicId: { contains: q, mode: 'insensitive' as const } },
							{ user: { name: { contains: q, mode: 'insensitive' as const } } },
						],
					},
				}
			: {}),
	};
	const [rows, total] = await prisma.$transaction([
		prisma.enrollment.findMany({
			where,
			select: {
				id: true,
				studentProfileId: true,
				classOfferingId: true,
				status: true,
				studentProfile: {
					select: {
						id: true,
						academicId: true,
						courseId: true,
						user: { select: { name: true } },
					},
				},
			},
			orderBy: [{ studentProfile: { user: { name: 'asc' } } }, { id: 'asc' }],
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.enrollment.count({ where }),
	]);
	return {
		items: rows.map(({ studentProfile: { user, ...student }, ...row }) => ({
			...row,
			student: { ...student, name: user.name },
		})),
		total,
		page,
		pageSize,
	};
}
