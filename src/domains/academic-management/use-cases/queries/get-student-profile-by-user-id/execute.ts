import { NotFoundError } from '@DomainError';
import type { StudentProfile } from '../../../ports/models';

interface Dependencies {
	queriesRepository: {
		selectStudentProfileByUserId(
			userId: number,
		): Promise<StudentProfile | null>;
	};
}

export function getStudentProfileByUserIdFactory({
	queriesRepository,
}: Dependencies) {
	return function getStudentProfileByUserId(
		userId: number,
	): Promise<StudentProfile> {
		return queriesRepository
			.selectStudentProfileByUserId(userId)
			.then((profile) => {
				if (!profile) throw new NotFoundError('Student profile not found');
				return profile;
			});
	};
}
