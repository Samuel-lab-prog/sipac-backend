import type {
	CommandsRepository,
	CommentPoemParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';

import { validator } from '@SharedKernel/validators/Global';

import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';

import type { EventBus } from '@SharedKernel/events/EventBus';
import { ForbiddenError, UnknownError } from '@DomainError';

export interface CommentPoemDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	poemsContract: PoemsPublicContract;
	usersContract: UsersPublicContract;
	friendsContract: FriendsPublicContract;
	eventBus: EventBus;
}

async function validateParentComment(params: {
	v: ReturnType<typeof validator>;
	queriesRepository: QueriesRepository;
	parentId?: number;
	poemId: number;
}) {
	const { v, queriesRepository, parentId, poemId } = params;
	if (!parentId) return;

	const parentComment = v
		.comment(await queriesRepository.selectCommentById({ commentId: parentId }))
		.withStatus(['visible'], 'Parent comment is not available');
	v.comment(parentComment).withAuthorStatus(
		['active', 'suspended'],
		'Parent comment is not available',
	);

	if (parentComment.poemId !== poemId)
		throw new ForbiddenError('Parent comment is not available');
}

export function commentPoemFactory({
	commandsRepository,
	queriesRepository,
	poemsContract,
	usersContract,
	friendsContract,
	eventBus,
}: CommentPoemDependencies) {
	return async function commentPoem(
		params: CommentPoemParams,
	): Promise<{ commentId: number }> {
		const { userId, poemId, content, parentId } = params;

		const trimmedContent = content.trim();

		const v = validator();

		v.ensure(trimmedContent)
			.minLength(1)
			.maxLength(3000)
			.bannedWords(['badword1', 'badword2']);

		const userInfo = await usersContract.selectUserBasicInfo(userId);

		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.selectPoemBasicInfo(poemId);

		v.poem(poemInfo)
			.withAuthorStatus(['active', 'suspended'])
			.withModerationStatus(['approved'])
			.withVisibility(['public', 'friends', 'unlisted'])
			.withStatus(['published'])
			.withCommentability(true);

		await validateParentComment({ v, queriesRepository, parentId, poemId });

		const usersRelationInfo = await friendsContract.selectUsersRelation(
			userId,
			poemInfo.authorId,
		);

		v.relation(usersRelationInfo).withNoBlocking();

		if (poemInfo.visibility === 'friends' && userId !== poemInfo.authorId)
			v.relation(usersRelationInfo).withFriendship();

		const result = await commandsRepository.createPoemComment({
			userId,
			poemId,
			content: trimmedContent,
			parentId,
		});

		if (!result.ok) throw new UnknownError('Failed to create comment');

		const comment = result.data;

		await eventBus.publish('POEM_COMMENT_CREATED', {
			commentId: comment.commentId,
			poemId,
			authorId: poemInfo.authorId,
			commenterId: userId,
			commenterNickname: userInfo.nickname,
			actorAvatarUrl: userInfo.avatarUrl ?? null,
			poemTitle: poemInfo.poemTitle,
		});
		return comment;
	};
}
