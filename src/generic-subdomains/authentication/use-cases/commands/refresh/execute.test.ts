import { describe, expect, it, mock } from 'bun:test';
import { UnauthorizedError } from '@DomainError';
import { refreshSessionFactory } from './execute';

describe('authentication > refreshSession', () => {
	it('refreshes a valid token', async () => {
		const sut = refreshSessionFactory({
			tokenService: {
				verifyToken: () => ({
					clientId: 1,
					role: 'student',
					email: 'student@example.com',
					tokenType: 'refresh',
				}),
				generateToken: mock(() => 'jwt'),
			},
			usersContract: {
				selectAuthUserByEmail: async () => ({
					id: 1,
					email: 'student@example.com',
					role: 'student',
					status: 'active',
					passwordHash: 'hash',
				}),
			},
		});

		await expect(sut('refresh-token')).resolves.toMatchObject({
			accessToken: 'jwt',
			refreshToken: 'jwt',
		});
	});

	it('rejects invalid refresh tokens', async () => {
		const sut = refreshSessionFactory({
			tokenService: {
				verifyToken: () => null,
				generateToken: mock(() => 'jwt'),
			},
			usersContract: {
				selectAuthUserByEmail: async () => null,
			},
		});

		await expect(sut('refresh-token')).rejects.toBeInstanceOf(
			UnauthorizedError,
		);
	});
});
