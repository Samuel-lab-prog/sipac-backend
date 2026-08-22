import { prisma } from '@Prisma';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/queries';
import { userSelect } from '../commands-repository/selects';

function selectUsers(params: {
	searchTerm?: string;
	role?: 'student' | 'professor' | 'staff' | 'admin';
	status?: 'active' | 'blocked' | 'suspended';
	deleted?: boolean;
	campus?: string;
	department?: string;
	course?: string;
	limit: number;
	cursor?: number;
}) {
	return withPrismaErrorHandling(async () => {
		const where = {
			...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
			...(params.searchTerm && {
				OR: [
					{
						name: { contains: params.searchTerm, mode: 'insensitive' as const },
					},
					{
						email: {
							contains: params.searchTerm,
							mode: 'insensitive' as const,
						},
					},
					{
						nickname: {
							contains: params.searchTerm,
							mode: 'insensitive' as const,
						},
					},
					{ rg: { contains: params.searchTerm, mode: 'insensitive' as const } },
					{
						cpf: { contains: params.searchTerm, mode: 'insensitive' as const },
					},
				],
			}),
			...(params.role ? { role: params.role } : {}),
			...(params.status ? { status: params.status } : {}),
			...(params.campus
				? { campus: { contains: params.campus, mode: 'insensitive' as const } }
				: {}),
			...(params.department
				? {
						department: {
							contains: params.department,
							mode: 'insensitive' as const,
						},
					}
				: {}),
			...(params.course
				? { course: { contains: params.course, mode: 'insensitive' as const } }
				: {}),
		};

		const users = await prisma.user.findMany({
			where,
			take: params.limit + 1,
			...(params.cursor && {
				cursor: { id: params.cursor },
				skip: 1,
			}),
			orderBy: { id: 'desc' },
			select: userSelect,
		});

		const hasMore = users.length > params.limit;
		const items = hasMore ? users.slice(0, params.limit) : users;

		return {
			users: items,
			hasMore,
			nextCursor: items.at(-1)?.id,
		};
	});
}

function selectUserById(id: number) {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where: { id },
			select: userSelect,
		}),
	);
}

export const queriesRepository: QueriesRepository = {
	selectUsers,
	selectUserById,
};
