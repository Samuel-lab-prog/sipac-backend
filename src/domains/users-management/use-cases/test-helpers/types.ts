import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';

export type UsersScenarioMocks = {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
};
