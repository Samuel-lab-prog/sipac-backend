import type { Static } from 'elysia';
import { paginatedUsersSchema } from './schemas';

export type SearchUsersParams = {
	searchTerm?: string;
	limit?: number;
	cursor?: number;
};

export type PaginatedUsers = Static<typeof paginatedUsersSchema>;

export interface UsersQueriesRouterServices {
	searchUsers: (params: SearchUsersParams) => Promise<PaginatedUsers>;
}

export interface QueriesRepository {
	selectUsers(params: {
		searchTerm?: string;
		limit: number;
		cursor?: number;
	}): Promise<PaginatedUsers>;
}
