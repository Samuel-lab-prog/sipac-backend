import type { CommandResult } from '@SharedKernel/types/types';
import type { AvatarUploadUrlResult } from '@SharedKernel/ports/storage';
import type { Static } from 'elysia';
import type {
	CreateUser,
	CreateUserDB,
	User,
	UserRole,
	UserStatus,
	StudentRegistration,
} from './models';
import {
	avatarUploadRequestSchema,
	setAvatarSchema,
	changePasswordSchema,
	updateUserParamsSchema,
	updateUserSchema,
} from './schemas';

export type CreateUserParams = {
	data: CreateUser;
};

export type UpdateUserParams = {
	params: Static<typeof updateUserParamsSchema>;
	data: Static<typeof updateUserSchema>;
	clientRole: UserRole;
	clientStatus: UserStatus;
	clientId: number;
};

export type UpdateCurrentUserParams = {
	data: Static<typeof updateUserSchema>;
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};

export type CreateAvatarUploadUrlParams = {
	data: Static<typeof avatarUploadRequestSchema>;
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};

export type SetAvatarParams = {
	data: Static<typeof setAvatarSchema>;
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};

export type ChangePasswordParams = {
	data: Static<typeof changePasswordSchema>;
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};

export type GetUserByIdParams = {
	id: number;
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};

export type DeleteUserParams = GetUserByIdParams;
export type RestoreUserParams = GetUserByIdParams;

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<User>;
	updateUser: (params: UpdateUserParams) => Promise<User>;
	updateCurrentUser: (params: UpdateCurrentUserParams) => Promise<User>;
	createAvatarUploadUrl: (
		params: CreateAvatarUploadUrlParams,
	) => Promise<AvatarUploadUrlResult>;
	setAvatar: (params: SetAvatarParams) => Promise<User>;
	changePassword: (params: ChangePasswordParams) => Promise<User>;
	deleteUser: (params: DeleteUserParams) => Promise<User>;
	restoreUser: (params: RestoreUserParams) => Promise<User>;
}

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<User>>;
	selectLastStudentRegistrationAcademicId(): Promise<string | null>;
	insertStudentAccount(
		user: CreateUserDB,
		registration: Omit<StudentRegistration, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<CommandResult<User>>;
	updateUser(
		id: number,
		user: Partial<CreateUserDB>,
	): Promise<CommandResult<User>>;
	updateCurrentUser(
		clientId: number,
		user: Partial<CreateUserDB>,
	): Promise<CommandResult<User>>;
	getUserPasswordHashById(id: number): Promise<string | null>;
	deleteUser(id: number): Promise<CommandResult<User>>;
	restoreUser(id: number): Promise<CommandResult<User>>;
}
