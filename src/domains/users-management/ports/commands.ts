import type {
	FullUser,
	CreateUserDB,
	UpdateUserData,
	CreateUser,
	UserStatus,
} from './models';
import type { CommandResult } from '@SharedKernel/Types';
import type { AvatarUploadUrlResult } from '@SharedKernel/ports/Storage';

export type CreateUserParams = {
	data: CreateUser;
};

export type UpdateUserParams = {
	requesterId: number;
	requesterStatus: UserStatus;
	targetId: number;
	data: UpdateUserData;
};

export type RequestAvatarUploadUrlParams = {
	requesterId?: number | string;
	contentType: string;
	contentLength?: number;
};

export interface UsersCommandsServices {
	createUser: (params: CreateUserParams) => Promise<FullUser>;
	updateUser: (params: UpdateUserParams) => Promise<FullUser>;
	requestAvatarUploadUrl: (
		params: RequestAvatarUploadUrlParams,
	) => Promise<AvatarUploadUrlResult>;
}

export interface CommandsRepository {
	insertUser(user: CreateUserDB): Promise<CommandResult<FullUser>>;
	updateUser(
		userId: number,
		userData: UpdateUserData,
	): Promise<CommandResult<FullUser>>;
	softDeleteUser(id: number): Promise<CommandResult<FullUser>>;
}
