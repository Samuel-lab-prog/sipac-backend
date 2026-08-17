import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { givenBanEnded, givenUserActivated } from '../../test-helpers/Givens';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Unban User', () => {
		it('unbans a user successfully', async () => {
			const scenario = makeModerationScenario().withUser().withActiveBan();

			givenBanEnded(scenario.mocks.commandsRepository);

			await scenario.executeUnbanUser({
				userId: 2,
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(
				scenario.mocks.queriesRepository.selectActiveBanByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(scenario.mocks.commandsRepository.endBan).toHaveBeenCalled();
		});

		it('does not allow unbanning oneself', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnbanUser({
					userId: 1,
					requesterId: 1,
					requesterRole: 'moderator',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnbanUser({
					requesterStatus: 'suspended',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnbanUser({
					requesterRole: 'author',
				}),
				ForbiddenError,
			);
		});

		it('throws NotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeUnbanUser({
					userId: 99,
				}),
				NotFoundError,
			);
		});

		it('throws NotFoundError if user is not banned', async () => {
			const scenario = makeModerationScenario().withUser().withNoActiveBan();

			await expectError(scenario.executeUnbanUser(), NotFoundError);
		});

		it('repairs banned status when there is no active ban record', async () => {
			const scenario = makeModerationScenario()
				.withUser({ status: 'banned' })
				.withNoActiveBan();

			givenUserActivated(scenario.mocks.commandsRepository);

			await scenario.executeUnbanUser();

			expect(
				scenario.mocks.commandsRepository.activateUser,
			).toHaveBeenCalledWith({
				userId: 2,
			});
			expect(scenario.mocks.commandsRepository.endBan).not.toHaveBeenCalled();
		});
	});
});
