import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { UnauthorizedError } from '@DomainError';
import {
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_EXPIRATION_TIME,
} from 'server-config/config';
import type {
	TokenPayload,
	TokenService,
} from '../../../ports/externalServices';
import type { LoginResponse } from '../../../ports/models';

export interface RefreshSessionDependencies {
	tokenService: TokenService;
	usersContract: UsersPublicContract;
}

export function refreshSessionFactory(
	dependencies: RefreshSessionDependencies,
) {
	const { tokenService, usersContract } = dependencies;

	return async function refreshSession(
		refreshToken: string,
	): Promise<LoginResponse> {
		const payload = tokenService.verifyToken(refreshToken);

		if (!payload || payload.tokenType !== 'refresh')
			throw new UnauthorizedError('Invalid refresh token');

		const client = await usersContract.selectAuthUserByEmail(payload.email);
		if (!client) throw new UnauthorizedError('Client not found');

		if (client.status === 'blocked')
			throw new UnauthorizedError('Client is banned');

		const accessTokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
			tokenType: 'access',
		};

		const refreshTokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
			tokenType: 'refresh',
		};

		const nextAccessToken = tokenService.generateToken(
			accessTokenPayload,
			ACCESS_TOKEN_EXPIRATION_TIME,
		);
		const nextRefreshToken = tokenService.generateToken(
			refreshTokenPayload,
			REFRESH_TOKEN_EXPIRATION_TIME,
		);

		return {
			accessToken: nextAccessToken,
			refreshToken: nextRefreshToken,
			client: {
				id: client.id,
				role: client.role,
				status: client.status,
			},
		};
	};
}
