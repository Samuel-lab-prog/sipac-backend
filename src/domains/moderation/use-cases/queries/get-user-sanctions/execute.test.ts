import { ForbiddenError, NotFoundError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { describe, expect, it } from 'bun:test';
import { makeModerationScenario } from '../../test-helpers/Helper';

describe('USE-CASE - Moderation', () => {
	describe('Get User Sanctions', () => {
		it('returns sanctions for a user', async () => {
			const scenario = makeModerationScenario().withUser();
			scenario.mocks.queriesRepository.selectUserSanctions.mockResolvedValue([
				{
					id: 1,
					userId: 2,
					moderatorId: 3,
					type: 'ban',
					reason: 'spam',
					startAt: new Date(),
					endAt: null,
				},
			]);

			const result = await scenario.executeGetUserSanctions({
				userId: 2,
				requesterId: 1,
				requesterRole: 'moderator',
				requesterStatus: 'active',
			});

			expect(result.items).toHaveLength(1);
		});

		it('throws ForbiddenError when requester is not active', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeGetUserSanctions({
					requesterStatus: 'suspended',
				}),
				ForbiddenError,
			);
		});

		it('throws ForbiddenError if requester is author', async () => {
			const scenario = makeModerationScenario();

			await expectError(
				scenario.executeGetUserSanctions({
					requesterRole: 'author',
				}),
				ForbiddenError,
			);
		});

		it('throws NotFoundError if user does not exist', async () => {
			const scenario = makeModerationScenario().withUser({ exists: false });

			await expectError(
				scenario.executeGetUserSanctions({
					userId: 99,
				}),
				NotFoundError,
			);
		});
	});
});
