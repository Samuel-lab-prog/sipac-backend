import { NotFoundError } from '@DomainError';
import type { CommandsRepository, DeleteUserParams } from '../../../ports/commands';
import type { User } from '../../../ports/models';
import { assertCanDeleteUser } from '../policies';

interface Dependencies {
	commandsRepository: CommandsRepository;
}

export function deleteUserFactory({ commandsRepository }: Dependencies) {
	return async function deleteUser(params: DeleteUserParams): Promise<User> {
		assertCanDeleteUser(params.clientRole, params.clientStatus);
		const result = await commandsRepository.deleteUser(params.id);
		if (result.ok) return result.data;
		throw new NotFoundError('User not found');
	};
}
