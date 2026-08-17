import { givenResolved } from '@GenericSubdomains/utils/testing/utils';
import type { UsersServicesForModeration } from '../../ports/externalServices';
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../../ports/models';
import type { QueriesRepository } from '../../ports/queries';
import {
	DEFAULT_BAN_ID,
	DEFAULT_REASON,
	DEFAULT_REQUESTER_ID,
	DEFAULT_SUSPENSION_ID,
	DEFAULT_USER_ID,
} from './Constants';
import type { ModerationSutMocks } from './SutMocks';

export type UserBasicInfoOverride = Partial<
	Awaited<ReturnType<UsersServicesForModeration['selectUserBasicInfo']>>
>;

export type ActiveBanOverride = Partial<
	NonNullable<Awaited<ReturnType<QueriesRepository['selectActiveBanByUserId']>>>
>;

export type ActiveSuspensionOverride = Partial<
	NonNullable<
		Awaited<ReturnType<QueriesRepository['selectActiveSuspensionByUserId']>>
	>
>;

export function givenUser(
	usersContract: ModerationSutMocks['usersContract'],
	overrides: UserBasicInfoOverride = {},
) {
	givenResolved(usersContract, 'selectUserBasicInfo', {
		exists: true,
		id: DEFAULT_USER_ID,
		status: 'active',
		role: 'author',
		...overrides,
	});
}

export function givenNoActiveBan(
	queriesRepository: ModerationSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectActiveBanByUserId', null);
}

export function givenActiveBan(
	queriesRepository: ModerationSutMocks['queriesRepository'],
	overrides: ActiveBanOverride = {},
) {
	const response: BannedUserResponse = {
		id: DEFAULT_BAN_ID,
		bannedUserId: DEFAULT_USER_ID,
		reason: DEFAULT_REASON,
		moderatorId: DEFAULT_REQUESTER_ID,
		bannedAt: new Date(),
		...overrides,
	};

	givenResolved(queriesRepository, 'selectActiveBanByUserId', response);
}

export function givenNoActiveSuspension(
	queriesRepository: ModerationSutMocks['queriesRepository'],
) {
	givenResolved(queriesRepository, 'selectActiveSuspensionByUserId', null);
}

export function givenActiveSuspension(
	queriesRepository: ModerationSutMocks['queriesRepository'],
	overrides: ActiveSuspensionOverride = {},
) {
	const response: SuspendedUserResponse = {
		id: DEFAULT_SUSPENSION_ID,
		suspendedUserId: DEFAULT_USER_ID,
		reason: DEFAULT_REASON,
		moderatorId: DEFAULT_REQUESTER_ID,
		suspendedAt: new Date(),
		endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		...overrides,
	};

	givenResolved(queriesRepository, 'selectActiveSuspensionByUserId', response);
}

export function givenBanCreated(
	commandsRepository: ModerationSutMocks['commandsRepository'],
	overrides: Partial<BannedUserResponse> = {},
) {
	const response: BannedUserResponse = {
		id: DEFAULT_BAN_ID,
		bannedUserId: DEFAULT_USER_ID,
		reason: DEFAULT_REASON,
		moderatorId: DEFAULT_REQUESTER_ID,
		bannedAt: new Date(),
		...overrides,
	};

	givenResolved(commandsRepository, 'createBan', response);
}

export function givenSuspensionCreated(
	commandsRepository: ModerationSutMocks['commandsRepository'],
	overrides: Partial<SuspendedUserResponse> = {},
) {
	const response: SuspendedUserResponse = {
		id: DEFAULT_SUSPENSION_ID,
		suspendedUserId: DEFAULT_USER_ID,
		reason: DEFAULT_REASON,
		moderatorId: DEFAULT_REQUESTER_ID,
		suspendedAt: new Date(),
		endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		...overrides,
	};

	givenResolved(commandsRepository, 'createSuspension', response);
}

export function givenBanEnded(
	commandsRepository: ModerationSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'endBan', undefined);
}

export function givenSuspensionEnded(
	commandsRepository: ModerationSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'endSuspension', undefined);
}

export function givenUserActivated(
	commandsRepository: ModerationSutMocks['commandsRepository'],
) {
	givenResolved(commandsRepository, 'activateUser', undefined);
}
