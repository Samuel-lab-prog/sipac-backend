import { describe, expect, it } from 'bun:test';
import { UnauthorizedError, UnprocessableEntityError } from '@DomainError';
import { authenticateClientFactory } from './execute';

describe('authentication > authenticateClient', () => {
	it('authenticates an access token', async () => {
		const sut = authenticateClientFactory({
			tokenService: {
				verifyToken: () => ({
					clientId: 1,
					role: 'student',
					email: 'student@example.com',
					tokenType: 'access',
				}),
				generateToken: () => '',
			},
			usersContract: {
				selectAuthUserByEmail: async () => ({
					id: 1,
					role: 'student',
					email: 'student@example.com',
					status: 'active',
					passwordHash: 'hash',
				}),
			},
		});

		await expect(sut('token')).resolves.toMatchObject({
			id: 1,
			role: 'student',
			status: 'active',
		});
	});

	it('rejects invalid tokens', async () => {
		const sut = authenticateClientFactory({
			tokenService: {
				verifyToken: () => null,
				generateToken: () => '',
			},
			usersContract: {
				selectAuthUserByEmail: async () => null,
			},
		});

		await expect(sut('token')).rejects.toBeInstanceOf(UnprocessableEntityError);
	});

	it('rejects unknown users', async () => {
		const sut = authenticateClientFactory({
			tokenService: {
				verifyToken: () => ({
					clientId: 1,
					role: 'student',
					email: 'student@example.com',
					tokenType: 'access',
				}),
				generateToken: () => '',
			},
			usersContract: {
				selectAuthUserByEmail: async () => null,
			},
		});

		await expect(sut('token')).rejects.toBeInstanceOf(UnauthorizedError);
	});
});
