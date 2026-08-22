import { ConflictError, UnknownError } from '@DomainError';
import type {
	CommandsRepository,
	SetAvatarParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanUpdateSelf } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function setAvatarFactory({ commandsRepository }: Dependencies) {
	return async function setAvatar(params: SetAvatarParams): Promise<User> {
		assertCanUpdateSelf({
			actorId: params.clientId,
			targetId: params.clientId,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});

		const result = await commandsRepository.updateCurrentUser(params.clientId, {
			avatarUrl: params.data.avatarUrl,
		});

		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to update avatar');
	};
}
