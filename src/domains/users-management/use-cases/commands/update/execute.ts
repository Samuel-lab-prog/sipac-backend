import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type {
	CommandsRepository,
	UpdateUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanUpdateUser } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function updateUserFactory({ commandsRepository }: Dependencies) {
	return async function updateUser(params: UpdateUserParams): Promise<User> {
		assertCanUpdateUser({
			actorId: params.clientId,
			targetId: params.params.id,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});
		const result = await commandsRepository.updateUser(
			params.params.id,
			params.data,
		);

		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND') throw new NotFoundError('User not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to update user');
	};
}
