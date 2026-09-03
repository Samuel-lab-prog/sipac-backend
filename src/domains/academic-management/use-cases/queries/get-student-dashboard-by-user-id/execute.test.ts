import { describe, expect, it } from 'bun:test';
import { getStudentDashboardByUserIdFactory } from './execute';

describe('academic-management > getStudentDashboardByUserId', () => {
	it('returns the student dashboard', async () => {
		const sut = getStudentDashboardByUserIdFactory({
			queriesRepository: {
				selectStudentDashboardByUserId: async () => ({}) as never,
			},
		});
		await expect(sut(1)).resolves.toEqual({} as never);
	});
});
