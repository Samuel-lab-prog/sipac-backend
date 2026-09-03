import { Elysia } from 'elysia';
import {
	commandsRepository,
	queriesRepository,
} from './infra/commands-repository/repository';
import { createCommunicationsCommandsRouter } from './adapters/commands-router';
import { createCommunicationsQueriesRouter } from './adapters/queries-router';
import { createAnnouncementFactory } from './use-cases/commands/create-announcement/execute';
import { listAnnouncementsForUserFactory } from './use-cases/queries/list-announcements-for-user/execute';

const createAnnouncement = createAnnouncementFactory({ commandsRepository });
const listAnnouncementsForUser = listAnnouncementsForUserFactory({
	queriesRepository,
});

export const communicationsCommandsRouter = createCommunicationsCommandsRouter({
	createAnnouncement,
});

export const communicationsQueriesRouter = createCommunicationsQueriesRouter({
	listAnnouncementsForUser,
});

export const communicationsRouter = new Elysia()
	.use(communicationsCommandsRouter)
	.use(communicationsQueriesRouter);
