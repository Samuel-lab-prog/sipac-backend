import { UnauthorizedError, UnprocessableEntityError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeAuthScenario } from '../../test-helpers/Helper';

describe.concurrent('USE-CASE - Authentication - AuthenticateClient', () => {
	describe('Successful execution', () => {
		it('should authenticate client with valid token', async () => {
			const scenario = makeAuthScenario().withTokenValid().withAuthUser();
			const result = await scenario.executeAuthenticate();

			expect(result).toEqual({
				id: expect.any(Number),
				role: expect.any(String),
				status: expect.any(String),
			});
		});

		it('should return correct client data', async () => {
			const scenario = makeAuthScenario().withTokenValid().withAuthUser({
				id: 99,
				role: 'admin',
				status: 'active',
			});

			const result = await scenario.executeAuthenticate();

			expect(result).toEqual({
				id: 99,
				role: 'admin',
				status: 'active',
			});
		});
	});

	describe('Token validation', () => {
		it('should throw UnprocessableEntityError when token is invalid', async () => {
			const scenario = makeAuthScenario().withTokenInvalid();
			await expectError(
				scenario.executeAuthenticate(),
				UnprocessableEntityError,
			);
		});

		it('should throw UnprocessableEntityError when token has no email', async () => {
			const scenario = makeAuthScenario().withTokenValid({ email: undefined });

			await expectError(
				scenario.executeAuthenticate(),
				UnprocessableEntityError,
			);
		});
	});

	describe('Client validation', () => {
		it('should throw UnauthorizedError when client does not exist', async () => {
			const scenario = makeAuthScenario()
				.withTokenValid()
				.withAuthUserNotFound();

			await expectError(scenario.executeAuthenticate(), UnauthorizedError);
		});
	});

	it('should throw UnauthorizedError when client is banned', async () => {
		const scenario = makeAuthScenario()
			.withTokenValid()
			.withAuthUser({ status: 'banned' });

		await expectError(scenario.executeAuthenticate(), UnauthorizedError);
	});

	describe('Error propagation', () => {
		it('should not swallow dependency errors', async () => {
			const scenario = makeAuthScenario().withTokenValid();

			scenario.mocks.usersContract.selectAuthUserByEmail.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeAuthenticate(), Error);
		});
	});

	it('should not fetch client when token is invalid', async () => {
		const scenario = makeAuthScenario().withTokenInvalid();

		await expectError(scenario.executeAuthenticate(), UnprocessableEntityError);

		expect(
			scenario.mocks.usersContract.selectUserBasicInfo,
		).not.toHaveBeenCalled();
	});
	it('should not fetch client when token has no email', async () => {
		const scenario = makeAuthScenario().withTokenValid({ email: undefined });

		await expectError(scenario.executeAuthenticate(), UnprocessableEntityError);

		expect(
			scenario.mocks.usersContract.selectUserBasicInfo,
		).not.toHaveBeenCalled();
	});
	it('should call verifyToken with provided token', async () => {
		const scenario = makeAuthScenario().withTokenValid().withAuthUser();

		await scenario.executeAuthenticate('my-token');

		expect(scenario.mocks.tokenService.verifyToken).toHaveBeenCalledWith(
			'my-token',
		);
	});
	it('should fetch client using email from token payload', async () => {
		const scenario = makeAuthScenario()
			.withTokenValid({ email: 'john@mail.com' })
			.withAuthUser();

		await scenario.executeAuthenticate();

		expect(
			scenario.mocks.usersContract.selectAuthUserByEmail,
		).toHaveBeenCalledWith('john@mail.com');
	});
	it('should not return sensitive client fields', async () => {
		const scenario = makeAuthScenario().withTokenValid().withAuthUser({
			passwordHash: 'secret',
		});

		const result = await scenario.executeAuthenticate();

		expect(result).not.toHaveProperty('passwordHash');
	});

	it('should propagate usersContract errors', async () => {
		const scenario = makeAuthScenario().withTokenValid();

		scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
			new Error('db error'),
		);

		await expectError(scenario.executeAuthenticate(), Error);
	});
});
