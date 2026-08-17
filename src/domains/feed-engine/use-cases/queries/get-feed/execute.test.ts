import { describe, expect, it, mock } from 'bun:test';
import { getFeedFactory } from './execute';

function makeFeedItem(id: number) {
	return {
		id,
		title: `Poem ${id}`,
		content: `Content ${id}`,
		slug: `poem-${id}`,
		excerpt: `Excerpt ${id}`,
		tags: ['tag'],
		createdAt: new Date(),
		author: {
			id: 100 + id,
			name: `Author ${id}`,
			nickname: `author-${id}`,
			avatarUrl: 'https://avatar.test/img.png',
		},
	};
}

describe.concurrent('USE-CASE - Feed Engine - GetFeed', () => {
	const makeSut = () => {
		const poemsServices = {
			getFeedPoemsByAuthorIds: mock(),
			getPublicFeedPoems: mock(),
		};
		const friendsServices = {
			selectFollowedUserIds: mock(),
			selectBlockedUserIds: mock(),
		};

		return {
			sut: getFeedFactory({
				poemsServices: poemsServices as never,
				friendsServices: friendsServices as never,
			}),
			poemsServices,
			friendsServices,
		};
	};

	it('should fetch friends poems first excluding blocked authors', async () => {
		const { sut, poemsServices, friendsServices } = makeSut();
		friendsServices.selectFollowedUserIds.mockResolvedValue([2, 3, 4]);
		friendsServices.selectBlockedUserIds.mockResolvedValue([3]);
		poemsServices.getFeedPoemsByAuthorIds
			.mockResolvedValueOnce([makeFeedItem(1)])
			.mockResolvedValueOnce([makeFeedItem(2)]);
		poemsServices.getPublicFeedPoems.mockResolvedValue([]);

		await sut({ userId: 1 });

		expect(poemsServices.getFeedPoemsByAuthorIds).toHaveBeenNthCalledWith(1, {
			authorIds: [2, 4],
			limit: 20,
			visibilities: ['public', 'friends'],
		});
		expect(poemsServices.getFeedPoemsByAuthorIds).toHaveBeenNthCalledWith(2, {
			authorIds: [1],
			limit: 20,
			visibilities: ['public', 'friends', 'private', 'unlisted'],
		});
	});

	it('should complete feed with public poems when friends poems are not enough', async () => {
		const { sut, poemsServices, friendsServices } = makeSut();
		friendsServices.selectFollowedUserIds.mockResolvedValue([2]);
		friendsServices.selectBlockedUserIds.mockResolvedValue([9]);
		poemsServices.getFeedPoemsByAuthorIds
			.mockResolvedValueOnce([makeFeedItem(1)])
			.mockResolvedValueOnce([makeFeedItem(2)]);
		poemsServices.getPublicFeedPoems.mockResolvedValue([makeFeedItem(2)]);

		const result = await sut({ userId: 1 });

		expect(poemsServices.getPublicFeedPoems).toHaveBeenCalledWith({
			limit: 18,
			excludeAuthorIds: [9],
			excludePoemIds: [1, 2],
		});
		expect(result).toHaveLength(2);
	});

	it('should not fetch public poems when friends poems already satisfy feed limit', async () => {
		const { sut, poemsServices, friendsServices } = makeSut();
		const fullFeed = Array.from({ length: 20 }, (_, idx) =>
			makeFeedItem(idx + 1),
		);

		friendsServices.selectFollowedUserIds.mockResolvedValue([2, 3]);
		friendsServices.selectBlockedUserIds.mockResolvedValue([]);
		poemsServices.getFeedPoemsByAuthorIds
			.mockResolvedValueOnce(fullFeed)
			.mockResolvedValueOnce([]);
		poemsServices.getPublicFeedPoems.mockResolvedValue([]);

		const result = await sut({ userId: 1 });

		expect(poemsServices.getPublicFeedPoems).not.toHaveBeenCalled();
		expect(result).toHaveLength(20);
	});
});
