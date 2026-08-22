import type { Static } from 'elysia';
import { paginatedUsersSchema } from './schemas';
import type { User } from './models';

export type SearchUsersParams = {
	searchTerm?: string;
	limit?: number;
	cursor?: number;
};

export type PaginatedUsers = Static<typeof paginatedUsersSchema>;

export interface UsersQueriesRouterServices {
	searchUsers: (params: SearchUsersParams) => Promise<PaginatedUsers>;
	getUserById: (params: {
		id: number;
		clientId: number;
		clientRole: string;
		clientStatus: string;
	}) => Promise<User>;
}

export interface QueriesRepository {
	selectUsers(params: {
		searchTerm?: string;
		limit: number;
		cursor?: number;
	}): Promise<PaginatedUsers>;
	selectUserById(id: number): Promise<User | null>;
}
