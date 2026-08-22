import { describe, expect, it, mock } from 'bun:test';
import { UnauthorizedError } from '@DomainError';
import { loginClientFactory } from './execute';

describe('authentication > loginClient', () => {
	it('logs in a valid client', async () => {
		const sut = loginClientFactory({
			tokenService: {
				generateToken: mock(() => 'jwt'),
				verifyToken: () => null,
			},
			hashService: {
				hash: mock(),
				compare: mock(async () => true),
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

		await expect(
			sut({ email: 'student@example.com', password: '12341234' }),
		).resolves.toMatchObject({
			accessToken: 'jwt',
			refreshToken: 'jwt',
		});
	});

	it('rejects invalid credentials', async () => {
		const sut = loginClientFactory({
			tokenService: {
				generateToken: mock(() => 'jwt'),
				verifyToken: () => null,
			},
			hashService: {
				hash: mock(),
				compare: mock(async () => false),
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

		await expect(
			sut({ email: 'student@example.com', password: 'wrong' }),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});
});
