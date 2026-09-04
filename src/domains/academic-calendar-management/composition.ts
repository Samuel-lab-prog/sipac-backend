import { createAcademicCalendarQueriesRouter } from './adapters/queries-router';
import { createAcademicCalendarCommandsRouter } from './adapters/commands-router';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';

export const academicCalendarQueriesRouter =
	createAcademicCalendarQueriesRouter(queriesRepository);
export const academicCalendarCommandsRouter =
	createAcademicCalendarCommandsRouter(commandsRepository);
