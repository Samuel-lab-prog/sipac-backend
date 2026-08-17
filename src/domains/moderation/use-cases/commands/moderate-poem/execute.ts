import type {
	CommandsRepository,
	ModeratePoemParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { ModeratePoemResult } from '../../../ports/models';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { type EventBus } from '@SharedKernel/events/EventBus';
import type { PoemModerationStatus, PoemVisibility } from '@SharedKernel/Enums';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	eventBus: EventBus;
}

const ALLOWED_STATUSES = new Set([
	'approved',
	'rejected',
	'pending',
	'removed',
] as const);

type PoemNotificationContext = {
	poemId: number;
	title: string;
	authorId: number;
	authorNickname: string;
	authorAvatarUrl?: string | null;
	visibility: PoemVisibility;
};

function assertCanModeratePoem(params: ModeratePoemParams) {
	const { moderationStatus, meta } = params;

	if (meta.requesterRole !== 'moderator' && meta.requesterRole !== 'admin')
		throw new ForbiddenError('Insufficient permissions');
	if (meta.requesterStatus !== 'active')
		throw new ForbiddenError('User is not active');
	if (!ALLOWED_STATUSES.has(moderationStatus))
		throw new ForbiddenError('Invalid moderation status');
}

function buildPoemNotificationContext(
	poemId: number,
	poem: {
		title: string;
		author: { id: number; nickname: string; avatarUrl?: string | null };
		visibility: PoemVisibility;
	},
): PoemNotificationContext {
	return {
		poemId,
		title: poem.title,
		authorId: poem.author.id,
		authorNickname: poem.author.nickname,
		authorAvatarUrl: poem.author.avatarUrl ?? null,
		visibility: poem.visibility,
	};
}

function shouldNotifyTransition(
	currentStatus: PoemModerationStatus,
	nextStatus: PoemModerationStatus,
	targetStatus: PoemModerationStatus,
) {
	return nextStatus === targetStatus && currentStatus !== targetStatus;
}

async function notifyPoemApproved(params: {
	eventBus: EventBus;
	queriesRepository: QueriesRepository;
	poem: PoemNotificationContext;
}) {
	const { eventBus, queriesRepository, poem } = params;
	const canNotifyByVisibility = poem.visibility !== 'private';
	const canNotifyAudience =
		poem.visibility === 'public' || poem.visibility === 'friends';
	if (!canNotifyByVisibility) return;

	await eventBus.publish('POEM_APPROVED', {
		poemId: poem.poemId,
		poemTitle: poem.title,
		authorId: poem.authorId,
		authorNickname: poem.authorNickname,
		actorAvatarUrl: poem.authorAvatarUrl ?? null,
	});

	if (!canNotifyAudience) return;

	const notificationsData = await queriesRepository.selectPoemNotificationsData(
		poem.poemId,
	);

	if (!notificationsData) return;

	const {
		authorId,
		authorNickname,
		authorAvatarUrl,
		authorFriendIds,
		dedicatedUserIds,
		mentionedUserIds,
		title,
		id,
	} = notificationsData;

	const audienceIds =
		poem.visibility === 'friends'
			? new Set(authorFriendIds)
			: new Set([...dedicatedUserIds, ...mentionedUserIds]);

	for (const toUserId of dedicatedUserIds) {
		if (!audienceIds.has(toUserId)) continue;
		await eventBus.publish('POEM_DEDICATED', {
			poemId: id,
			userId: toUserId,
			dedicatorId: authorId,
			dedicatorNickname: authorNickname,
			actorAvatarUrl: authorAvatarUrl ?? null,
			poemTitle: title,
		});
	}

	for (const mentionedUserId of mentionedUserIds) {
		if (!audienceIds.has(mentionedUserId)) continue;
		await eventBus.publish('USER_MENTION_IN_POEM', {
			poemId: id,
			poemTitle: title,
			userId: mentionedUserId,
			mentionerId: authorId,
			mentionerNickname: authorNickname,
			actorAvatarUrl: authorAvatarUrl ?? null,
		});
	}
}

async function notifyPoemRemoved(params: {
	eventBus: EventBus;
	poem: PoemNotificationContext;
	reason?: string;
}) {
	const { eventBus, poem, reason } = params;
	await eventBus.publish('POEM_REMOVED', {
		poemId: poem.poemId,
		poemTitle: poem.title,
		authorId: poem.authorId,
		authorNickname: poem.authorNickname,
		actorAvatarUrl: poem.authorAvatarUrl ?? null,
		reason: reason?.trim() || undefined,
	});
}

async function notifyPoemRejected(params: {
	eventBus: EventBus;
	poem: PoemNotificationContext;
	reason?: string;
}) {
	const { eventBus, poem, reason } = params;
	await eventBus.publish('POEM_REJECTED', {
		poemId: poem.poemId,
		poemTitle: poem.title,
		authorId: poem.authorId,
		authorNickname: poem.authorNickname,
		actorAvatarUrl: poem.authorAvatarUrl ?? null,
		reason: reason?.trim() || undefined,
	});
}

export function moderatePoemFactory({
	commandsRepository,
	queriesRepository,
	eventBus,
}: Dependencies) {
	return async function moderatePoem(
		params: ModeratePoemParams,
	): Promise<ModeratePoemResult> {
		const { poemId, moderationStatus, reason } = params;

		assertCanModeratePoem(params);

		const poem = await queriesRepository.selectPoemById(poemId);
		if (!poem) throw new NotFoundError('Poem not found');
		if (poem.moderationStatus === 'removed')
			throw new ForbiddenError('Cannot moderate removed poem');
		if (moderationStatus === 'removed' && poem.status !== 'published')
			throw new ForbiddenError('Only published poems can be removed');

		const result = await commandsRepository.updatePoemModerationStatus({
			poemId,
			moderationStatus,
			reason,
		});
		if (!result.ok) throw result.error;

		const poemContext = buildPoemNotificationContext(poemId, poem);
		if (
			shouldNotifyTransition(
				poem.moderationStatus,
				moderationStatus,
				'approved',
			)
		) {
			await notifyPoemApproved({
				eventBus,
				queriesRepository,
				poem: poemContext,
			});
		}
		if (
			shouldNotifyTransition(
				poem.moderationStatus,
				moderationStatus,
				'rejected',
			)
		) {
			await notifyPoemRejected({ eventBus, poem: poemContext, reason });
		}
		if (
			shouldNotifyTransition(poem.moderationStatus, moderationStatus, 'removed')
		) {
			await notifyPoemRemoved({ eventBus, poem: poemContext, reason });
		}

		return result.data;
	};
}
