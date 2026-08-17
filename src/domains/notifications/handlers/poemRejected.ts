import { log } from '@GenericSubdomains/utils/logging/logger';
import type { EventBus } from '@SharedKernel/events/EventBus';
import { notificationsCommandsServices } from '../Composition';

export function registerPoemRejectedNotification(eventBus: EventBus) {
	eventBus.subscribe('POEM_REJECTED', async (p) => {
		try {
			const reason = p.reason?.trim();
			const reasonSuffix = reason ? ` Reason: ${reason}` : '';
			await notificationsCommandsServices.createNotification({
				userId: p.authorId,
				type: 'POEM_REJECTED',
				actorId: undefined,
				entityId: p.poemId,
				entityType: 'POEM',
				data: {
					title: 'Your poem was rejected',
					body: `Your poem ${p.poemTitle} was rejected by moderation.${reasonSuffix}`,
					poemId: p.poemId,
					poemTitle: p.poemTitle,
					actorAvatarUrl: p.actorAvatarUrl ?? null,
					rejectionReason: reason ?? null,
				},
				aggregateWindowMinutes: 60,
			});
			log.info(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					userId: p.authorId,
				},
				'New notification created for poem rejection',
			);
		} catch (err) {
			log.error(
				{
					entityType: 'POEM',
					poemId: p.poemId,
					error: err instanceof Error ? err.message : String(err),
				},
				'Failed to create notification for poem rejection',
			);
		}
	});
}
