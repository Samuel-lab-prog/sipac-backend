import { NotFoundError } from '@DomainError';
import type { GetUserByIdParams } from '../../../ports/commands';
import type { User } from '../../../ports/models';
import type { QueriesRepository } from '../../../ports/queries';
import { assertCanAccessUser } from '../../../use-cases/commands/policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getUserByIdFactory({ queriesRepository }: Dependencies) {
	return async function getUserById(params: GetUserByIdParams): Promise<User> {
		assertCanAccessUser({
			actorId: params.clientId,
			targetId: params.id,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});
		const user = await queriesRepository.selectUserById(params.id);
		if (user) return user;
		throw new NotFoundError('User not found');
	};
}
