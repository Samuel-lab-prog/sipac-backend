import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testing/utils';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import { createUserFactory } from '../commands/create/execute';
import { updateUserFactory } from '../commands/update/execute';
import { checkEmailAvailabilityFactory } from '../queries/check-email/execute';
import { checkNicknameAvailabilityFactory } from '../queries/check-nickname/execute';
import { getProfileFactory } from '../queries/get-profile/execute';
import { getUsersFactory } from '../queries/search-users/execute';

export type UsersManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	hashServices: MockedContract<HashServices>;
	friendsContract: MockedContract<FriendsPublicContract>;
};

export function usersManagementMockFactories() {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			insertUser: mock(),
			updateUser: mock(),
			softDeleteUser: mock(),
		}),

		queriesRepository: createMockedContract<QueriesRepository>({
			selectUserById: mock(),
			selectUserByNickname: mock(),
			selectUserByEmail: mock(),
			selectProfile: mock(),
			selectUsers: mock(),
			findNickname: mock(),
			findEmail: mock(),
		}),

		hashServices: createMockedContract<HashServices>({
			hash: mock(),
			compare: mock(),
		}),
		friendsContract: createMockedContract<FriendsPublicContract>({
			selectUsersRelation: mock(),
			selectRelation: mock(),
			selectFollowedUserIds: mock(),
			selectBlockedUserIds: mock(),
			areFriends: mock(),
			areBlocked: mock(),
		}),
	};
}

type UsersManagementDeps = ReturnType<typeof usersManagementMockFactories>;

export function usersManagementFactory(deps: UsersManagementDeps) {
	return {
		createUser: createUserFactory(deps),
		updateUser: updateUserFactory(deps),
		checkEmailAvailability: checkEmailAvailabilityFactory(deps),
		checkNicknameAvailability: checkNicknameAvailabilityFactory(deps),
		getProfile: getProfileFactory(deps),
		getUsers: getUsersFactory(deps),
	};
}
