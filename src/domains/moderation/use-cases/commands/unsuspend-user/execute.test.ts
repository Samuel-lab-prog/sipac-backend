import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import {
	givenSuspensionEnded,
	givenUserActivated,
} from '../../test-helpers/Givens';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Unsuspend User', () => {
		it('unsuspends a user successfully', async () => {
			const scenario = makeModerationScenario()
				.withUser()
				.withActiveSuspension();

			givenSuspensionEnded(scenario.mocks.commandsRepository);

			await scenario.executeUnsuspendUser({
				userId: 2,
				requesterId: 1,
				requesterRole: 'moderator',
			});

			expect(
				scenario.mocks.queriesRepository.selectActiveSuspensionByUserId,
			).toHaveBeenCalledWith({ userId: 2 });
			expect(
				scenario.mocks.commandsRepository.endSuspension,
			).toHaveBeenCalled();
		});

		it('does not allow unsuspending oneself', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnsuspendUser({
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
				scenario.executeUnsuspendUser({
					requesterStatus: 'banned',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeUnsuspendUser({
					requesterRole: 'author',
				}),
				ForbiddenError,
			);
		});

		it('throws NotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeUnsuspendUser({
					userId: 99,
				}),
				NotFoundError,
			);
		});

		it('throws NotFoundError if user is not suspended', async () => {
			const scenario = makeModerationScenario()
				.withUser()
				.withNoActiveSuspension();

			await expectError(scenario.executeUnsuspendUser(), NotFoundError);
		});

		it('repairs suspended status when there is no active suspension record', async () => {
			const scenario = makeModerationScenario()
				.withUser({ status: 'suspended' })
				.withNoActiveSuspension();

			givenUserActivated(scenario.mocks.commandsRepository);

			await scenario.executeUnsuspendUser();

			expect(
				scenario.mocks.commandsRepository.activateUser,
			).toHaveBeenCalledWith({
				userId: 2,
			});
			expect(
				scenario.mocks.commandsRepository.endSuspension,
			).not.toHaveBeenCalled();
		});
	});
});
