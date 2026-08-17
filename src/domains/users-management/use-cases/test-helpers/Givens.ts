import { givenResolved } from '@GenericSubdomains/utils/testing/utils';
import type {
	FullUser,
	UserPrivateProfile,
	UserPublicProfile,
	UsersPage,
} from '../../ports/models';
import {
	DEFAULT_FULL_USER,
	DEFAULT_HASHED_PASSWORD,
	DEFAULT_PRIVATE_PROFILE,
	DEFAULT_PUBLIC_PROFILE,
	DEFAULT_USERS_PAGE,
} from './Constants';
import type { UsersManagementSutMocks } from './SutMocks';

export type FullUserOverride = Partial<FullUser>;
export type PrivateProfileOverride = Partial<UserPrivateProfile>;
export type PublicProfileOverride = Partial<UserPublicProfile>;
export type UsersPageOverride = Partial<UsersPage>;

export function givenHashedPassword(
	hashServices: UsersManagementSutMocks['hashServices'],
	hashedPassword: string = DEFAULT_HASHED_PASSWORD,
) {
	givenResolved(hashServices, 'hash', hashedPassword);
}

export function givenUserCreated(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
	overrides: FullUserOverride = {},
) {
	givenResolved(commandsRepository, 'insertUser', {
		ok: true,
		data: {
			...DEFAULT_FULL_USER,
			...overrides,
		},
	});
}

export function givenUserUpdated(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
	overrides: FullUserOverride = {},
) {
	givenResolved(commandsRepository, 'updateUser', {
		ok: true,
		data: {
			...DEFAULT_FULL_USER,
			...overrides,
		},
	});
}

export function givenCreateUserConflict(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
	message: string,
) {
	givenResolved(commandsRepository, 'insertUser', {
		ok: false,
		data: null,
		code: 'CONFLICT',
		message,
	});
}

export function givenUpdateUserConflict(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
	message: string,
) {
	givenResolved(commandsRepository, 'updateUser', {
		ok: false,
		data: null,
		code: 'CONFLICT',
		message,
	});
}

export function givenCreateUserFailure(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'insertUser', {
		ok: false,
		data: null,
		code: 'UNKNOWN',
		message: 'database is down',
	});
}

export function givenUpdateUserFailure(
	commandsRepository: UsersManagementSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'updateUser', {
		ok: false,
		data: null,
		code: 'UNKNOWN',
		message: 'database is down',
	});
}

export function givenProfile(
	queriesRepository: UsersManagementSutMocks['queriesRepository'],
	overrides: PrivateProfileOverride = {},
) {
	givenResolved(queriesRepository, 'selectProfile', {
		...DEFAULT_PRIVATE_PROFILE,
		...overrides,
	});
}

export function givenPublicProfile(
	queriesRepository: UsersManagementSutMocks['queriesRepository'],
	overrides: PublicProfileOverride = {},
) {
	givenResolved(queriesRepository, 'selectProfile', {
		...DEFAULT_PUBLIC_PROFILE,
		...overrides,
	});
}

export function givenRelation(
	friendsContract: UsersManagementSutMocks['friendsContract'],
	overrides: Partial<{
		friends: boolean;
		blockedId: number | null;
		blockedBy: number | null;
		requestSentByUserId: number | null;
	}> = {},
) {
	givenResolved(friendsContract, 'selectRelation', {
		friends: false,
		blockedId: null,
		blockedBy: null,
		requestSentByUserId: null,
		...overrides,
	});
}

export function givenProfileNotFound(
	queriesRepository: UsersManagementSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectProfile', null);
}

export function givenUsersPage(
	queriesRepository: UsersManagementSutMocks['queriesRepository'],
	overrides: UsersPageOverride = {},
) {
	givenResolved(queriesRepository, 'selectUsers', {
		...DEFAULT_USERS_PAGE,
		...overrides,
	});
}
