import { describe, expect, it } from 'bun:test';
import { mapPoem } from './helpers';

describe('mapPoem', () => {
	it('maps dedications to users with friendIds and stats', () => {
		const poem = {
			id: 1,
			dedications: [
				{
					toUser: {
						id: 10,
						name: 'User A',
						nickname: 'usera',
						avatarUrl: null,
						friendshipsFrom: [{ userBId: 2 }],
						friendshipsTo: [{ userAId: 3 }],
					},
				},
			],
			_count: { poemLikes: 5, comments: 2 },
		};

		const mapped = mapPoem(poem);

		expect(mapped.toUsers).toHaveLength(1);
		expect(mapped.toUsers[0]).toHaveProperty('id', 10);
		expect(mapped.toUsers[0].friendIds).toEqual([2, 3]);
		expect(mapped.stats).toEqual({ likesCount: 5, commentsCount: 2 });
	});

	it('adds author friendIds when author is provided', () => {
		const poem = {
			id: 2,
			dedications: [],
			_count: { poemLikes: 0, comments: 0 },
		};
		const author = {
			id: 99,
			friendshipsFrom: [{ userBId: 7 }],
			friendshipsTo: [{ userAId: 8 }],
		};

		const mapped = mapPoem(poem, author);

		expect(mapped.author?.id).toBe(99);
		expect(mapped.author?.friendIds).toEqual([7, 8]);
	});
});
