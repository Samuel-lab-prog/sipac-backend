import { createAcademicCalendarQueriesRouter } from './adapters/queries-router';
import { queriesRepository } from './infra/queries-repository/repository';

export const academicCalendarQueriesRouter =
	createAcademicCalendarQueriesRouter(queriesRepository);
