import { prisma } from '@Prisma';
import { withPrismaErrorHandling, withPrismaResult } from '@PrismaErrorHandler';
import type { UserCreateInput } from '@PrismaGenerated/models';
import type { CommandResult } from '@SharedKernel/types';
import type { CommandsRepository } from '../../ports/commands';
import type {
	CreateUserDB,
	StudentRegistration,
	User,
} from '../../ports/models';
import { userSelect } from './selects';

function normalizeDocument(value: string) {
	return value.replace(/\D/g, '');
}

function conflictResult(field: string): CommandResult<User> {
	return {
		ok: false,
		data: null,
		code: 'CONFLICT',
		message: `${field} is already in use`,
	};
}

function toPrismaCreateInput(user: CreateUserDB): UserCreateInput {
	return {
		nickname: user.nickname,
		name: user.name,
		email: user.email,
		passwordHash: user.passwordHash,
		rg: normalizeDocument(user.rg),
		cpf: normalizeDocument(user.cpf),
		avatarUrl: user.avatarUrl ?? null,
		...(user.role !== undefined && { role: user.role }),
		...(user.status !== undefined && { status: user.status }),
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

function selectLastStudentRegistrationAcademicId() {
	return withPrismaErrorHandling(() =>
		prisma.studentRegistration.findFirst({
			orderBy: { academicId: 'desc' },
			select: { academicId: true },
		}),
	).then((registration) => registration?.academicId ?? null);
}

function insertStudentAccount(
	user: CreateUserDB,
	registration: Omit<StudentRegistration, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<CommandResult<User>> {
	return prisma.$transaction(async (tx) => {
		const normalizedCpf = normalizeDocument(user.cpf);
		const normalizedRg = normalizeDocument(user.rg);
		const normalizedAcademicId = registration.academicId;

		const existingEmail = await tx.user.findUnique({
			where: { email: user.email },
			select: { id: true },
		});
		if (existingEmail) return conflictResult('Email');

		const existingNickname = await tx.user.findUnique({
			where: { nickname: user.nickname },
			select: { id: true },
		});
		if (existingNickname) return conflictResult('Nickname');

		const existingCpf = await tx.user.findUnique({
			where: { cpf: normalizedCpf },
			select: { id: true },
		});
		if (existingCpf) return conflictResult('CPF');

		const existingRg = await tx.user.findUnique({
			where: { rg: normalizedRg },
			select: { id: true },
		});
		if (existingRg) return conflictResult('RG');

		const existingAcademicId = await tx.studentRegistration.findUnique({
			where: { academicId: normalizedAcademicId },
			select: { id: true },
		});
		if (existingAcademicId) return conflictResult('Academic ID');

		const existingRegistrationCpf = await tx.studentRegistration.findUnique({
			where: { cpf: normalizedCpf },
			select: { id: true },
		});
		if (existingRegistrationCpf) return conflictResult('Registration CPF');

		const createdUser = await tx.user.create({
			data: toPrismaCreateInput(user),
			select: userSelect,
		});

		await tx.studentRegistration.create({
			data: {
				...registration,
				cpf: normalizedCpf,
				userId: createdUser.id,
			},
		});

		return {
			ok: true,
			data: createdUser,
		} satisfies CommandResult<User>;
	});
}

function updateUser(id: number, user: Partial<CreateUserDB>) {
	return withPrismaResult(() =>
		prisma.user.update({
			where: { id },
			data: {
				...(user.nickname !== undefined && { nickname: user.nickname }),
				...(user.name !== undefined && { name: user.name }),
				...(user.email !== undefined && { email: user.email }),
				...(user.rg !== undefined && { rg: normalizeDocument(user.rg) }),
				...(user.cpf !== undefined && { cpf: normalizeDocument(user.cpf) }),
				...(user.role !== undefined && { role: user.role }),
				...(user.status !== undefined && { status: user.status }),
				...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
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
				...(user.rg !== undefined && { rg: normalizeDocument(user.rg) }),
				...(user.cpf !== undefined && { cpf: normalizeDocument(user.cpf) }),
				...(user.role !== undefined && { role: user.role }),
				...(user.status !== undefined && { status: user.status }),
				...(user.avatarUrl !== undefined && { avatarUrl: user.avatarUrl }),
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
	selectLastStudentRegistrationAcademicId,
	insertStudentAccount,
	updateUser,
	updateCurrentUser,
	getUserPasswordHashById,
	deleteUser,
	restoreUser,
};
