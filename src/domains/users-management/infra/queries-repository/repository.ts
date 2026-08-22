import { prisma } from '@Prisma';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { QueriesRepository } from '../../ports/queries';

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
			select: {
				id: true,
				name: true,
				nickname: true,
				email: true,
				rg: true,
				cpf: true,
				role: true,
				status: true,
				avatarUrl: true,
				academicId: true,
				campus: true,
				department: true,
				course: true,
				admissionYear: true,
				createdAt: true,
				updatedAt: true,
				deletedAt: true,
				emailVerifiedAt: true,
			},
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
