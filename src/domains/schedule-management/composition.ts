import { commandsRepository } from './infra/commands-repository/repository';
import { createScheduleCommandsRouter } from './adapters/commands-router';
import { createScheduleQueriesRouter } from './adapters/queries-router';
import { createClassSessionFactory } from './use-cases/commands/create-class-session/execute';
import { updateClassSessionFactory } from './use-cases/commands/update-class-session/execute';

const createClassSession = createClassSessionFactory({ commandsRepository });
const updateClassSession = updateClassSessionFactory({ commandsRepository });

export const scheduleCommandsRouter = createScheduleCommandsRouter({
	createClassSession,
	updateClassSession,
});

export const scheduleQueriesRouter = createScheduleQueriesRouter();
