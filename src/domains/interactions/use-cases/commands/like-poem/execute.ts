import type {
	CommandsRepository,
	LikePoemParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import { ConflictError } from '@DomainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { EventBus } from '@SharedKernel/events/EventBus';

export interface LikePoemDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	friendsContract: FriendsPublicContract;
	usersContract: UsersPublicContract;
	poemsContract: PoemsPublicContract;
	eventBus: EventBus;
}

export function likePoemFactory({
	commandsRepository,
	queriesRepository,
	friendsContract,
	usersContract,
	poemsContract,
	eventBus,
}: LikePoemDependencies) {
	return async function likePoem(params: LikePoemParams): Promise<void> {
		const { userId, poemId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.selectPoemBasicInfo(poemId);
		v.poem(poemInfo)
			.withAuthorStatus(['active', 'suspended'])
			.withStatus(['published'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withModerationStatus(['approved']);

		const authorId = poemInfo.authorId;
		const usersRelationInfo = await friendsContract.selectUsersRelation(
			userId,
			authorId,
		);
		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== authorId)
			v.relation(usersRelationInfo).withFriendship();

		const alreadyLiked = await queriesRepository.selectPoemLike({
			userId,
			poemId,
		});
		if (alreadyLiked) throw new ConflictError('Poem already liked');

		await commandsRepository.createPoemLike({
			userId,
			poemId,
		});

		eventBus.publish('POEM_LIKED', {
			poemId,
			userId,
			likerId: userId,
			likerNickname: userInfo.nickname,
			actorAvatarUrl: userInfo.avatarUrl ?? null,
		});
	};
}
