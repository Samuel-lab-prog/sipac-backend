import { ConflictError, UnknownError } from '@DomainError';
import type {
	CommandsRepository,
	UpdateUserParams,
} from '../../../ports/commands';
import type { FullUser } from '../../../ports/models';
import { canUpdateData } from '../../policies/Policies';
import { ensureAllowedCdnUrl } from '@SharedKernel/validators/Url';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function updateUserFactory({ commandsRepository }: Dependencies) {
	return async function updateUser(
		params: UpdateUserParams,
	): Promise<FullUser> {
		const { targetId, data, requesterId, requesterStatus } = params;
		canUpdateData({
			requesterId,
			requesterStatus,
			targetId,
		});

		if (data.avatarUrl) {
			ensureAllowedCdnUrl(data.avatarUrl, 'avatarUrl');
		}

		const result = await commandsRepository.updateUser(targetId, data);

		if (result.ok) return result.data;
		if (result.code !== 'CONFLICT')
			throw new UnknownError('Failed to update user');
		if (result.message?.includes('nickname'))
			throw new ConflictError('Nickname already in use');
		if (result.message?.includes('email'))
			throw new ConflictError('Email already in use');
		throw new UnknownError('Failed to update user due to unknown conflict');
	};
}
