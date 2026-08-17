import type { CommandResult } from '../../../shared-kernel/Types';
import type { CommentStatus } from './models';

export type LikeCommentParams = {
	userId: number;
	commentId: number;
};

export type CommentPoemParams = {
	userId: number;
	poemId: number;
	content: string;
	parentId?: number;
};

export type DeleteCommentParams = {
	userId: number;
	commentId: number;
};

export type LikePoemParams = {
	userId: number;
	poemId: number;
};

export type PatchCommentParams = {
	userId: number;
	commentId: number;
	content: string;
};

export interface CommandsRepository {
	createPoemLike(params: {
		userId: number;
		poemId: number;
	}): Promise<CommandResult<void>>;
	deletePoemLike(params: {
		userId: number;
		poemId: number;
	}): Promise<CommandResult<void>>;
	createCommentLike(params: LikeCommentParams): Promise<CommandResult<void>>;
	deleteCommentLike(params: LikeCommentParams): Promise<CommandResult<void>>;
	createPoemComment(params: {
		userId: number;
		poemId: number;
		content: string;
		parentId?: number;
	}): Promise<CommandResult<{ commentId: number }>>;
	deletePoemComment(params: {
		commentId: number;
		deletedBy: CommentStatus;
	}): Promise<CommandResult<void>>;
	updateComment(params: {
		commentId: number;
		content: string;
	}): Promise<CommandResult<void>>;
}

export interface CommandsRouterServices {
	likePoem(params: LikePoemParams): Promise<void>;
	unlikePoem(params: LikePoemParams): Promise<void>;
	commentPoem(params: CommentPoemParams): Promise<{ commentId: number }>;
	deleteComment(params: DeleteCommentParams): Promise<void>;
	likeComment(params: LikeCommentParams): Promise<void>;
	unlikeComment(params: LikeCommentParams): Promise<void>;
	patchComment(params: PatchCommentParams): Promise<void>;
}
