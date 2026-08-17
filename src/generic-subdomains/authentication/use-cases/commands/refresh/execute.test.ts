import { UnauthorizedError } from '@DomainError';
import { describe, expect, it } from 'bun:test';

import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { makeAuthScenario } from '../../test-helpers/helper';

describe.concurrent('USE-CASE - Authentication - RefreshSession', () => {
	describe('Successful execution', () => {
		it('should refresh session with a valid refresh token', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ tokenType: 'refresh' })
				.withAuthUser()
				.withTokenGenerated();

			const result = await scenario.executeRefresh();

			expect(result).toEqual({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
				client: {
					id: expect.any(Number),
					role: expect.any(String),
					status: expect.any(String),
				},
			});
		});

		it('should return correct client data', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ email: 'admin@mail.com', tokenType: 'refresh' })
				.withAuthUser({
					id: 10,
					email: 'admin@mail.com',
					role: 'admin',
					status: 'active',
				})
				.withTokenGenerated('new-token');

			const result = await scenario.executeRefresh();

			expect(result).toEqual({
				accessToken: 'new-token',
				refreshToken: 'new-token',
				client: {
					id: 10,
					role: 'admin',
					status: 'active',
				},
			});
		});
	});

	describe('Token validation', () => {
		it('should throw UnauthorizedError when token is invalid', async () => {
			const scenario = makeAuthScenario().withTokenInvalid();

			await expectError(scenario.executeRefresh(), UnauthorizedError);
		});

		it('should throw UnauthorizedError when token is not a refresh token', async () => {
			const scenario = makeAuthScenario().withTokenValid({
				tokenType: 'access',
			});

			await expectError(scenario.executeRefresh(), UnauthorizedError);
		});

		it('should call verifyToken with provided token', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ tokenType: 'refresh' })
				.withAuthUser()
				.withTokenGenerated();

			await scenario.executeRefresh('provided-refresh-token');

			expect(scenario.mocks.tokenService.verifyToken).toHaveBeenCalledWith(
				'provided-refresh-token',
			);
		});
	});

	describe('Client validation', () => {
		it('should throw UnauthorizedError when client does not exist', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ tokenType: 'refresh' })
				.withAuthUserNotFound();

			await expectError(scenario.executeRefresh(), UnauthorizedError);
		});

		it('should throw UnauthorizedError when client is banned', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ tokenType: 'refresh' })
				.withAuthUser({ status: 'banned' });

			await expectError(scenario.executeRefresh(), UnauthorizedError);
		});

		it('should fetch client using email from token payload', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ email: 'reader@mail.com', tokenType: 'refresh' })
				.withAuthUser()
				.withTokenGenerated();

			await scenario.executeRefresh();

			expect(
				scenario.mocks.usersContract.selectAuthUserByEmail,
			).toHaveBeenCalledWith('reader@mail.com');
		});
	});

	describe('Token generation', () => {
		it('should generate access and refresh tokens with correct payloads', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid({ tokenType: 'refresh' })
				.withAuthUser({
					id: 42,
					role: 'author',
					email: 'poet@mail.com',
				})
				.withTokenGenerated();

			await scenario.executeRefresh();

			expect(scenario.mocks.tokenService.generateToken).toHaveBeenCalledWith(
				{
					clientId: 42,
					role: 'author',
					email: 'poet@mail.com',
					tokenType: 'access',
				},
				expect.any(Number),
			);
			expect(scenario.mocks.tokenService.generateToken).toHaveBeenCalledWith(
				{
					clientId: 42,
					role: 'author',
					email: 'poet@mail.com',
					tokenType: 'refresh',
				},
				expect.any(Number),
			);
		});

		it('should not generate tokens when refresh token is invalid', async () => {
			const scenario = makeAuthScenario().withTokenInvalid();

			await expectError(scenario.executeRefresh(), UnauthorizedError);

			expect(scenario.mocks.tokenService.generateToken).not.toHaveBeenCalled();
		});
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeAuthScenario().withTokenValid({
				tokenType: 'refresh',
			});

			scenario.mocks.usersContract.selectAuthUserByEmail.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeRefresh(), Error);
		});
	});
});
