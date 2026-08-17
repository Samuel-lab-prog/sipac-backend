/* eslint-disable max-lines-per-function */
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type {
	CommentPoemParams,
	DeleteCommentParams,
	LikeCommentParams,
	LikePoemParams,
} from '../../ports/commands';
import type { GetPoemCommentsParams } from '../../ports/queries';
import {
	DEFAULT_COMMENT_CONTENT,
	DEFAULT_COMMENT_ID,
	DEFAULT_PERFORMER_USER_ID,
	DEFAULT_POEM_ID,
} from './Constants';
import {
	type CreatePoemCommentOverride,
	type FindCommentsOverride,
	type PoemInteractionInfoOverride,
	type SelectCommentByIdOverride,
	type UserBasicInfoOverride,
	type UsersRelationInfoOverride,
	givenCommentLikeCreated,
	givenCommentLikeDeleted,
	givenCommentLikeExists,
	givenCommentNotFound,
	givenCommentUpdated,
	givenCreatedComment,
	givenDeletedComment,
	givenExistingComments,
	givenFoundComment,
	givenPoem,
	givenPoemLikeCreated,
	givenPoemLikeDeleted,
	givenPoemLikeExists,
	givenUser,
	givenUsersRelation,
} from './Givens';
import {
	type InteractionsSutMocks,
	interactionsFactory,
	interactionsMockFactories,
} from './SutMocks';

export function makeInteractionsScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		interactionsFactory,
		interactionsMockFactories(),
	);

	return {
		withCommentUpdated() {
			givenCommentUpdated(mocks.commandsRepository);
			return this;
		},

		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withPoem(overrides: PoemInteractionInfoOverride = {}) {
			givenPoem(mocks.poemsContract, overrides);
			return this;
		},

		withUsersRelation(overrides: UsersRelationInfoOverride = {}) {
			givenUsersRelation(mocks.friendsContract, overrides);
			return this;
		},

		withCreatedComment(overrides: CreatePoemCommentOverride = {}) {
			givenCreatedComment(mocks.commandsRepository, overrides);
			return this;
		},

		withExistingComments(overrides: FindCommentsOverride = {}) {
			givenExistingComments(mocks.queriesRepository, overrides);
			return this;
		},

		withFoundCommentLike() {
			givenCommentLikeExists(mocks.queriesRepository, true);
			return this;
		},

		withCommentLikeCreated() {
			givenCommentLikeCreated(mocks.commandsRepository);
			return this;
		},

		withCommentLikeDeleted() {
			givenCommentLikeDeleted(mocks.commandsRepository);
			return this;
		},

		withFoundComment(overrides: SelectCommentByIdOverride = {}) {
			givenFoundComment(mocks.queriesRepository, overrides);
			return this;
		},

		withPoemLikeCreated() {
			givenPoemLikeCreated(mocks.commandsRepository);
			return this;
		},

		withPoemLikeDeleted() {
			givenPoemLikeDeleted(mocks.commandsRepository);
			return this;
		},

		withDeletedComment() {
			givenDeletedComment(mocks.commandsRepository);
			return this;
		},

		withPoemLikeExists(exists: boolean) {
			givenPoemLikeExists(mocks.queriesRepository, exists);
			return this;
		},

		withCommentReply(commentId: number = DEFAULT_COMMENT_ID) {
			givenCreatedComment(mocks.commandsRepository, {
				ok: true,
				data: { commentId },
			});
			return this;
		},

		withCommentNotFound() {
			givenCommentNotFound(mocks.queriesRepository);
			return this;
		},

		executeUpdateComment(params: Partial<CommentPoemParams> = {}) {
			return sutFactory.updateComment(
				makeParams({
					userId: DEFAULT_PERFORMER_USER_ID,
					commentId: DEFAULT_COMMENT_ID,
					content: DEFAULT_COMMENT_CONTENT,
					...params,
				}),
			);
		},

		executeCommentPoem(params: Partial<CommentPoemParams> = {}) {
			return sutFactory.commentPoem(
				makeParams(
					{
						userId: DEFAULT_PERFORMER_USER_ID,
						poemId: DEFAULT_POEM_ID,
						content: DEFAULT_COMMENT_CONTENT,
					},
					params,
				),
			);
		},

		executeLikeComment(params: Partial<LikeCommentParams> = {}) {
			return sutFactory.likeComment(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, commentId: DEFAULT_COMMENT_ID },
					params,
				),
			);
		},

		executeUnlikeComment(params: Partial<LikeCommentParams> = {}) {
			return sutFactory.unlikeComment(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, commentId: DEFAULT_COMMENT_ID },
					params,
				),
			);
		},
		executeLikePoem(params: Partial<LikePoemParams> = {}) {
			return sutFactory.likePoem(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID },
					params,
				),
			);
		},

		executeRemoveLike(params: Partial<LikePoemParams> = {}) {
			return sutFactory.removeLikePoem(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, poemId: DEFAULT_POEM_ID },
					params,
				),
			);
		},

		executeDeleteComment(params: Partial<DeleteCommentParams> = {}) {
			return sutFactory.deleteComment(
				makeParams(
					{ userId: DEFAULT_PERFORMER_USER_ID, commentId: DEFAULT_COMMENT_ID },
					params,
				),
			);
		},

		executeGetPoemComments(params: Partial<GetPoemCommentsParams> = {}) {
			return sutFactory.getPoemComments(
				makeParams(
					{
						poemId: DEFAULT_POEM_ID,
						userId: DEFAULT_PERFORMER_USER_ID,
						parentId: undefined,
					},
					params,
				),
			);
		},

		get mocks(): InteractionsSutMocks {
			return mocks;
		},
	};
}
