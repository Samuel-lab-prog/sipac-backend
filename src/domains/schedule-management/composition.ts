import { commandsRepository } from './infra/commands-repository/repository';
import { createScheduleCommandsRouter } from './adapters/commands-router';
import { createScheduleQueriesRouter } from './adapters/queries-router';
import { deleteClassSessionFactory } from './use-cases/commands/delete-class-session/execute';
import { createClassSessionFactory } from './use-cases/commands/create-class-session/execute';
import { updateClassSessionFactory } from './use-cases/commands/update-class-session/execute';

const createClassSession = createClassSessionFactory({ commandsRepository });
const updateClassSession = updateClassSessionFactory({ commandsRepository });
const deleteClassSession = deleteClassSessionFactory({ commandsRepository });

export const scheduleCommandsRouter = createScheduleCommandsRouter({
	createClassSession,
	updateClassSession,
	deleteClassSession,
});

export const scheduleQueriesRouter = createScheduleQueriesRouter({
	listClassSessionsByClassOfferingId(classOfferingId) {
		return commandsRepository.selectClassSessionsByClassOfferingId(
			classOfferingId,
		);
	},
});
