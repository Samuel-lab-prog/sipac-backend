import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import type { HashServices } from '@SharedKernel/ports/hash-services';
import type {
	ChangePasswordParams,
	CommandsRepository,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanUpdateSelf } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

export function changePasswordFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function changePassword(
		params: ChangePasswordParams,
	): Promise<User> {
		assertCanUpdateSelf({
			actorId: params.clientId,
			targetId: params.clientId,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});

		const currentPasswordHash =
			await commandsRepository.getUserPasswordHashById(params.clientId);
		if (!currentPasswordHash) throw new ForbiddenError('User not found');

		const isPasswordValid = await hashServices.compare(
			params.data.currentPassword,
			currentPasswordHash,
		);
		if (!isPasswordValid) {
			throw new ForbiddenError('Current password does not match');
		}

		const newPasswordHash = await hashServices.hash(params.data.newPassword);
		const result = await commandsRepository.updateCurrentUser(params.clientId, {
			passwordHash: newPasswordHash,
			status: params.clientStatus === 'pending' ? 'active' : undefined,
		});

		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to change password');
	};
}
