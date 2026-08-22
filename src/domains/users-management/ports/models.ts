import { createUserSchema, userSchema } from '../ports/schemas';
import { userRoleSchema, userStatusSchema } from './schemas';
import type { Static } from 'elysia';

export type UserRole = Static<typeof userRoleSchema>;
export type UserStatus = Static<typeof userStatusSchema>;

export type User = (typeof userSchema)['static'];
export type CreateUser = (typeof createUserSchema)['static'];
export type CreateUserDB = Omit<CreateUser, 'password'> & {
	passwordHash: string;
	role?: UserRole;
	status?: UserStatus;
};
