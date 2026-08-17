import { log } from '@GenericSubdomains/utils/logging/logger';
import { eventBus } from '@SharedKernel/events/EventBus';
import { notificationsCommandsServices } from './Composition';
import { registerPoemApprovedNotification } from './handlers/poemApproved';
import { registerPoemRejectedNotification } from './handlers/poemRejected';
import { registerPoemRemovedNotification } from './handlers/poemRemoved';

eventBus.subscribe('POEM_COMMENT_CREATED', async (p) => {
	try {
		if (p.authorId === p.commenterId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.authorId,
			type: 'POEM_COMMENT_CREATED',
			actorId: p.commenterId,
			entityId: p.poemId,
			entityType: 'POEM',
			data: {
				commentId: p.commentId,
				commenterNickname: p.commenterNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
				poemTitle: p.poemTitle,
				body: `Your poem received a comment from ${p.commenterNickname}`,
				title: 'New comment on your poem',
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				commentId: p.commentId,
			},
			'New notification created for poem comment',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				commentId: p.commentId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem comment',
		);
	}
});

eventBus.subscribe('POEM_LIKED', async (p) => {
	try {
		if (p.userId === p.likerId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'POEM_LIKED',
			actorId: p.likerId,
			entityId: p.poemId,
			entityType: 'POEM',
			data: {
				title: 'Your poem was liked',
				body: `Your poem received a like from ${p.likerNickname}`,
				poemId: p.poemId,
				likerNickname: p.likerNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
			},
			'New notification created for poem like',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem like',
		);
	}
});

eventBus.subscribe('POEM_DEDICATED', async (p) => {
	try {
		if (p.userId === p.dedicatorId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'POEM_DEDICATED',
			actorId: p.dedicatorId,
			entityId: p.poemId,
			entityType: 'POEM',
			data: {
				title: 'A poem was dedicated to you',
				body: `The poem ${p.poemTitle} was dedicated to you by ${p.dedicatorNickname}`,

				poemId: p.poemId,
				poemTitle: p.poemTitle,
				dedicatorNickname: p.dedicatorNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
			},
			'New notification created for poem dedication',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem dedication',
		);
	}
});

eventBus.subscribe('NEW_FRIEND_REQUEST', async (p) => {
	try {
		if (p.recipientId === p.requesterId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.recipientId,
			type: 'NEW_FRIEND_REQUEST',
			actorId: p.requesterId,
			entityId: p.requesterId,
			entityType: 'USER',
			data: {
				title: 'New friend request',
				body: `${p.requesterNickname} sent you a friend request`,

				requesterId: p.requesterId,
				requesterNickname: p.requesterNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'USER',
				userId: p.recipientId,
			},
			'New notification created for friend request',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'USER',
				userId: p.recipientId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for friend request',
		);
	}
});

eventBus.subscribe('NEW_FRIEND', async (p) => {
	try {
		if (p.userId === p.newFriendId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'NEW_FRIEND',
			actorId: p.newFriendId,
			entityId: p.newFriendId,
			entityType: 'USER',
			data: {
				newFriendId: p.newFriendId,
				title: 'You have a new friend',
				body: `You are now friends with ${p.newFriendNickname}`,
				newFriendNickname: p.newFriendNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'USER',
				userId: p.userId,
			},
			'New notification created for new friend',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'USER',
				userId: p.userId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for new friend',
		);
	}
});

eventBus.subscribe('POEM_COMMENT_REPLIED', async (p) => {
	try {
		if (p.originalCommenterId === p.replierId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.originalCommenterId,
			type: 'POEM_COMMENT_REPLIED',
			actorId: p.replierId,
			entityId: p.commentId,
			entityType: 'COMMENT',
			data: {
				commentId: p.commentId,
				parentCommentId: p.parentCommentId,
				poemId: p.poemId,
				replierId: p.replierId,
				title: 'Your comment received a reply',
				body: `Your comment on the poem ${p.poemTitle} received a reply from ${p.replierNickname}`,
				replierNickname: p.replierNickname,
				poemTitle: p.poemTitle,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'COMMENT',
				commentId: p.commentId,
			},
			'New notification created for comment reply',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'COMMENT',
				commentId: p.commentId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for comment reply',
		);
	}
});

eventBus.subscribe('USER_MENTION_IN_POEM', async (p) => {
	try {
		if (p.userId === p.mentionerId) return;
		await notificationsCommandsServices.createNotification({
			userId: p.userId,
			type: 'USER_MENTION_IN_POEM',
			actorId: p.mentionerId,
			entityId: p.poemId,
			entityType: 'POEM',
			data: {
				title: 'You were mentioned in a poem',
				body: `${p.mentionerNickname} mentioned you in the poem ${p.poemTitle}`,
				poemTitle: p.poemTitle,
				poemId: p.poemId,
				mentionerId: p.mentionerId,
				mentionerNickname: p.mentionerNickname,
				actorAvatarUrl: p.actorAvatarUrl ?? null,
			},
			aggregateWindowMinutes: 60,
		});
		log.info(
			{
				entityType: 'POEM',
				poemId: p.poemId,
			},
			'New notification created for poem mention',
		);
	} catch (err) {
		log.error(
			{
				entityType: 'POEM',
				poemId: p.poemId,
				error: err instanceof Error ? err.message : String(err),
			},
			'Failed to create notification for poem mention',
		);
	}
});

registerPoemApprovedNotification(eventBus);
registerPoemRejectedNotification(eventBus);
registerPoemRemovedNotification(eventBus);
