import { describe, expect, it } from 'bun:test';
import { listAnnouncementsForUserFactory } from './execute';

describe('communications-management > listAnnouncementsForUser', () => {
	it('delegates listing to the repository', async () => {
		const sut = listAnnouncementsForUserFactory({
			queriesRepository: { listAnnouncementsForUser: async () => [] },
		});
		await expect(sut(1, 'student')).resolves.toEqual([]);
	});
});
