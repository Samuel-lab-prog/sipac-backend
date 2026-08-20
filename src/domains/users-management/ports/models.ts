import { CreateUserSchema, UserSchema } from '../ports/schemas/Index';

export type User = (typeof UserSchema)['static'];
export type CreateUser = (typeof CreateUserSchema)['static'];
export type CreateUserDB = Omit<CreateUser, 'password'> & {
	passwordHash: string;
};
