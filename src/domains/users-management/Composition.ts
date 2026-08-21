import { BcryptHashService } from '@SharedKernel/infra/Bcrypt';
import { createUsersCommandsRouter } from './adapters/CommandsRouter';
import { createUsersReadRouter } from './adapters/QueriesRouter';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { createUserFactory } from './use-cases/commands';
import { searchUsersFactory } from './use-cases/queries';
import type { UsersCommandsServices } from './ports/commands';
import type { UsersQueriesRouterServices } from './ports/queries';

const commandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository,
		hashServices: BcryptHashService,
	}),
};

const queriesServices: UsersQueriesRouterServices = {
	searchUsers: searchUsersFactory({ queriesRepository }),
};

export const userCommandsRouter = createUsersCommandsRouter(commandsServices);
export const userCommandsRouterWithFakeHash = userCommandsRouter;
export const userQueriesRouter = createUsersReadRouter(queriesServices);
