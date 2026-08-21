import { authClientSchema } from './schemas/auth-client-schema';

export type AuthClient = (typeof authClientSchema)['static'];

export type LoginResponse = {
	accessToken: string;
	refreshToken: string;
	client: AuthClient;
};

export type ClientAuthCredentials = {
	id: number;
	role: string;
	email: string;
	status: string;
	passwordHash: string;
};
