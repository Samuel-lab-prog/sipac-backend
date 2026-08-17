import {
	PoemCommentSchema,
	CommentStatusSchema,
	PoemCommentsPageSchema,
} from '../ports/schemas/Index';

export type PoemComment = (typeof PoemCommentSchema)['static'];
export type PoemCommentsPage = (typeof PoemCommentsPageSchema)['static'];
export type CommentStatus = (typeof CommentStatusSchema)['static'];
export type CommentLike = {
	userId: number;
	commentId: number;
	poemId: number;
};
