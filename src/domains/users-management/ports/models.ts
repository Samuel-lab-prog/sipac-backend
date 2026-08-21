import { createUserSchema, userSchema } from '../ports/schemas';

export type User = (typeof userSchema)['static'];
export type CreateUser = (typeof createUserSchema)['static'];
export type CreateUserDB = Omit<CreateUser, 'password'> & {
	passwordHash: string;
};
