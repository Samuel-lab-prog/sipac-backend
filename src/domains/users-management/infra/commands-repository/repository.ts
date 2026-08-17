import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { UserCreateInput, UserUpdateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/commands';
import type {
	UpdateUserData,
	CreateUserDB,
	FullUser,
} from '../../ports/models';
import { fullUserSelect } from '../queries-repository/selects';

function toPrismaCreateInput(user: CreateUserDB): UserCreateInput {
	return {
		nickname: user.nickname,
		email: user.email,
		passwordHash: user.passwordHash,
		name: user.name,
		bio: user.bio,
		...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
	};
}

function toPrismaUpdateInput(data: UpdateUserData): UserUpdateInput {
	return {
		...(data.nickname !== undefined && { nickname: data.nickname }),
		...(data.name !== undefined && { name: data.name }),
		...(data.bio !== undefined && { bio: data.bio }),
		...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
	};
}

async function insertUser(
	user: CreateUserDB,
): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.create({
			data: toPrismaCreateInput(user),
			select: fullUserSelect,
		});
	});
}

async function updateUser(
	userId: number,
	userData: UpdateUserData,
): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.update({
			where: { id: userId, deletedAt: null },
			data: toPrismaUpdateInput(userData),
			select: fullUserSelect,
		});
	});
}

async function softDeleteUser(id: number): Promise<CommandResult<FullUser>> {
	return await withPrismaResult(() => {
		return prisma.user.update({
			where: { id, deletedAt: null },
			data: { deletedAt: new Date() },
			select: fullUserSelect,
		});
	});
}

export const commandsRepository: CommandsRepository = {
	insertUser,
	updateUser,
	softDeleteUser,
};
