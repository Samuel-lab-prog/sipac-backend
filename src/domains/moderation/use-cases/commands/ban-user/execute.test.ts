import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import type { BannedUserResponse } from '../../../ports/models';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Ban User', () => {
		it('bans a user successfully', async () => {
			const bannedResponse: BannedUserResponse = {
				id: 1,
				bannedUserId: 2,
				reason: 'spam',
				moderatorId: 1,
				bannedAt: new Date(),
			};

			const scenario = makeModerationScenario()
				.withUser()
				.withNoActiveBan()
				.withNoActiveSuspension()
				.withBanCreated(bannedResponse);

			const result = await scenario.executeBanUser({
				userId: 2,
				reason: 'spam',
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(result).toEqual(bannedResponse);
			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).toHaveBeenCalledWith(2);
			expect(
				scenario.mocks.queriesRepository.selectActiveBanByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(scenario.mocks.commandsRepository.createBan).toHaveBeenCalledWith({
				userId: 2,
				reason: 'spam',
				moderatorId: 1,
			});
		});

		it('Does not allow banning oneself', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeBanUser({
					userId: 1,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).not.toHaveBeenCalled();
			expect(
				scenario.mocks.commandsRepository.createBan,
			).not.toHaveBeenCalled();
		});

		it('throws InsufficientPermissionsError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeBanUser({
					userId: 2,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'author',
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).not.toHaveBeenCalled();
			expect(
				scenario.mocks.commandsRepository.createBan,
			).not.toHaveBeenCalled();
		});

		it('throws ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeBanUser({
					requesterStatus: 'suspended',
				}),
				ForbiddenError,
			);

			expect(
				scenario.mocks.usersContract.selectUserBasicInfo,
			).not.toHaveBeenCalled();
			expect(
				scenario.mocks.commandsRepository.createBan,
			).not.toHaveBeenCalled();
		});

		it('throws UserNotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeBanUser({
					userId: 99,
					reason: 'spam',
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				NotFoundError,
			);

			expect(
				scenario.mocks.commandsRepository.createBan,
			).not.toHaveBeenCalled();
		});

		it('throws UserAlreadyBannedError if user already has an active ban', async () => {
			const scenario = makeModerationScenario().withUser().withActiveBan();

			await expectError(scenario.executeBanUser(), ConflictError);

			expect(
				scenario.mocks.commandsRepository.createBan,
			).not.toHaveBeenCalled();
		});

		it('allows banning a suspended user', async () => {
			const bannedResponse: BannedUserResponse = {
				id: 1,
				bannedUserId: 2,
				reason: 'spam',
				moderatorId: 1,
				bannedAt: new Date(),
			};

			const scenario = makeModerationScenario()
				.withUser()
				.withActiveSuspension()
				.withNoActiveBan()
				.withBanCreated(bannedResponse);

			await expect(scenario.executeBanUser()).resolves.toEqual(bannedResponse);

			expect(scenario.mocks.commandsRepository.createBan).toHaveBeenCalledWith({
				userId: 2,
				reason: 'spam',
				moderatorId: 1,
			});
		});

		it('does not swallow dependency errors', async () => {
			const scenario = makeModerationScenario().withUser();

			scenario.mocks.usersContract.selectUserBasicInfo.mockRejectedValue(
				new Error('boom'),
			);

			await expectError(scenario.executeBanUser(), Error);
		});
	});
});
