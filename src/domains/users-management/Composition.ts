import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { createUsersCommandsRouter } from './adapters/commands-router';
import { createUsersReadRouter } from './adapters/queries-router';
import { createUserFactory } from './use-cases/commands';
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

export const userCommandsRouter = createUsersCommandsRouter({
	createUser,
});

export const userCommandsRouterWithFakeHash = createUsersCommandsRouter({
	createUser: createUserWithFakeHash,
});

export const userQueriesRouter = createUsersReadRouter({
	searchUsers,
});
