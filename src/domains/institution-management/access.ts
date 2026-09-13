import { prisma } from '@Prisma';
import { ForbiddenError, NotFoundError } from '@DomainError';
export type Actor = {
	clientId: number;
	clientRole: string;
	clientStatus: string;
};
export async function activeAccount(actor: Actor) {
	const user = await prisma.user.findFirst({
		where: { id: actor.clientId, status: 'active', deletedAt: null },
		select: {
			id: true,
			name: true,
			email: true,
			avatarUrl: true,
			role: true,
			campusId: true,
			campus: { include: { institution: true } },
			staffProfile: {
				include: { department: { select: { name: true, code: true } } },
			},
		},
	});
	if (!user) throw new ForbiddenError('Sua conta precisa estar ativa.');
	return user;
}
export function requireManager(user: { role: string }) {
	if (!['admin', 'staff'].includes(user.role))
		throw new ForbiddenError('Esta ação pertence à gestão acadêmica.');
}
export function requireSameCampus(expected: number, actual: number) {
	if (expected !== actual) throw new NotFoundError('Registro não encontrado.');
}
