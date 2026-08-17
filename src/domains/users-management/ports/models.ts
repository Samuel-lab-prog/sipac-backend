import type { ClientAuthCredentials } from '@SharedKernel/Types';

import {
	FullUserSchema,
	UserPreviewSchema,
	UsersPageSchema,
	UserPrivateProfileSchema,
	UserPublicProfileSchema,
	UserRoleEnumSchema,
	UserStatusEnumSchema,
	CreateUserSchema,
	UpdateUserBodySchema,
} from '../ports/schemas/Index';

export type FullUser = (typeof FullUserSchema)['static'];
export type UserPreview = (typeof UserPreviewSchema)['static'];
export type UsersPage = (typeof UsersPageSchema)['static'];
export type UserPrivateProfile = (typeof UserPrivateProfileSchema)['static'];
export type UserPublicProfile = (typeof UserPublicProfileSchema)['static'];
export type AuthUser = ClientAuthCredentials;

export type UserRole = (typeof UserRoleEnumSchema)['static'];
export type UserStatus = (typeof UserStatusEnumSchema)['static'];

export type CreateUser = (typeof CreateUserSchema)['static'];
export type CreateUserDB = Omit<CreateUser, 'password'> & {
	passwordHash: string;
};
export type CreateUserResult = CreateUser; //todo later
export type UpdateUserData = (typeof UpdateUserBodySchema)['static'];
export type UpdateUserDataDB = UpdateUserData;
export type UpdateUserResult = CreateUser; //todo later
