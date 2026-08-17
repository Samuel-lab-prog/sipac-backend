import { withRequestCache } from '@GenericSubdomains/utils/requests-handling/request-caching/requestCache';
import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { UserRole, UserStatus } from '../ports/models';

export type UserBasicInfo = {
	exists: boolean;
	id: number;
	status: UserStatus;
	role: UserRole;
	nickname: string;
	avatarUrl?: string | null;
};

export type ClientAuthCredentials = {
	id: number;
	role: UserRole;
	email: string;
	status: UserStatus;
	passwordHash: string;
};

export interface UsersPublicContract {
	selectUserBasicInfo(userId: number): Promise<UserBasicInfo>;
	selectUsersBasicInfo(userIds: number[]): Promise<UserBasicInfo[]>;
	selectAuthUserByEmail(email: string): Promise<ClientAuthCredentials | null>;
}

async function selectUserBasicInfo(userId: number) {
	return await withRequestCache(`users.basic:${userId}`, () =>
		withPrismaErrorHandling(async () => {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					status: true,
					role: true,
					nickname: true,
					avatarUrl: true,
				},
			});

			if (!user) {
				return {
					exists: false,
					id: -1,
					status: 'banned' as const,
					role: 'author' as const,
					nickname: '',
					avatarUrl: null,
				};
			}

			return {
				exists: true,
				id: user.id,
				status: user.status,
				role: user.role,
				nickname: user.nickname,
				avatarUrl: user.avatarUrl,
			};
		}),
	);
}

async function selectUsersBasicInfo(
	userIds: number[],
): Promise<UserBasicInfo[]> {
	const ids = userIds.map(Number);
	const uniqueIds = Array.from(new Set(ids));
	if (uniqueIds.length === 0) return [];

	const cacheKey = `users.basic.batch:${uniqueIds.sort((a, b) => a - b).join(',')}`;

	const usersById = await withRequestCache(cacheKey, () =>
		withPrismaErrorHandling(async () => {
			const users = await prisma.user.findMany({
				where: { id: { in: uniqueIds }, deletedAt: null },
				select: {
					id: true,
					status: true,
					role: true,
					nickname: true,
					avatarUrl: true,
				},
			});

			return new Map(
				users.map((user) => [
					user.id,
					{
						exists: true,
						id: user.id,
						status: user.status,
						role: user.role,
						nickname: user.nickname,
						avatarUrl: user.avatarUrl,
					} satisfies UserBasicInfo,
				]),
			);
		}),
	);

	return ids.map((id) => {
		const cached = usersById.get(id);
		if (cached) return cached;

		return {
			exists: false,
			id: -1,
			status: 'banned' as const,
			role: 'author' as const,
			nickname: '',
			avatarUrl: null,
		};
	});
}

function selectAuthUserByEmail(
	email: string,
): Promise<ClientAuthCredentials | null> {
	const normalizedEmail = email.trim().toLowerCase();
	const key = `users.auth:${normalizedEmail}`;
	return withRequestCache(key, () =>
		withPrismaErrorHandling(() =>
			prisma.user.findFirst({
				where: {
					email: { equals: normalizedEmail, mode: 'insensitive' },
					deletedAt: null,
				},
				select: {
					id: true,
					email: true,
					passwordHash: true,
					role: true,
					status: true,
				},
			}),
		),
	);
}

export const usersPublicContract: UsersPublicContract = {
	selectUserBasicInfo,
	selectUsersBasicInfo,
	selectAuthUserByEmail,
};
