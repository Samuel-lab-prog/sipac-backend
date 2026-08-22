import { describe, expect, it } from 'bun:test';
import { getStaffProfileByUserIdFactory } from './execute';

describe('academic-management > getStaffProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const sut = getStaffProfileByUserIdFactory({
			queriesRepository: {
				selectStaffProfileByUserId: async (userId) =>
					userId === 1
						? {
								id: 2,
								userId,
								departmentId: null,
							}
						: null,
			},
		});

		await expect(sut(1)).resolves.toMatchObject({ userId: 1 });
	});
});
