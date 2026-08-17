import { log } from '@GenericSubdomains/utils/logging/logger';
import type { EventBus } from '@SharedKernel/events/EventBus';
import { notificationsCommandsServices } from '../Composition';

export function registerPoemRemovedNotification(eventBus: EventBus) {
	eventBus.subscribe('POEM_REMOVED', async (p) => {
		try {
			const reason = p.reason?.trim();
			const reasonSuffix = reason ? ` Reason: ${reason}` : '';
			await notificationsCommandsServices.createNotification({
				userId: p.authorId,
				type: 'POEM_REMOVED',
				actorId: undefined,
				entityId: p.poemId,
				entityType: 'POEM',
				data: {
					title: 'Your poem was removed',
					body: `Your poem ${p.poemTitle} was removed by moderation.${reasonSuffix}`,
					poemId: p.poemId,
					poemTitle: p.poemTitle,
					actorAvatarUrl: p.actorAvatarUrl ?? null,
					removalReason: reason ?? null,
				},
				aggregateWindowMinutes: 60,
			});
			log.info(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					userId: p.authorId,
				},
				'New notification created for poem removal',
			);
		} catch (err) {
			log.error(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					error: err instanceof Error ? err.message : String(err),
				},
				'Failed to create notification for poem removal',
			);
		}
	});
}
