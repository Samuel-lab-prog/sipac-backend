import type { FeedItem } from '../../../ports/models';
import type { GetFeedParams } from '../../../ports/queries';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsFeedContract } from '@Domains/feed-engine/ports/externalServices';

interface Dependencies {
	poemsServices: PoemsFeedContract;
	friendsServices: FriendsPublicContract;
}

export function getFeedFactory({
	poemsServices,
	friendsServices,
}: Dependencies) {
	return async function getFeed(params: GetFeedParams): Promise<FeedItem[]> {
		const { userId } = params;

		const FEED_LIMIT = 20;

		const [friendsIds, blockedIds] = await Promise.all([
			friendsServices.selectFollowedUserIds(userId),
			friendsServices.selectBlockedUserIds(userId),
		]);

		const blockedSet = new Set(blockedIds);

		const feedAuthorIds = friendsIds
			.filter((id) => !blockedSet.has(id))
			.sort((a, b) => a - b);

		const [friendPoems, ownPoems] = await Promise.all([
			poemsServices.getFeedPoemsByAuthorIds({
				authorIds: feedAuthorIds,
				limit: FEED_LIMIT,
				visibilities: ['public', 'friends'],
			}),
			poemsServices.getFeedPoemsByAuthorIds({
				authorIds: [userId],
				limit: FEED_LIMIT,
				visibilities: ['public', 'friends', 'private', 'unlisted'],
			}),
		]);

		const seenIds = new Set<number>();
		const selected: FeedItem[] = [];
		const pushUnique = (items: FeedItem[]) => {
			for (const item of items) {
				if (seenIds.has(item.id)) continue;
				seenIds.add(item.id);
				selected.push(item);
			}
		};

		pushUnique(
			[...friendPoems, ...ownPoems].sort(
				(a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
			),
		);

		if (selected.length < FEED_LIMIT) {
			const remaining = FEED_LIMIT - selected.length;

			const publicPoems = await poemsServices.getPublicFeedPoems({
				limit: remaining,
				excludeAuthorIds: [...blockedSet].sort((a, b) => a - b),
				excludePoemIds: selected.map((p) => p.id).sort((a, b) => a - b),
			});

			pushUnique(publicPoems);
		}

		return selected;
	};
}
