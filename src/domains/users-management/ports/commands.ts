import type { CommandResult } from '@SharedKernel/types/types';
import type { Static } from 'elysia';
import type { CreateUser, CreateUserDB, User } from './models';
import { updateUserParamsSchema, updateUserSchema } from './schemas';

export type CreateUserParams = {
	data: CreateUser;
};

export type UpdateUserParams = {
	params: Static<typeof updateUserParamsSchema>;
	data: Static<typeof updateUserSchema>;
	clientRole: string;
	clientStatus: string;
	clientId: number;
};

export type UpdateCurrentUserParams = {
	data: Static<typeof updateUserSchema>;
	clientId: number;
	clientRole: string;
	clientStatus: string;
};

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<User>;
	updateUser: (params: UpdateUserParams) => Promise<User>;
	updateCurrentUser: (params: UpdateCurrentUserParams) => Promise<User>;
}

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<User>>;
	updateUser(
		id: number,
		user: Partial<CreateUserDB>,
	): Promise<CommandResult<User>>;
	updateCurrentUser(
		clientId: number,
		user: Partial<CreateUserDB>,
	): Promise<CommandResult<User>>;
}
