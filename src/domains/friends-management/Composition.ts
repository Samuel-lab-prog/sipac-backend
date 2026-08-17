import { createFriendsCommandsRouter } from './adapters/CommandsRouter';
import { createFriendsQueriesRouter } from './adapters/QueriesRouter';
import { type CommandsRouterServices } from './ports/commands';
import { type QueriesRouterServices } from './ports/queries';
import {
	cancelFriendRequestFactory,
	rejectFriendRequestFactory,
	sendFriendRequestFactory,
	acceptFriendRequestFactory,
	blockUserFactory,
	deleteFriendFactory,
	unblockUserFactory,
} from './use-cases/commands/Index';
import { getMyFriendRequestsFactory } from './use-cases/queries/Index';

import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import { eventBus } from '@SharedKernel/events/EventBus';

const commandsServices: CommandsRouterServices = {
	cancelFriendRequest: cancelFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	rejectFriendRequest: rejectFriendRequestFactory({
		commandsRepository,
		queriesRepository,
	}),
	sendFriendRequest: sendFriendRequestFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
		eventBus: eventBus,
	}),
	acceptFriendRequest: acceptFriendRequestFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
		eventBus: eventBus,
	}),
	blockUser: blockUserFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	deleteFriend: deleteFriendFactory({
		commandsRepository,
		queriesRepository,
	}),
	unblockUser: unblockUserFactory({
		commandsRepository,
		queriesRepository,
	}),
};

const queriesServices: QueriesRouterServices = {
	getMyFriendRequests: getMyFriendRequestsFactory({
		queriesRepository,
	}),
};

export const friendsCommandsRouter =
	createFriendsCommandsRouter(commandsServices);
export const friendsQueriesRouter = createFriendsQueriesRouter(queriesServices);
