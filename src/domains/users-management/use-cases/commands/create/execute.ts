import {
	ConflictError,
	UnprocessableEntityError,
	UnknownError,
} from '@DomainError';
import type { HashServices } from '@SharedKernel/ports/hash-services';
import type {
	CommandsRepository,
	CreateUserParams,
} from '../../../ports/commands';
import type { CreatedUser } from '../../../ports/models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	hashServices: HashServices;
}

function buildNextAcademicId(lastAcademicId: string | null) {
	const currentYear = new Date().getFullYear();
	const prefix = String(currentYear);

	if (!lastAcademicId || !lastAcademicId.startsWith(prefix)) {
		return `${prefix}000001`;
	}

	const currentSequence = Number(lastAcademicId.slice(prefix.length));
	const nextSequence = Number.isFinite(currentSequence)
		? currentSequence + 1
		: 1;

	return `${prefix}${String(nextSequence).padStart(6, '0')}`;
}

function requirePassword(password: string | undefined) {
	if (!password) {
		throw new UnprocessableEntityError(
			'Password is required for this user role',
		);
	}

	return password;
}

export function createUserFactory({
	commandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(
		params: CreateUserParams,
	): Promise<CreatedUser> {
		const role = params.data.role ?? 'student';
		const status = role === 'student' ? 'pending' : 'active';

		if (role === 'student') {
			const academicId = buildNextAcademicId(
				await commandsRepository.selectLastStudentRegistrationAcademicId(),
			);
			const hashedPassword = await hashServices.hash(academicId);
			const result = await commandsRepository.insertStudentAccount(
				{
					...params.data,
					role,
					status,
					passwordHash: hashedPassword,
				},
				{
					academicId,
					cpf: params.data.cpf,
					userId: null,
					activatedAt: null,
				},
			);

			if (!result.ok) {
				if (result.code === 'VALIDATION')
					throw new UnprocessableEntityError(
						result.message ?? 'Invalid user data',
					);
				if (result.code === 'CONFLICT')
					throw new ConflictError(result.message ?? 'User already exists');
				throw new UnknownError(result.message ?? 'Failed to create user');
			}

			return {
				...result.data,
				academicId,
			};
		}

		const hashedPassword = await hashServices.hash(
			requirePassword(params.data.password),
		);
		const result = await commandsRepository.insertUser({
			...params.data,
			role,
			status,
			passwordHash: hashedPassword,
		});

		if (!result.ok) {
			if (result.code === 'VALIDATION')
				throw new UnprocessableEntityError(
					result.message ?? 'Invalid user data',
				);
			if (result.code === 'CONFLICT')
				throw new ConflictError(result.message ?? 'User already exists');
			throw new UnknownError(result.message ?? 'Failed to create user');
		}

		return result.data;
	};
}
