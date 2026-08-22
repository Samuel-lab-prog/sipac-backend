import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import type { LinkStudentToCourseParams } from '../../../ports/commands';
import type { StudentProfile } from '../../../ports/models';
import { assertCanLinkStudentToCourse } from '../policies';

interface Dependencies {
	commandsRepository: {
		linkStudentToCourse(
			userId: number,
			params: {
				courseId: number | null;
			},
		): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	};
}

export function linkStudentToCourseFactory({
	commandsRepository,
}: Dependencies) {
	return async function linkStudentToCourse(
		params: LinkStudentToCourseParams,
	): Promise<StudentProfile> {
		assertCanLinkStudentToCourse({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const result = await commandsRepository.linkStudentToCourse(
			params.targetUserId,
			{
				courseId: params.courseId,
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
			result.message ?? 'Failed to link student to course',
		);
	};
}
