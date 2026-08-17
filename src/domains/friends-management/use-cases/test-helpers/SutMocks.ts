import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testing/utils';
import type { EventBus } from '@SharedKernel/events/EventBus';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import {
	acceptFriendRequestFactory,
	blockUserFactory,
	cancelFriendRequestFactory,
	deleteFriendFactory,
	rejectFriendRequestFactory,
	sendFriendRequestFactory,
	unblockUserFactory,
} from '../commands/Index';
import { getMyFriendRequestsFactory } from '../queries/Index';

export type FriendsManagementSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
	eventBus: MockedContract<EventBus>;
};

export function friendsManagementMockFactories(): FriendsManagementSutMocks {
	const eventBus = createMockedContract<EventBus>({
		publish: mock(),
		subscribe: mock().mockReturnValue(() => { }),
		once: mock().mockReturnValue(() => { }),
	});

	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createFriendRequest: mock(),
			rejectFriendRequest: mock(),
			acceptFriendRequest: mock(),
			cancelFriendRequest: mock(),
			blockUser: mock(),
			unblockUser: mock(),
			deleteFriend: mock(),
			deleteFriendRequestIfExists: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			findFriendshipBetweenUsers: mock(),
			findFriendRequest: mock(),
			findBlockedRelationship: mock(),
			selectFriendRequestsByUser: mock(),
		}),
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectUsersBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),
		eventBus,
	};
}

type FriendsManagementDeps = FriendsManagementSutMocks;

export function friendsManagementFactory(deps: FriendsManagementDeps) {
	return {
		sendFriendRequest: sendFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
			eventBus: deps.eventBus,
		}),
		acceptFriendRequest: acceptFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
			eventBus: deps.eventBus,
		}),
		rejectFriendRequest: rejectFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		cancelFriendRequest: cancelFriendRequestFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		deleteFriend: deleteFriendFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		blockUser: blockUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		unblockUser: unblockUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
		}),
		getMyFriendRequests: getMyFriendRequestsFactory({
			queriesRepository: deps.queriesRepository,
		}),
	};
}
