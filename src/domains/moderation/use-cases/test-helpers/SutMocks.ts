import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testing/utils';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/commands';
import type { UsersServicesForModeration } from '../../ports/externalServices';
import type { QueriesRepository } from '../../ports/queries';
import {
	banUserFactory,
	suspendUserFactory,
	unbanUserFactory,
	unsuspendUserFactory,
} from '../commands/Index';
import {
	getUserSanctionStatusFactory,
	getUserSanctionsFactory,
} from '../queries/Index';

export type ModerationSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersServicesForModeration>;
};

export function moderationMockFactories(): ModerationSutMocks {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createBan: mock(),
			createSuspension: mock(),
			updatePoemModerationStatus: mock(),
			endBan: mock(),
			endSuspension: mock(),
			activateUser: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectActiveBanByUserId: mock(),
			selectActiveSuspensionByUserId: mock(),
			selectUserSanctions: mock(),
			selectPoemById: mock(),
			selectPoemNotificationsData: mock(),
		}),
		usersContract: createMockedContract<UsersServicesForModeration>({
			selectUserBasicInfo: mock(),
		}),
	};
}

type ModerationDeps = ModerationSutMocks;

export function moderationFactory(deps: ModerationDeps) {
	return {
		banUser: banUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		suspendUser: suspendUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		unbanUser: unbanUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		unsuspendUser: unsuspendUserFactory({
			commandsRepository: deps.commandsRepository,
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		getUserSanctions: getUserSanctionsFactory({
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
		getUserSanctionStatus: getUserSanctionStatusFactory({
			queriesRepository: deps.queriesRepository,
			usersContract: deps.usersContract,
		}),
	};
}
