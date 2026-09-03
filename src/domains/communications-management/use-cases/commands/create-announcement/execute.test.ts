import { describe, expect, it } from 'bun:test';
import { createAnnouncementFactory } from './execute';

describe('communications-management > createAnnouncement', () => {
	it('delegates announcement creation for staff', async () => {
		const sut = createAnnouncementFactory({
			commandsRepository: {
				createAnnouncement: async (params) => ({ id: 1, ...params }) as never,
			},
		});
		await expect(
			sut({
				title: 'Aviso',
				body: 'Conteúdo',
				audience: 'all',
				actorRole: 'staff',
				actorId: 1,
			}),
		).resolves.toMatchObject({ id: 1 });
	});
});
