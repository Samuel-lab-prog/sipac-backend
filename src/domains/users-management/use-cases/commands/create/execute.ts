import {
	ConflictError,
	UnprocessableEntityError,
	UnknownError,
} from '@DomainError';
import type { AcademicCommandsRepository } from '@Domains/academic-management/ports/commands';
import type { HashServices } from '@SharedKernel/ports/hash-services';
import type {
	CommandsRepository,
	CreateUserParams,
} from '../../../ports/commands';
import type { User } from '../../../ports/models';

interface Dependencies {
	commandsRepository: CommandsRepository;
	academicCommandsRepository: AcademicCommandsRepository;
	hashServices: HashServices;
}

export function createUserFactory({
	commandsRepository,
	academicCommandsRepository,
	hashServices,
}: Dependencies) {
	return async function createUser(params: CreateUserParams): Promise<User> {
		const role = params.data.role ?? 'student';
		const status =
			params.data.status ?? (role === 'student' ? 'pending' : 'active');
		const academicId = params.data.academicId;
		const studentAcademicId = academicId ?? '';

		if (role === 'student' && !academicId) {
			throw new UnprocessableEntityError(
				'Academic ID is required for student accounts',
			);
		}

		const hashedPassword = await hashServices.hash(params.data.password);
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

		if (role === 'student') {
			const profileResult =
				await academicCommandsRepository.insertStudentProfile({
					userId: result.data.id,
					academicId: studentAcademicId,
					courseId: null,
					admissionYear: null,
					status: 'active',
				});

			if (!profileResult.ok) {
				throw new UnknownError(
					profileResult.message ?? 'Failed to create student profile',
				);
			}
		}

		return result.data;
	};
}
