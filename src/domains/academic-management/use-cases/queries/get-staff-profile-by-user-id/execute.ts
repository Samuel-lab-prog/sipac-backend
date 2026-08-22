import { NotFoundError } from '@DomainError';
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
	): Promise<StaffProfile> {
		return queriesRepository
			.selectStaffProfileByUserId(userId)
			.then((profile) => {
				if (!profile) throw new NotFoundError('Staff profile not found');
				return profile;
			});
	};
}
