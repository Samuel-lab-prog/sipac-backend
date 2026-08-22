import type { Static } from 'elysia';
import { paginatedUsersSchema } from './schemas';
import type { User, UserRole, UserStatus } from './models';

export type SearchUsersParams = {
	searchTerm?: string;
	role?: UserRole;
	status?: UserStatus;
	deleted?: boolean;
	campus?: string;
	department?: string;
	course?: string;
	limit?: number;
	cursor?: number;
};

export type PaginatedUsers = Static<typeof paginatedUsersSchema>;

export interface UsersQueriesRouterServices {
	searchUsers: (params: SearchUsersParams) => Promise<PaginatedUsers>;
	getUserById: (params: {
		id: number;
		clientId: number;
		clientRole: UserRole;
		clientStatus: UserStatus;
	}) => Promise<User>;
	getCurrentUser: (params: {
		clientId: number;
		clientRole: UserRole;
		clientStatus: UserStatus;
	}) => Promise<User>;
}

export interface QueriesRepository {
	selectUsers(params: {
		searchTerm?: string;
		role?: UserRole;
		status?: UserStatus;
		deleted?: boolean;
		campus?: string;
		department?: string;
		course?: string;
		limit: number;
		cursor?: number;
	}): Promise<PaginatedUsers>;
	selectUserById(id: number): Promise<User | null>;
}
