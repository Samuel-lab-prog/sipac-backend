import { ForbiddenError, NotFoundError } from '@DomainError';
import type { User } from '../../../ports/models';
import type { QueriesRepository } from '../../../ports/queries';
import { assertCanAccessUser } from '../../../use-cases/commands/policies';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function getUserByIdFactory({ queriesRepository }: Dependencies) {
	return async function getUserById(params: {
		id: number;
		clientId: number;
		clientRole: string;
		clientStatus: string;
	}): Promise<User> {
		assertCanAccessUser(params.clientRole, params.clientStatus);
		const user = await queriesRepository.selectUserById(params.id);
		if (user) return user;
		throw new NotFoundError('User not found');
	};
}
