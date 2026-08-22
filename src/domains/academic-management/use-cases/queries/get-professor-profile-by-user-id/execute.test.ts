import { describe, expect, it } from 'bun:test';
import { getProfessorProfileByUserIdFactory } from './execute';

describe('academic-management > getProfessorProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const sut = getProfessorProfileByUserIdFactory({
			queriesRepository: {
				selectProfessorProfileByUserId: async (userId) =>
					userId === 1
						? {
								id: 2,
								userId,
								registryCode: 'PROF-2026-001',
								departmentId: null,
								title: 'Dr.',
								workload: 40,
							}
						: null,
			},
		});

		await expect(sut(1)).resolves.toMatchObject({ userId: 1 });
	});
});
