import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import type { StorageService } from '@SharedKernel/ports/storage';

export type UsersScenarioMocks = {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	storageService: StorageService;
};
