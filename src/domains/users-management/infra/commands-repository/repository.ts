import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { UserCreateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/Types';
import type { CommandsRepository } from '../../ports/commands';
import type { CreateUserDB, User } from '../../ports/models';

function toPrismaCreateInput(user: CreateUserDB): UserCreateInput {
	return {
		nickname: user.nickname,
		name: user.name,
		email: user.email,
		passwordHash: user.passwordHash,
		bio: user.bio,
	};
}

function insertUser(user: CreateUserDB): Promise<CommandResult<User>> {
	return withPrismaResult(() =>
		prisma.user.create({
			data: toPrismaCreateInput(user),
			select: {
				id: true,
				name: true,
				email: true,
				createdAt: true,
				updatedAt: true,
			},
		}),
	);
}

export const commandsRepository: CommandsRepository = {
	insertUser,
};
