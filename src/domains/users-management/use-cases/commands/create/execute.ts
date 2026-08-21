import {
	ConflictError,
	UnprocessableEntityError,
	UnknownError,
} from '@DomainError';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import type {
	CommandsRepository,
	CreateUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

export function createUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(params: CreateUserParams): Promise<User> {
		const hashedPassword = await hashServices.hash(params.data.password);
		const result = await commandsRepository.insertUser({
			...params.data,
			passwordHash: hashedPassword,
		});

		if (result.ok) return result.data;
		if (result.code === 'VALIDATION')
			throw new UnprocessableEntityError(result.message ?? 'Invalid user data');
		if (result.code === 'CONFLICT')
			throw new ConflictError(result.message ?? 'User already exists');
		throw new UnknownError(result.message ?? 'Failed to create user');
	};
}
