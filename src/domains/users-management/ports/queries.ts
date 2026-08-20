import type { User } from './models';

export type SearchUsersParams = {
	searchTerm?: string;
	limit?: number;
	cursor?: number;
};

export interface UsersQueriesRouterServices {
	searchUsers: (params: SearchUsersParams) => Promise<{ users: User[]; hasMore: boolean; nextCursor?: number }>;
}

export interface QueriesRepository {
	selectUsers(params: {
		searchTerm?: string;
		limit: number;
		cursor?: number;
	}): Promise<{ users: User[]; hasMore: boolean; nextCursor?: number }>;
}
