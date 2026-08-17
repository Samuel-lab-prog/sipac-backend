import type {
	QueriesRepository,
	GetPoemCommentsParams,
} from '../../../ports/queries';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import type { PoemCommentsPage } from '../../../ports/models';
import { validator } from '@SharedKernel/validators/Global';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

export interface GetPoemCommentsDependencies {
	queriesRepository: QueriesRepository;
	poemsContract: PoemsPublicContract;
	usersContract: UsersPublicContract;
	friendsContract: FriendsPublicContract;
}

export function getPoemCommentsFactory({
	queriesRepository,
	poemsContract,
	usersContract,
	friendsContract,
}: GetPoemCommentsDependencies) {
	return async function getPoemComments(
		params: GetPoemCommentsParams,
	): Promise<PoemCommentsPage> {
		const { poemId, userId, parentId, cursor, limit } = params;

		const v = validator();

		const [userInfo, poemInfo] = await Promise.all([
			usersContract.selectUserBasicInfo(userId),
			poemsContract.selectPoemBasicInfo(poemId),
		]);
		v.user(userInfo).withStatus(['active']);
		v.poem(poemInfo)
			.withAuthorStatus(['active', 'suspended'])
			.withModerationStatus(['approved'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withCommentability(true);

		const usersRelationInfo = await friendsContract.selectUsersRelation(
			userId,
			poemInfo.authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== poemInfo.authorId)
			v.relation(usersRelationInfo).withFriendship();

		return queriesRepository.selectCommentsByPoemId({
			poemId,
			parentId,
			currentUserId: userId,
			viewerRole: userInfo.role,
			viewerStatus: userInfo.status,
			cursor,
			limit,
		});
	};
}
