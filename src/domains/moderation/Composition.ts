import {
	banUserFactory,
	moderatePoemFactory,
	suspendUserFactory,
	unbanUserFactory,
	unsuspendUserFactory,
} from './use-cases/commands/Index';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { CommandsRouterServices } from './ports/commands';
import { createModerationCommandsRouter } from './adapters/CommandsRouter';
import { eventBus } from '@SharedKernel/events/EventBus';
import type { QueriesRouterServices } from './ports/queries';
import { createModerationQueriesRouter } from './adapters/QueriesRouter';
import {
	getUserSanctionStatusFactory,
	getUserSanctionsFactory,
} from './use-cases/queries/Index';

const commandsServices: CommandsRouterServices = {
	banUser: banUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	suspendUser: suspendUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	unbanUser: unbanUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	unsuspendUser: unsuspendUserFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	moderatePoem: moderatePoemFactory({
		commandsRepository,
		queriesRepository,
		eventBus: eventBus,
	}),
};

export const moderationCommandsRouter =
	createModerationCommandsRouter(commandsServices);

const queriesServices: QueriesRouterServices = {
	getUserSanctions: getUserSanctionsFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	getUserSanctionStatus: getUserSanctionStatusFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
};

export const moderationQueriesRouter =
	createModerationQueriesRouter(queriesServices);
