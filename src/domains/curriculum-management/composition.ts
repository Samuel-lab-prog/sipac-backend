import { createCurriculumCommandsRouter } from './adapters/commands-router';
import { createCurriculumQueriesRouter } from './adapters/queries-router';
import { commandsRepository } from './infra/commands-repository/repository';
import { createAcademicPeriodFactory } from './use-cases/commands/create-academic-period/execute';
import { createClassOfferingFactory } from './use-cases/commands/create-class-offering/execute';

const createAcademicPeriod = createAcademicPeriodFactory({
	commandsRepository,
});
const createClassOffering = createClassOfferingFactory({
	commandsRepository,
});

export const curriculumCommandsRouter = createCurriculumCommandsRouter({
	createAcademicPeriod,
	createClassOffering,
});

export const curriculumQueriesRouter = createCurriculumQueriesRouter();
