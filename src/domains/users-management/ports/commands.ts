import type { CommandResult } from '@SharedKernel/Types';
import type { CreateUser, CreateUserDB, User } from './models';

export type CreateUserParams = {
	data: CreateUser;
};

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<User>;
}

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<User>>;
}
