import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { authClientSchema } from './schemas';

export type AuthClient = (typeof authClientSchema)['static'];

export type LoginResponse = {
	accessToken: string;
	refreshToken: string;
	client: AuthClient;
};

export type ClientAuthCredentials = {
	id: number;
	role: UserRole;
	email: string;
	status: UserStatus;
	passwordHash: string;
};
