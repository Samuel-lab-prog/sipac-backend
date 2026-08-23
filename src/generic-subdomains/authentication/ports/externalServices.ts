import type { AuthClient } from './models';

export type LoginClientParams = {
	cpf: string;
	password: string;
};

export interface AuthControllerServices {
	login: (
		params: LoginClientParams,
	) => Promise<import('./models').LoginResponse>;
	refreshSession: (
		refreshToken: string,
	) => Promise<import('./models').LoginResponse>;
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
