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
	): Promise<StudentProfile | null> {
		return queriesRepository.selectStudentProfileByUserId(userId);
	};
}
