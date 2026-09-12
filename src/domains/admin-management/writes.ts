import {
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { BcryptHashService } from '@SharedKernel/infra/encrypting/bcrypt';
import type { Prisma } from '@PrismaGenerated/client';
import { requireActiveAdmin, withAccountLock, type Actor } from './access';
import { validateAccessChange } from './policies';
import { accountSelect } from './selects';
import type { AccessBody, ProfileBody, TeamBody } from './schemas';

async function normalizedWrite<T>(work: () => Promise<T>) {
	try {
		return await work();
	} catch (error) {
		if (error && typeof error === 'object' && 'code' in error) {
			if (error.code === 'P2002')
				throw new ConflictError(
					'E-mail, usuário, documento ou registro já cadastrado.',
				);
			if (error.code === 'P2003')
				throw new UnprocessableEntityError(
					'O departamento informado não existe.',
				);
		}
		throw error;
	}
}

async function saveProfessional(
	tx: Prisma.TransactionClient,
	userId: number,
	role: string,
	data: ProfileBody,
) {
	if (
		data.departmentId &&
		!(await tx.department.count({ where: { id: data.departmentId } }))
	)
		throw new UnprocessableEntityError('Departamento não encontrado.');
	if (role === 'professor') {
		const profile = {
			departmentId: data.departmentId,
			registryCode: data.registryCode?.trim() || null,
			title: data.title?.trim() || null,
			workload: data.workload,
		};
		await tx.professorProfile.upsert({
			where: { userId },
			create: { userId, ...profile },
			update: profile,
		});
	}
	if (role === 'staff')
		await tx.staffProfile.upsert({
			where: { userId },
			create: { userId, departmentId: data.departmentId },
			update: { departmentId: data.departmentId },
		});
}

export async function createTeam(actor: Actor, body: TeamBody) {
	const passwordHash = await BcryptHashService.hash(body.password);
	return normalizedWrite(() =>
		withAccountLock(async (tx) => {
			await requireActiveAdmin(tx, actor);
			const user = await tx.user.create({
				data: {
					name: body.name.trim(),
					nickname: body.nickname.trim(),
					email: body.email.trim().toLowerCase(),
					cpf: body.cpf,
					rg: body.rg,
					passwordHash,
					role: body.role,
					status: 'active',
					avatarUrl: null,
				},
			});
			await saveProfessional(tx, user.id, body.role, body);
			return tx.user.findUniqueOrThrow({
				where: { id: user.id },
				select: accountSelect,
			});
		}),
	);
}

export function saveProfile(actor: Actor, id: number, body: ProfileBody) {
	return normalizedWrite(() =>
		withAccountLock(async (tx) => {
			await requireActiveAdmin(tx, actor);
			const target = await tx.user.findFirst({
				where: { id, deletedAt: null },
				select: { role: true },
			});
			if (!target) throw new NotFoundError('Usuário não encontrado.');
			await tx.user.update({
				where: { id },
				data: {
					name: body.name.trim(),
					email: body.email.trim().toLowerCase(),
				},
			});
			await saveProfessional(tx, id, target.role, body);
			return tx.user.findUniqueOrThrow({
				where: { id },
				select: accountSelect,
			});
		}),
	);
}

export function saveAccess(actor: Actor, id: number, body: AccessBody) {
	return normalizedWrite(() =>
		withAccountLock(async (tx) => {
			await requireActiveAdmin(tx, actor);
			const target = await tx.user.findFirst({
				where: { id, deletedAt: null },
				include: {
					studentProfile: true,
					professorProfile: {
						include: {
							_count: {
								select: {
									teachingAssignments: true,
									markedAttendanceRecords: true,
									createdActivities: true,
								},
							},
						},
					},
				},
			});
			if (!target) throw new NotFoundError('Usuário não encontrado.');
			const activeAdmins = await tx.user.count({
				where: { role: 'admin', status: 'active', deletedAt: null },
			});
			const hasAcademicHistory =
				!!target.studentProfile ||
				Object.values(target.professorProfile?._count ?? {}).some(
					(count) => count > 0,
				);
			validateAccessChange({
				actorId: actor.clientId,
				targetId: id,
				currentRole: target.role,
				currentStatus: target.status,
				...body,
				activeAdmins,
				hasAcademicHistory,
				hasStudentProfile: !!target.studentProfile,
			});
			await tx.user.update({ where: { id }, data: body });
			if (body.role === 'professor')
				await tx.professorProfile.upsert({
					where: { userId: id },
					create: { userId: id },
					update: {},
				});
			if (body.role === 'staff')
				await tx.staffProfile.upsert({
					where: { userId: id },
					create: { userId: id },
					update: {},
				});
			return tx.user.findUniqueOrThrow({
				where: { id },
				select: accountSelect,
			});
		}),
	);
}
