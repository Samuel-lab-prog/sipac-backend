import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { UserCreateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/types';
import type { CommandsRepository } from '../../ports/commands';
import type { CreateUserDB, User } from '../../ports/models';
import { userSelect } from './selects';

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
			select: userSelect,
		}),
	);
}

function updateUser(id: number, user: Partial<CreateUserDB>) {
	return withPrismaResult(() =>
		prisma.user.update({
			where: { id },
			data: {
				...(user.nickname !== undefined && { nickname: user.nickname }),
				...(user.name !== undefined && { name: user.name }),
				...(user.email !== undefined && { email: user.email }),
				...(user.rg !== undefined && { rg: user.rg }),
				...(user.cpf !== undefined && { cpf: user.cpf }),
				...(user.role !== undefined && { role: user.role }),
				...(user.status !== undefined && { status: user.status }),
				...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
				...(user.academicId !== undefined && {
					academicId: user.academicId,
				}),
				...(user.campus !== undefined && { campus: user.campus }),
				...(user.department !== undefined && {
					department: user.department,
				}),
				...(user.course !== undefined && { course: user.course }),
				...(user.admissionYear !== undefined && {
					admissionYear: user.admissionYear,
				}),
			},
			select: userSelect,
		}),
	);
}

function updateCurrentUser(clientId: number, user: Partial<CreateUserDB>) {
	return withPrismaResult(() =>
		prisma.user.update({
			where: { id: clientId },
			data: {
				...(user.nickname !== undefined && { nickname: user.nickname }),
				...(user.name !== undefined && { name: user.name }),
				...(user.email !== undefined && { email: user.email }),
				...(user.rg !== undefined && { rg: user.rg }),
				...(user.cpf !== undefined && { cpf: user.cpf }),
				...(user.role !== undefined && { role: user.role }),
				...(user.status !== undefined && { status: user.status }),
				...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
				...(user.academicId !== undefined && {
					academicId: user.academicId,
				}),
				...(user.campus !== undefined && { campus: user.campus }),
				...(user.department !== undefined && {
					department: user.department,
				}),
				...(user.course !== undefined && { course: user.course }),
				...(user.admissionYear !== undefined && {
					admissionYear: user.admissionYear,
				}),
			},
			select: userSelect,
		}),
	);
}

async function getUserPasswordHashById(id: number) {
	const user = await prisma.user.findUnique({
		where: { id },
		select: { passwordHash: true },
	});
	return user?.passwordHash ?? null;
}

function deleteUser(id: number) {
	return withPrismaResult(() =>
		prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
			select: userSelect,
		}),
	);
}

function restoreUser(id: number) {
	return withPrismaResult(() =>
		prisma.user.update({
			where: { id },
			data: { deletedAt: null },
			select: userSelect,
		}),
	);
}

export const commandsRepository: CommandsRepository = {
	insertUser,
	updateUser,
	updateCurrentUser,
	getUserPasswordHashById,
	deleteUser,
	restoreUser,
};
