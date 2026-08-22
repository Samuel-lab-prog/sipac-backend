import { ConflictError, UnknownError } from '@DomainError';
import type {
	CommandsRepository,
	UpdateCurrentUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanUpdateSelf } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function updateCurrentUserFactory({ commandsRepository }: Dependencies) {
	return async function updateCurrentUser(
		params: UpdateCurrentUserParams,
	): Promise<User> {
		assertCanUpdateSelf(params.clientStatus);
		const result = await commandsRepository.updateCurrentUser(
			params.clientId,
			params.data,
		);

		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to update user');
	};
}
