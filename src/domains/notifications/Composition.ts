import { createNotificationsCommandsRouter } from './adapters/CommandsRouter';
import { createNotificationsQueriesRouter } from './adapters/QueriesRouter';
import { queriesRepository } from './infra/queries-repository/repository';
import { commandsRepository } from './infra/commands-repository/repository';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import type { NotificationsQueriesServices } from './ports/queries';
import type { NotificationsCommandsServices } from './ports/commands';
import {
	getUserNotificationsFactory,
	getNotificationByIdFactory,
} from './use-cases/queries/Index';
import {
	markNotificationAsReadFactory,
	deleteNotificationFactory,
	deleteAllNotificationsFactory,
} from './use-cases/commands/Index';
import { createNotificationFactory } from './use-cases/commands/create-notification/execute';
import { markAllNotificationsAsReadFactory } from './use-cases/commands/mark-all/execute';

const notificationsQueriesServices: NotificationsQueriesServices = {
	getUserNotifications: getUserNotificationsFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	getNotificationById: getNotificationByIdFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
};

export const notificationsCommandsServices: NotificationsCommandsServices = {
	markAsRead: markNotificationAsReadFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	deleteNotification: deleteNotificationFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	createNotification: createNotificationFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	markAllAsRead: markAllNotificationsAsReadFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
	deleteAllNotifications: deleteAllNotificationsFactory({
		commandsRepository,
		usersContract: usersPublicContract,
	}),
};

export const notificationsQueriesRouter = createNotificationsQueriesRouter(
	notificationsQueriesServices,
);

export const notificationsCommandsRouter = createNotificationsCommandsRouter(
	notificationsCommandsServices,
);
