import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { UpdateStudentProfileParams } from '../../../ports/commands';
import type { StudentProfile } from '../../../ports/models';
import { assertCanUpdateStudentProfile } from '../policies';

interface Dependencies {
	commandsRepository: {
		updateStudentProfile(
			userId: number,
			params: Partial<{
				academicId: string;
				courseId: number | null;
				admissionYear: number | null;
				status: string;
			}>,
		): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	};
}

export function updateStudentProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function updateStudentProfile(
		params: UpdateStudentProfileParams,
	): Promise<StudentProfile> {
		assertCanUpdateStudentProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const result = await commandsRepository.updateStudentProfile(
			params.targetUserId,
			{
				academicId: params.academicId,
				courseId: params.courseId,
				admissionYear: params.admissionYear,
				status: params.status,
			},
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Student profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Student profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to update student profile',
		);
	};
}
