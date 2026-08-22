import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { storageService } from '@SharedKernel/infra/storage/storage-service';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { createUsersCommandsRouter } from './adapters/commands-router';
import { createUsersReadRouter } from './adapters/queries-router';
import {
	createUserFactory,
	createAvatarUploadUrlFactory,
	setAvatarFactory,
	deleteUserFactory,
	updateCurrentUserFactory,
	restoreUserFactory,
	updateUserFactory,
} from './use-cases/commands';
import {
	getCurrentUserFactory,
	getUserByIdFactory,
	searchUsersFactory,
} from './use-cases/queries';

const createUser = createUserFactory({
	commandsRepository,
	hashServices: BcryptHashService,
});

const createUserWithFakeHash = createUserFactory({
	commandsRepository,
	hashServices: FakeHashService,
});

const searchUsers = searchUsersFactory({
	queriesRepository,
});

const getUserById = getUserByIdFactory({
	queriesRepository,
});

const getCurrentUser = getCurrentUserFactory({
	queriesRepository,
});

const updateUser = updateUserFactory({
	commandsRepository,
});

const updateCurrentUser = updateCurrentUserFactory({
	commandsRepository,
});

const createAvatarUploadUrl = createAvatarUploadUrlFactory({
	storageService,
});

const setAvatar = setAvatarFactory({
	commandsRepository,
});

const deleteUser = deleteUserFactory({
	commandsRepository,
});

const restoreUser = restoreUserFactory({
	commandsRepository,
});

export const userCommandsRouter = createUsersCommandsRouter({
	createUser,
	updateUser,
	updateCurrentUser,
	createAvatarUploadUrl,
	setAvatar,
	deleteUser,
	restoreUser,
});

export const userCommandsRouterWithFakeHash = createUsersCommandsRouter({
	createUser: createUserWithFakeHash,
	updateUser,
	updateCurrentUser,
	createAvatarUploadUrl,
	setAvatar,
	deleteUser,
	restoreUser,
});

export const userQueriesRouter = createUsersReadRouter({
	searchUsers,
	getUserById,
	getCurrentUser,
});
