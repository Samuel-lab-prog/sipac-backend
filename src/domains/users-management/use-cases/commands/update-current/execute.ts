import { ConflictError, ForbiddenError, UnknownError } from '@DomainError';
import type {
	CommandsRepository,
	UpdateCurrentUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanUpdateSelf } from '../policies';
import type { HashServices } from '@SharedKernel/ports/hash-services';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices?: HashServices;
}

export function updateCurrentUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function updateCurrentUser(
		params: UpdateCurrentUserParams,
	): Promise<User> {
		assertCanUpdateSelf({
			actorId: params.clientId,
			targetId: params.clientId,
			actorRole: params.clientRole,
			actorStatus: params.clientStatus,
		});
		const hash = params.data.currentPassword
			? await commandsRepository.getUserPasswordHashById(params.clientId)
			: null;
		if (
			params.data.currentPassword &&
			(!hash ||
				!hashServices ||
				!(await hashServices.compare(params.data.currentPassword, hash)))
		) {
			throw new ForbiddenError('Current password does not match');
		}
		const { currentPassword: _currentPassword, ...editableData } = params.data;
		const result = await commandsRepository.updateCurrentUser(
			params.clientId,
			editableData,
		);

		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to update user');
	};
}
