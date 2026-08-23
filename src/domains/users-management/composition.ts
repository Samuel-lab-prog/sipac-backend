import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { storageService } from '@SharedKernel/infra/storage/storage-service';
import { Elysia } from 'elysia';
import { commandsRepository } from './infra/commands-repository/repository';
import { queriesRepository } from './infra/queries-repository/repository';
import { commandsRepository as academicCommandsRepository } from '@Domains/academic-management/infra/commands-repository/repository';
import {
	createUsersAuthenticatedCommandsRouter,
	createUsersPublicCommandsRouter,
} from './adapters/commands-router';
import { createUsersReadRouter } from './adapters/queries-router';
import {
	createUserFactory,
	createAvatarUploadUrlFactory,
	changePasswordFactory,
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
	academicCommandsRepository,
	hashServices: BcryptHashService,
});

const createUserWithFakeHash = createUserFactory({
	commandsRepository,
	academicCommandsRepository,
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

const changePassword = changePasswordFactory({
	commandsRepository,
	hashServices: BcryptHashService,
});

const deleteUser = deleteUserFactory({
	commandsRepository,
});

const restoreUser = restoreUserFactory({
	commandsRepository,
});

const usersPublicCommandsRouter = createUsersPublicCommandsRouter();

const usersAuthenticatedCommandsRouter = createUsersAuthenticatedCommandsRouter(
	{
		createUser,
		updateUser,
		updateCurrentUser,
		createAvatarUploadUrl,
		setAvatar,
		changePassword,
		deleteUser,
		restoreUser,
	},
);

export const userCommandsRouter = new Elysia()
	.use(usersPublicCommandsRouter)
	.use(usersAuthenticatedCommandsRouter);

export const userCommandsRouterWithFakeHash = new Elysia()
	.use(createUsersPublicCommandsRouter())
	.use(
		createUsersAuthenticatedCommandsRouter({
			createUser: createUserWithFakeHash,
			updateUser,
			updateCurrentUser,
			createAvatarUploadUrl,
			setAvatar,
			changePassword,
			deleteUser,
			restoreUser,
		}),
	);

export const userQueriesRouter = createUsersReadRouter({
	searchUsers,
	getUserById,
	getCurrentUser,
});
