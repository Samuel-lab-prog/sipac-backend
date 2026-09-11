import { ForbiddenError } from '@DomainError';

export function assertCanManageCurriculum(actor: {
	clientRole: string;
	clientStatus: string;
}) {
	if (
		actor.clientStatus !== 'active' ||
		!['staff', 'admin'].includes(actor.clientRole)
	) {
		throw new ForbiddenError(
			'Somente staff e administradores ativos podem gerenciar turmas e matrículas.',
		);
	}
}
