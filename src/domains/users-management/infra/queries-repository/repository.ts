import { prisma } from '@Prisma';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/queries';
import { userSelect } from '../commands-repository/selects';

function selectUsers(params: {
	searchTerm?: string;
	limit: number;
	cursor?: number;
}) {
	return withPrismaErrorHandling(async () => {
		const users = await prisma.user.findMany({
			where: {
				deletedAt: null,
				...(params.searchTerm && {
					OR: [
						{ name: { contains: params.searchTerm, mode: 'insensitive' } },
						{ email: { contains: params.searchTerm, mode: 'insensitive' } },
					],
				}),
			},
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

export const queriesRepository: QueriesRepository = {
	selectUsers,
};
