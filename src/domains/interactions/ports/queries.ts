import type { PoemComment, PoemCommentsPage } from './models';

export type GetPoemCommentsParams = {
	poemId: number;
	userId: number;
	parentId: number | undefined;
	cursor?: number;
	limit?: number;
};

export interface QueriesRepository {
	selectCommentById(params: {
		commentId: number;
		currentUserId?: number;
	}): Promise<PoemComment | null>;
	selectCommentsByPoemId(params: {
		poemId: number;
		parentId?: number;
		currentUserId?: number;
		viewerRole?: string;
		viewerStatus?: string;
		cursor?: number;
		limit?: number;
	}): Promise<PoemCommentsPage>;
	selectPoemLike(params: { userId: number; poemId: number }): Promise<boolean>;
	selectCommentLike(params: {
		userId: number;
		commentId: number;
	}): Promise<boolean>;
}

export interface QueriesRouterServices {
	getPoemComments(params: GetPoemCommentsParams): Promise<PoemCommentsPage>;
}
