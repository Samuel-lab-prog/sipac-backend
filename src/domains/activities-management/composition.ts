import { commandsRepository } from './infra/commands-repository/repository';
import { createActivitiesCommandsRouter } from './adapters/commands-router';
import { createActivitiesQueriesRouter } from './adapters/queries-router';
import { createAcademicActivityFactory } from './use-cases/commands/create-academic-activity/execute';
import { createAcademicActivitySubmissionFactory } from './use-cases/commands/create-academic-activity-submission/execute';

const createAcademicActivity = createAcademicActivityFactory({ commandsRepository });
const createAcademicActivitySubmission = createAcademicActivitySubmissionFactory({ commandsRepository });

export const activitiesCommandsRouter = createActivitiesCommandsRouter({
	createAcademicActivity,
	createAcademicActivitySubmission,
});

export const activitiesQueriesRouter = createActivitiesQueriesRouter();
