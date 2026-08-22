import { NotFoundError } from '@DomainError';
import type { User, UserRole, UserStatus } from '../../../ports/models';
import type { QueriesRepository } from '../../../ports/queries';
import { assertUserPolicy } from '../../../use-cases/commands/policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getCurrentUserFactory({ queriesRepository }: Dependencies) {
	return async function getCurrentUser(params: {
		clientId: number;
		clientRole: UserRole;
		clientStatus: UserStatus;
	}): Promise<User> {
		assertUserPolicy('view_self', {
			actorId: params.clientId,
			targetId: params.clientId,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});
		const user = await queriesRepository.selectUserById(params.clientId);
		if (user) return user;
		throw new NotFoundError('User not found');
	};
}
