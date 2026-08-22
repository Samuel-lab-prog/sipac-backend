import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import {
	assertCanUnlinkStudentFromCourse,
	type AcademicPolicyContext,
} from '../policies';
import type { StudentProfile } from '../../../ports/models';

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

export function unlinkStudentFromCourseFactory({
	commandsRepository,
}: Dependencies) {
	return async function unlinkStudentFromCourse(
		params: AcademicPolicyContext,
	): Promise<StudentProfile> {
		assertCanUnlinkStudentFromCourse(params);
		const result = await commandsRepository.linkStudentToCourse(
			params.targetUserId,
			{ courseId: null },
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Student profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Student profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to unlink student from course',
		);
	};
}
