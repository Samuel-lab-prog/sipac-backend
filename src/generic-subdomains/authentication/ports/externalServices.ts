import type { AuthClient, LoginResponse } from './models';

export type LoginClientParams = {
	email: string;
	password: string;
};
export interface AuthControllerServices {
	login: (params: LoginClientParams) => Promise<LoginResponse>;
	refreshSession: (refreshToken: string) => Promise<LoginResponse>;
}

export interface authPluginServices {
	authenticate: (token: string) => Promise<AuthClient>;
}

export type TokenPayload = {
	clientId: number;
	role: string;
	email: string;
	tokenType: 'access' | 'refresh';
};

export interface TokenService {
	generateToken(payload: TokenPayload, expiresIn: number): string;
	verifyToken(token: string): TokenPayload | null;
}
