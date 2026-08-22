import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { createUsersCommandsRouter } from './adapters/commands-router';
import { createUsersReadRouter } from './adapters/queries-router';
import {
	createUserFactory,
	updateCurrentUserFactory,
	updateUserFactory,
} from './use-cases/commands';
import { searchUsersFactory } from './use-cases/queries';

const createUser = createUserFactory({
	commandsRepository,
	hashServices: BcryptHashService,
});

const createUserWithFakeHash = createUserFactory({
	commandsRepository,
	hashServices: FakeHashService,
});

const searchUsers = searchUsersFactory({
	queriesRepository,
});

const updateUser = updateUserFactory({
	commandsRepository,
});

const updateCurrentUser = updateCurrentUserFactory({
	commandsRepository,
});

export const userCommandsRouter = createUsersCommandsRouter({
	createUser,
	updateUser,
	updateCurrentUser,
});

export const userCommandsRouterWithFakeHash = createUsersCommandsRouter({
	createUser: createUserWithFakeHash,
	updateUser,
	updateCurrentUser,
});

export const userQueriesRouter = createUsersReadRouter({
	searchUsers,
});
