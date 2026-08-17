import type {
	CommandsRepository,
	CreateUserParams,
} from '../../../ports/commands';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import type { FullUser } from '../../../ports/models';
import {
	ConflictError,
	UnknownError,
	UnprocessableEntityError,
} from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

export function createUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(
		params: CreateUserParams,
	): Promise<FullUser> {
		const { data } = params;
		const hashedPassword = await hashServices.hash(data.password);
		const result = await commandsRepository.insertUser({
			...data,
			passwordHash: hashedPassword,
		});

		if (result.ok) return result.data;
		if (result.code === 'VALIDATION')
			throw new UnprocessableEntityError(
				result.message ?? 'Invalid user data provided',
			);
		if (result.code !== 'CONFLICT')
			throw new UnknownError(result.message ?? 'Failed to create user');
		if (result.message?.includes('nickname'))
			throw new ConflictError('Nickname already in use');
		if (result.message?.includes('email'))
			throw new ConflictError('Email already in use');
		throw new UnknownError(
			result.message ?? 'Failed to create user due to conflict',
		);
	};
}
