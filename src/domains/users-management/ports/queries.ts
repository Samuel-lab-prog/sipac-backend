import type {
	UserPrivateProfile,
	UserPublicProfile,
	UsersPage,
	FullUser,
	UserStatus,
	UserRole,
} from './models';

export type GetUsersParams = {
	requesterStatus: UserStatus;
	navigationOptions: {
		limit?: number;
		cursor?: number;
	};
	filterOptions: {
		searchNickname?: string;
		role?: UserRole;
		status?: UserStatus;
	};
	sortOptions: {
		by: OrderBy;
		order: OrderDirection;
	};
};

export type GetProfileParams = {
	id: number;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export interface UsersQueriesRouterServices {
	getProfile: (
		params: GetProfileParams,
	) => Promise<UserPublicProfile | UserPrivateProfile>;
	searchUsers: (params: GetUsersParams) => Promise<UsersPage>;
	checkNickanmeAvailability: (nickname: string) => Promise<boolean>;
	checkEmailAvailability: (email: string) => Promise<boolean>;
}

export interface QueriesRepository {
	selectUserById(id: number): Promise<FullUser | null>;
	selectUserByNickname(nickname: string): Promise<FullUser | null>;
	selectUserByEmail(email: string): Promise<FullUser | null>;
	selectProfile(params: {
		id: number;
		isPrivate?: boolean;
		requesterId: number;
		requesterRole: UserRole;
		requesterStatus: UserStatus;
	}): Promise<UserPrivateProfile | UserPublicProfile | null>;
	selectUsers(params: SelectUsersParams): Promise<UsersPage>;
	findNickname(nickname: string): Promise<boolean>;
	findEmail(email: string): Promise<boolean>;
}

export type SelectUsersParams = {
	navigationOptions: NavigationOptions;
	filterOptions: FilterOptions;
	sortOptions: SortOptions;
};

type NavigationOptions = { cursor?: number; limit: number };
type FilterOptions = {
	searchNickname?: string;
	role?: UserRole;
	status?: UserStatus;
};
type OrderBy = Extract<'createdAt' | 'nickname' | 'id', keyof FullUser>;
type OrderDirection = 'asc' | 'desc';
type SortOptions = {
	orderBy: OrderBy;
	orderDirection: OrderDirection;
};
