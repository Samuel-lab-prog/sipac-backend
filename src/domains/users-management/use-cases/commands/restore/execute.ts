import { NotFoundError } from '@DomainError';
import type {
	CommandsRepository,
	RestoreUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanRestoreUser } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function restoreUserFactory({ commandsRepository }: Dependencies) {
	return async function restoreUser(params: RestoreUserParams): Promise<User> {
		assertCanRestoreUser({
			actorId: params.clientId,
			targetId: params.id,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});
		const result = await commandsRepository.restoreUser(params.id);
		if (result.ok) return result.data;
		throw new NotFoundError('User not found');
	};
}
