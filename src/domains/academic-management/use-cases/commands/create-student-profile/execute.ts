import { ConflictError, UnknownError } from '@DomainError';
import type {
	AcademicCommandsRepository,
	CreateStudentProfileUseCaseParams,
} from '../../../ports/commands';
import type { StudentProfile } from '../../../ports/models';
import { assertCanCreateStudentProfile } from '../policies';

interface Dependencies {
	commandsRepository: AcademicCommandsRepository;
}

export function createStudentProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function createStudentProfile(
		params: CreateStudentProfileUseCaseParams,
	): Promise<StudentProfile> {
		assertCanCreateStudentProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.userId,
		});
		const result = await commandsRepository.insertStudentProfile(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Student profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to create student profile',
		);
	};
}
