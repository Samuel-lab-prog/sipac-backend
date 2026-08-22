import { describe, expect, it } from 'bun:test';
import { getStudentProfileByUserIdFactory } from './execute';

describe('academic-management > getStudentProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const sut = getStudentProfileByUserIdFactory({
			queriesRepository: {
				selectStudentProfileByUserId: async (userId) =>
					userId === 1
						? {
								id: 2,
								userId,
								academicId: '2026000123',
								courseId: null,
								admissionYear: 2026,
								status: 'active',
							}
						: null,
			},
		});

		await expect(sut(1)).resolves.toMatchObject({ userId: 1 });
	});
});
