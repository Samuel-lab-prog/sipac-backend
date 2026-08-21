import type { TokenService } from '../../../ports/externalServices';
import { UnprocessableEntityError, UnauthorizedError } from '@DomainError';
import type { AuthClient } from '../../../ports/models';
import type { UsersPublicContract } from '@Domains/users-management/public';

export interface AuthenticateClientDependencies {
	tokenService: TokenService;
	usersContract: UsersPublicContract;
}

export function authenticateClientFactory(
	dependencies: AuthenticateClientDependencies,
) {
	const { tokenService, usersContract } = dependencies;
	return async function authenticateClient(token: string): Promise<AuthClient> {
		const payload = await tokenService.verifyToken(token);
		if (!payload || !payload.email || payload.tokenType !== 'access')
			throw new UnprocessableEntityError('Invalid token');

		const client = await usersContract.selectAuthUserByEmail(payload.email);
		if (!client) throw new UnauthorizedError('Client not found');

		if (client.status === 'blocked')
			throw new UnauthorizedError('Client is banned');

		return {
			id: client.id,
			role: client.role,
			status: client.status,
		};
	};
}
