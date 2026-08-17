import { log } from '@GenericSubdomains/utils/logging/logger';
import type { EventBus } from '@SharedKernel/events/EventBus';
import { notificationsCommandsServices } from '../Composition';

export function registerPoemApprovedNotification(eventBus: EventBus) {
	eventBus.subscribe('POEM_APPROVED', async (p) => {
		try {
			await notificationsCommandsServices.createNotification({
				userId: p.authorId,
				type: 'POEM_APPROVED',
				actorId: undefined,
				entityId: p.poemId,
				entityType: 'POEM',
				data: {
					title: 'Your poem was approved',
					body: `Your poem ${p.poemTitle} was approved by moderation.`,
					poemId: p.poemId,
					poemTitle: p.poemTitle,
					actorAvatarUrl: p.actorAvatarUrl ?? null,
				},
				aggregateWindowMinutes: 60,
			});
			log.info(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					userId: p.authorId,
				},
				'New notification created for poem approval',
			);
		} catch (err) {
			log.error(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					error: err instanceof Error ? err.message : String(err),
				},
				'Failed to create notification for poem approval',
			);
		}
	});
}
