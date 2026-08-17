import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

import { givenResolved } from '@GenericSubdomains/utils/testing/utils';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import {
	DEFAULT_COMMENT_CONTENT,
	DEFAULT_COMMENT_ID,
	DEFAULT_COMMENT_PARENT_ID,
	DEFAULT_COMMENT_STATUS,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
	DEFAULT_POEM_MODERATION_STATUS,
	DEFAULT_POEM_OWNER_USER_ID,
	DEFAULT_POEM_STATUS,
	DEFAULT_POEM_TITLE,
	DEFAULT_POEM_VISIBILITY,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './Constants';
import type { InteractionsSutMocks } from './SutMocks';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectUserBasicInfo']>>
>;
export type PoemInteractionInfoOverride = Partial<
	Awaited<ReturnType<PoemsPublicContract['selectPoemBasicInfo']>>
>;
export type UsersRelationInfoOverride = Partial<
	Awaited<ReturnType<FriendsPublicContract['selectUsersRelation']>>
>;
export type DeletePoemLikeOverride = Partial<
	Awaited<ReturnType<CommandsRepository['deletePoemLike']>>
>;
export type CreatePoemLikeOverride = Partial<
	Awaited<ReturnType<CommandsRepository['createPoemLike']>>
>;
export type CreatePoemCommentOverride = Partial<
	Awaited<ReturnType<CommandsRepository['createPoemComment']>>
>;
export type FindCommentsOverride = Partial<
	Awaited<
		ReturnType<QueriesRepository['selectCommentsByPoemId']>
	>['comments'][number]
>;
export type SelectCommentByIdOverride = Partial<
	Awaited<ReturnType<QueriesRepository['selectCommentById']>>
>;
export type UpdatedCommentOverride = Partial<
	Parameters<InteractionsSutMocks['commandsRepository']['updateComment']>[0]
>;

export function givenUser(
	userContract: InteractionsSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(userContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_PERFORMER_USER_ID,
		status: DEFAULT_USER_STATUS,
		role: DEFAULT_USER_ROLE,
		nickname: DEFAULT_USER_NICKNAME,
		...overrides,
	});
}

export function givenCommentUpdated(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'updateComment', {
		ok: true,
		data: undefined,
	});
}

export function givenPoem(
	poemsContract: InteractionsSutMocks['poemsContract'],
	overrides: PoemInteractionInfoOverride = {},
) {
	givenResolved(poemsContract, 'selectPoemBasicInfo', {
		exists: true,
		id: DEFAULT_POEM_ID,
		authorId: DEFAULT_POEM_OWNER_USER_ID,
		visibility: DEFAULT_POEM_VISIBILITY,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		status: DEFAULT_POEM_STATUS,
		authorStatus: DEFAULT_USER_STATUS,
		isCommentable: true,
		poemTitle: DEFAULT_POEM_TITLE,
		...overrides,
	});
}

export function givenUsersRelation(
	friendsContract: InteractionsSutMocks['friendsContract'],
	overrides: UsersRelationInfoOverride = {},
) {
	givenResolved(friendsContract, 'selectUsersRelation', {
		areFriends: false,
		areBlocked: false,
		...overrides,
	});
}

export function givenPoemLikeDeleted(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deletePoemLike', {
		ok: true,
		data: undefined,
	});
}

export function givenPoemLikeExists(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	exists: boolean,
) {
	givenResolved(queriesRepository, 'selectPoemLike', exists);
}

export function givenPoemLikeCreated(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'createPoemLike', {
		ok: true,
		data: undefined,
	});
}

export function givenCreatedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
	overrides: CreatePoemCommentOverride = {},
) {
	givenResolved(commandsRepository, 'createPoemComment', {
		ok: true,
		data: {
			commentId: overrides.data?.commentId ?? DEFAULT_COMMENT_ID,
		},
	});
}

export function givenCommentNotFound(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectCommentById', null);
}

export function givenCommentLikeExists(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	exists: boolean,
) {
	givenResolved(queriesRepository, 'selectCommentLike', exists);
}

export function givenCommentLikeDeleted(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deleteCommentLike', {
		ok: true,
		data: undefined,
	});
}

export function givenCommentLikeCreated(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'createCommentLike', {
		ok: true,
		data: undefined,
	});
}

export function givenExistingComments(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: FindCommentsOverride = {},
) {
	givenResolved(queriesRepository, 'selectCommentsByPoemId', {
		comments: [
			{
				id: DEFAULT_COMMENT_ID,
				poemId: DEFAULT_POEM_ID,
				status: DEFAULT_COMMENT_STATUS,
				parentId: DEFAULT_COMMENT_PARENT_ID,
				content: DEFAULT_COMMENT_CONTENT,
				createdAt: new Date(),
				aggregateChildrenCount: 0,
				likesCount: 0,
				likedByCurrentUser: false,
				author: {
					id: DEFAULT_PERFORMER_USER_ID,
					nickname: DEFAULT_USER_NICKNAME,
					avatarUrl: 'http://example.com/avatar.jpg',
				},
				...overrides,
			},
		],
		hasMore: false,
		nextCursor: undefined,
	});
}

export function givenFoundComment(
	queriesRepository: InteractionsSutMocks['queriesRepository'],
	overrides: SelectCommentByIdOverride = {},
) {
	givenResolved(queriesRepository, 'selectCommentById', {
		id: DEFAULT_COMMENT_ID,
		status: DEFAULT_COMMENT_STATUS,
		parentId: DEFAULT_COMMENT_PARENT_ID,
		poemId: DEFAULT_POEM_ID,
		content: DEFAULT_COMMENT_CONTENT,
		createdAt: new Date(),
		aggregateChildrenCount: 0,
		likesCount: 0,
		likedByCurrentUser: false,
		author: {
			id: DEFAULT_PERFORMER_USER_ID,
			nickname: DEFAULT_USER_NICKNAME,
			avatarUrl: 'http://example.com/avatar.jpg',
			status: DEFAULT_USER_STATUS,
		},
		...overrides,
	});
}

export function givenDeletedComment(
	commandsRepository: InteractionsSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'deletePoemComment', {
		ok: true,
		data: undefined,
	});
}
