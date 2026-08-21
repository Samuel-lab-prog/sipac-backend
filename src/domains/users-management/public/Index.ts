import { prisma } from '../../../generic-subdomains/persistance/prisma/prisma-client';
import { withPrismaErrorHandling } from '../../../generic-subdomains/persistance/utils/prisma-error-handler';

type UserRole = 'author' | 'moderator' | 'admin';
type UserStatus = 'active' | 'blocked' | 'suspended';

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
