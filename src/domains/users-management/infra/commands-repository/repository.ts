import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { UserCreateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/types';
import type { CommandsRepository } from '../../ports/commands';
import type { CreateUserDB, User } from '../../ports/models';

function toPrismaCreateInput(user: CreateUserDB): UserCreateInput {
	return {
		nickname: user.nickname,
		name: user.name,
		email: user.email,
		passwordHash: user.passwordHash,
		rg: user.rg,
		cpf: user.cpf,
		avatarUrl: user.avatarUrl ?? null,
		academicId: user.academicId ?? null,
		campus: user.campus ?? null,
		department: user.department ?? null,
		course: user.course ?? null,
		admissionYear: user.admissionYear ?? null,
	};
}

function insertUser(user: CreateUserDB): Promise<CommandResult<User>> {
	return withPrismaResult(() =>
		prisma.user.create({
			data: toPrismaCreateInput(user),
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
		}),
	);
}

export const commandsRepository: CommandsRepository = {
	insertUser,
};
