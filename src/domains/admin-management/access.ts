import { ForbiddenError, ConflictError, NotFoundError } from '@DomainError';
import { prisma } from '@Prisma';
import type { Prisma } from '@PrismaGenerated/client';

export type Actor = {
	clientId: number;
	clientRole: string;
	clientStatus: string;
};
export function assertAdmin(actor: Actor) {
	if (actor.clientRole !== 'admin' || actor.clientStatus !== 'active')
		throw new ForbiddenError(
			'Apenas administradores ativos podem acessar esta área.',
		);
}

// All access changes share one transaction lock, including the legacy deletion route.
export function withAccountLock<T>(
	work: (tx: Prisma.TransactionClient) => Promise<T>,
) {
	return prisma.$transaction(
		async (tx) => {
			await tx.$executeRaw`SELECT pg_advisory_xact_lock(72410931)`;
			return work(tx);
		},
		{ timeout: 15000 },
	);
}

export async function requireActiveAdmin(
	tx: Prisma.TransactionClient,
	actor: Actor,
) {
	assertAdmin(actor);
	const current = await tx.user.findUnique({
		where: { id: actor.clientId },
		select: { role: true, status: true, deletedAt: true },
	});
	if (
		!current ||
		current.deletedAt ||
		current.role !== 'admin' ||
		current.status !== 'active'
	)
		throw new ForbiddenError('Seu acesso administrativo não está mais ativo.');
}

export function assertCreateRole(actor: Actor, requestedRole = 'student') {
	if (
		actor.clientStatus !== 'active' ||
		!['admin', 'staff'].includes(actor.clientRole)
	)
		throw new ForbiddenError('Você não pode cadastrar usuários.');
	if (actor.clientRole === 'staff' && requestedRole !== 'student')
		throw new ForbiddenError(
			'A secretaria pode cadastrar alunos. A gestão de equipe e administradores pertence ao admin.',
		);
}

export function legacyRemoval<T>(
	actor: Actor,
	id: number,
	work: () => Promise<T>,
) {
	return withAccountLock(async (tx) => {
		const target = await tx.user.findUnique({
			where: { id },
			select: { role: true },
		});
		if (!target) throw new NotFoundError('Usuário não encontrado.');
		if (target.role === 'admin')
			throw new ConflictError(
				'Gerencie o acesso de administradores pela área administrativa.',
			);
		const current = await tx.user.findUnique({
			where: { id: actor.clientId },
			select: { role: true, status: true, deletedAt: true },
		});
		if (
			!current ||
			current.deletedAt ||
			current.status !== 'active' ||
			!['admin', 'staff'].includes(current.role)
		)
			throw new ForbiddenError('Você não pode gerenciar esta conta.');
		return work();
	});
}
