import type { StaffProfile } from '../../../ports/models';

interface Dependencies {
	queriesRepository: {
		selectStaffProfileByUserId(userId: number): Promise<StaffProfile | null>;
	};
}

export function getStaffProfileByUserIdFactory({
	queriesRepository,
}: Dependencies) {
	return function getStaffProfileByUserId(
		userId: number,
	): Promise<StaffProfile | null> {
		return queriesRepository.selectStaffProfileByUserId(userId);
	};
}
