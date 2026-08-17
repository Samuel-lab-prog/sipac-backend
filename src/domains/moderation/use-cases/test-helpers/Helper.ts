/* eslint-disable max-lines-per-function */
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type {
	BanUserParams,
	SuspendUserParams,
	UnbanUserParams,
	UnsuspendUserParams,
} from '../../ports/commands';
import type {
	GetUserSanctionStatusParams,
	GetUserSanctionsParams,
} from '../../ports/queries';
import {
	DEFAULT_REASON,
	DEFAULT_REQUESTER_ID,
	DEFAULT_SUSPENSION_DURATION_DAYS,
	DEFAULT_USER_ID,
} from './Constants';
import {
	givenActiveBan,
	givenActiveSuspension,
	givenBanCreated,
	givenNoActiveBan,
	givenNoActiveSuspension,
	givenSuspensionCreated,
	givenUser,
	type ActiveBanOverride,
	type ActiveSuspensionOverride,
	type UserBasicInfoOverride,
} from './Givens';
import {
	moderationFactory,
	moderationMockFactories,
	type ModerationSutMocks,
} from './SutMocks';

export function makeModerationScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		moderationFactory,
		moderationMockFactories(),
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withNoActiveBan() {
			givenNoActiveBan(mocks.queriesRepository);
			return this;
		},

		withActiveBan(overrides: ActiveBanOverride = {}) {
			givenActiveBan(mocks.queriesRepository, overrides);
			return this;
		},

		withNoActiveSuspension() {
			givenNoActiveSuspension(mocks.queriesRepository);
			return this;
		},

		withActiveSuspension(overrides: ActiveSuspensionOverride = {}) {
			givenActiveSuspension(mocks.queriesRepository, overrides);
			return this;
		},

		withBanCreated(
			overrides: Partial<
				Awaited<
					ReturnType<ModerationSutMocks['commandsRepository']['createBan']>
				>
			> = {},
		) {
			givenBanCreated(mocks.commandsRepository, overrides);
			return this;
		},

		withSuspensionCreated(
			overrides: Partial<
				Awaited<
					ReturnType<
						ModerationSutMocks['commandsRepository']['createSuspension']
					>
				>
			> = {},
		) {
			givenSuspensionCreated(mocks.commandsRepository, overrides);
			return this;
		},

		executeBanUser(params: Partial<BanUserParams> = {}) {
			return sutFactory.banUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						reason: DEFAULT_REASON,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
					},
					params,
				),
			);
		},

		executeSuspendUser(params: Partial<SuspendUserParams> = {}) {
			return sutFactory.suspendUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						reason: DEFAULT_REASON,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
						durationDays: DEFAULT_SUSPENSION_DURATION_DAYS,
					},
					params,
				),
			);
		},

		executeUnbanUser(params: Partial<UnbanUserParams> = {}) {
			return sutFactory.unbanUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
					},
					params,
				),
			);
		},

		executeUnsuspendUser(params: Partial<UnsuspendUserParams> = {}) {
			return sutFactory.unsuspendUser(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
					},
					params,
				),
			);
		},

		executeGetUserSanctions(params: Partial<GetUserSanctionsParams> = {}) {
			return sutFactory.getUserSanctions(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
					},
					params,
				),
			);
		},

		executeGetUserSanctionStatus(
			params: Partial<GetUserSanctionStatusParams> = {},
		) {
			return sutFactory.getUserSanctionStatus(
				makeParams(
					{
						userId: DEFAULT_USER_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterRole: 'moderator',
						requesterStatus: 'active',
					},
					params,
				),
			);
		},

		get mocks(): ModerationSutMocks {
			return mocks;
		},
	};
}
