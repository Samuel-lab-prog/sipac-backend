import { commandsRepository } from './infra/commands-repository/repository';
import { BcryptHashService, FakeHashService } from '@SharedKernel/infra/Bcrypt';
import type { UsersCommandsServices } from './ports/commands';
import { createUsersCommandsRouter } from './adapters/CommandsRouter';
import { createUsersInternalRouter } from './adapters/InternalRouter';
import {
	updateUserFactory,
	createUserFactory,
	requestAvatarUploadUrlFactory,
	bootstrapAdminFactory,
} from './use-cases/commands/index';
import {
	checkEmailAvailabilityFactory,
	checkNicknameAvailabilityFactory,
	getProfileFactory,
	getUsersFactory,
} from './use-cases/queries/index';
import type { UsersQueriesRouterServices } from './ports/queries';
import { queriesRepository } from './infra/queries-repository/repository';
import { createUsersReadRouter } from './adapters/QueriesRouter';
import { friendsPublicContract } from '@Domains/friends-management/public/Index';
import { storageService } from '@SharedKernel/infra/storage/storage.service';

const commandsServices: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository: commandsRepository,
		hashServices: BcryptHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
	requestAvatarUploadUrl: requestAvatarUploadUrlFactory({
		storageService: storageService,
	}),
};

const internalServices = {
	bootstrapAdmin: bootstrapAdminFactory({
		hashServices: BcryptHashService,
	}),
};

const commandsServicesWithFakeHash: UsersCommandsServices = {
	createUser: createUserFactory({
		commandsRepository: commandsRepository,
		hashServices: FakeHashService,
	}),
	updateUser: updateUserFactory({
		commandsRepository: commandsRepository,
	}),
	requestAvatarUploadUrl: requestAvatarUploadUrlFactory({
		storageService: storageService,
	}),
};

const internalServicesWithFakeHash = {
	bootstrapAdmin: bootstrapAdminFactory({
		hashServices: FakeHashService,
	}),
};

const queriesServices: UsersQueriesRouterServices = {
	getProfile: getProfileFactory({
		queriesRepository: queriesRepository,
		friendsContract: friendsPublicContract,
	}) as UsersQueriesRouterServices['getProfile'],
	searchUsers: getUsersFactory({
		queriesRepository: queriesRepository,
	}),
	checkNickanmeAvailability: checkNicknameAvailabilityFactory({
		queriesRepository: queriesRepository,
	}),
	checkEmailAvailability: checkEmailAvailabilityFactory({
		queriesRepository: queriesRepository,
	}),
};

export const userCommandsRouter = createUsersCommandsRouter(commandsServices);
export const userCommandsRouterWithFakeHash = createUsersCommandsRouter(
	commandsServicesWithFakeHash,
);
export const userInternalRouter = createUsersInternalRouter(internalServices);
export const userInternalRouterWithFakeHash = createUsersInternalRouter(
	internalServicesWithFakeHash,
);
export const userQueriesRouter = createUsersReadRouter(queriesServices);
