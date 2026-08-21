import { prisma } from '@Prisma/PrismaClient';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';
import type { UserRole, UserStatus } from '@PrismaGenerated/enums';

export type UsersPublicContract = {
	selectAuthUserByEmail(email: string): Promise<{
		id: number;
		role: UserRole;
		email: string;
		status: UserStatus;
		passwordHash: string;
	} | null>;
	selectUserBasicInfo(userId: number): Promise<{
		exists: boolean;
		id: number;
		status: UserStatus;
		role: UserRole;
		nickname: string;
		avatarUrl?: string | null;
	}>;
	selectUsersBasicInfo(userIds: number[]): Promise<
		Array<{
			exists: boolean;
			id: number;
			status: UserStatus;
			role: UserRole;
			nickname: string;
			avatarUrl?: string | null;
		}>
	>;
};

export const usersPublicContract: UsersPublicContract = {
	selectUserBasicInfo: async (userId: number) => {
		const user = await withPrismaErrorHandling(() =>
			prisma.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					status: true,
					role: true,
					nickname: true,
					avatarUrl: true,
				},
			}),
		);

		if (!user)
			return {
				exists: false,
				id: -1,
				status: 'blocked',
				role: 'author',
				nickname: '',
				avatarUrl: null,
			};

		return {
			exists: true,
			id: user.id,
			status: user.status,
			role: user.role,
			nickname: user.nickname,
			avatarUrl: user.avatarUrl,
		};
	},
	selectUsersBasicInfo: (userIds: number[]) =>
		Promise.all(
			userIds.map((id) => usersPublicContract.selectUserBasicInfo(id)),
		),
	selectAuthUserByEmail: (email: string) =>
		withPrismaErrorHandling(() =>
			prisma.user.findFirst({
				where: { email, deletedAt: null },
				select: {
					id: true,
					role: true,
					email: true,
					status: true,
					passwordHash: true,
				},
			}),
		),
};
