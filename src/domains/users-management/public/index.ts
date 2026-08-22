import { prisma } from '@Prisma';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { UserRole, UserStatus } from '../ports/models';

export type { UserRole, UserStatus } from '../ports/models';

export type UsersPublicContract = {
	selectAuthUserByEmail(email: string): Promise<{
		id: number;
		role: UserRole;
		email: string;
		status: UserStatus;
		passwordHash: string;
	} | null>;
};

export const usersPublicContract: UsersPublicContract = {
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
