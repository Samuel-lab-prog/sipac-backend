import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import {
	type MockedContract,
	createMockedContract,
} from '@GenericSubdomains/utils/testing/utils';
import { mock } from 'bun:test';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';

export type NotificationsSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	usersContract: MockedContract<UsersPublicContract>;
};

import {
	createNotificationFactory,
	deleteAllNotificationsFactory,
	deleteNotificationFactory,
	markNotificationAsReadFactory,
} from '../commands/Index';

import { markAllNotificationsAsReadFactory } from '../commands/mark-all/execute';
import {
	getNotificationByIdFactory,
	getUserNotificationsFactory,
} from '../queries/Index';

export function notificationsMockFactory() {
	return {
		usersContract: createMockedContract<UsersPublicContract>({
			selectUserBasicInfo: mock(),
			selectUsersBasicInfo: mock(),
			selectAuthUserByEmail: mock(),
		}),
		commandsRepository: createMockedContract<CommandsRepository>({
			insertNotification: mock(),
			markNotificationAsRead: mock(),
			deleteNotification: mock(),
			deleteAllNotifications: mock(),
			markAllAsRead: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectUserNotifications: mock(),
			selectNotificationById: mock(),
		}),
	};
}

type Deps = ReturnType<typeof notificationsMockFactory>;

export function notificationsFactory(deps: Deps) {
	return {
		createNotification: createNotificationFactory(deps),
		deleteNotification: deleteNotificationFactory(deps),
		deleteAllNotifications: deleteAllNotificationsFactory(deps),
		markNotificationAsRead: markNotificationAsReadFactory(deps),
		getUserNotifications: getUserNotificationsFactory(deps),
		getNotificationById: getNotificationByIdFactory(deps),
		markAllAsRead: markAllNotificationsAsReadFactory(deps),
	};
}
