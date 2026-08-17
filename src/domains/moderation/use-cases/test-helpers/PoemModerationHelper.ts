import {
	type MockedContract,
	createMockedContract,
	makeParams,
	makeSut,
} from '@GenericSubdomains/utils/testing/utils';
import type { EventBus } from '@SharedKernel/events/EventBus';
import { mock } from 'bun:test';
import type {
	CommandsRepository,
	ModeratePoemParams,
} from '../../ports/commands';
import type {
	ModeratePoemResult,
	PoemModerationRead,
} from '../../ports/models';
import type { QueriesRepository } from '../../ports/queries';
import { moderatePoemFactory } from '../commands/moderate-poem/execute';

const DEFAULT_POEM_ID = 1;
const DEFAULT_POEM_TITLE = 'Test Poem';
const DEFAULT_POEM_MODERATION_STATUS: PoemModerationRead['moderationStatus'] =
	'pending';
const DEFAULT_POEM_VISIBILITY: PoemModerationRead['visibility'] = 'public';
const DEFAULT_AUTHOR_ID = 10;
const DEFAULT_AUTHOR_NICKNAME = 'author';
const DEFAULT_REQUESTER_ID = 99;
const DEFAULT_DEDICATED_USER_IDS = [20, 21];
const DEFAULT_MENTIONED_USER_IDS = [30, 31];
const DEFAULT_AUTHOR_FRIEND_IDS = [21, 30];

type ModerationPoemSutMocks = {
	commandsRepository: MockedContract<CommandsRepository>;
	queriesRepository: MockedContract<QueriesRepository>;
	eventBus: MockedContract<EventBus>;
};

type ModerationPoemSut = {
	moderatePoem: (params: ModeratePoemParams) => Promise<ModeratePoemResult>;
};

type ModerationPoemScenario = {
	withPoem(overrides?: Partial<PoemModerationRead>): ModerationPoemScenario;
	withPoemNotFound(): ModerationPoemScenario;
	withNotificationsData(
		overrides?: NotificationsDataOverrides,
	): ModerationPoemScenario;
	withNoNotificationsData(): ModerationPoemScenario;
	withModeratedPoem(params?: {
		id?: number;
		moderationStatus?: PoemModerationRead['moderationStatus'];
	}): ModerationPoemScenario;
	executeModeratePoem(
		params?: Partial<ModeratePoemParams>,
	): Promise<ModeratePoemResult>;
	readonly mocks: ModerationPoemSutMocks;
};

function makePoem(
	overrides: Partial<PoemModerationRead> = {},
): PoemModerationRead {
	return {
		id: DEFAULT_POEM_ID,
		title: DEFAULT_POEM_TITLE,
		status: 'published',
		visibility: DEFAULT_POEM_VISIBILITY,
		moderationStatus: DEFAULT_POEM_MODERATION_STATUS,
		author: {
			id: DEFAULT_AUTHOR_ID,
			nickname: DEFAULT_AUTHOR_NICKNAME,
			avatarUrl: null,
		},
		...overrides,
	};
}

function moderationPoemMockFactories(): ModerationPoemSutMocks {
	return {
		commandsRepository: createMockedContract<CommandsRepository>({
			createBan: mock(),
			createSuspension: mock(),
			updatePoemModerationStatus: mock(),
			endBan: mock(),
			endSuspension: mock(),
			activateUser: mock(),
		}),
		queriesRepository: createMockedContract<QueriesRepository>({
			selectActiveBanByUserId: mock(),
			selectActiveSuspensionByUserId: mock(),
			selectUserSanctions: mock(),
			selectPoemById: mock(),
			selectPoemNotificationsData: mock(),
		}),
		eventBus: createMockedContract<EventBus>({
			publish: mock(),
			subscribe: mock(() => () => { }),
			once: mock(() => () => { }),
		}),
	};
}

type NotificationsDataOverrides = Partial<{
	id: number;
	title: string;
	authorId: number;
	authorNickname: string;
	authorAvatarUrl: string | null;
	authorFriendIds: number[];
	dedicatedUserIds: number[];
	mentionedUserIds: number[];
}>;

function addPoemControls(
	mocks: ModerationPoemSutMocks,
): Pick<ModerationPoemScenario, 'withPoem' | 'withPoemNotFound'> {
	return {
		withPoem(
			this: ModerationPoemScenario,
			overrides: Partial<PoemModerationRead> = {},
		) {
			mocks.queriesRepository.selectPoemById.mockResolvedValue(
				makePoem(overrides),
			);
			return this;
		},

		withPoemNotFound(this: ModerationPoemScenario) {
			mocks.queriesRepository.selectPoemById.mockResolvedValue(null);
			return this;
		},
	};
}

function addNotificationControls(
	mocks: ModerationPoemSutMocks,
): Pick<
	ModerationPoemScenario,
	'withNotificationsData' | 'withNoNotificationsData'
> {
	return {
		withNotificationsData(
			this: ModerationPoemScenario,
			overrides: NotificationsDataOverrides = {},
		) {
			mocks.queriesRepository.selectPoemNotificationsData.mockResolvedValue({
				id: DEFAULT_POEM_ID,
				title: DEFAULT_POEM_TITLE,
				authorId: DEFAULT_AUTHOR_ID,
				authorNickname: DEFAULT_AUTHOR_NICKNAME,
				authorAvatarUrl: null,
				authorFriendIds: DEFAULT_AUTHOR_FRIEND_IDS,
				dedicatedUserIds: DEFAULT_DEDICATED_USER_IDS,
				mentionedUserIds: DEFAULT_MENTIONED_USER_IDS,
				...overrides,
			});
			return this;
		},

		withNoNotificationsData(this: ModerationPoemScenario) {
			mocks.queriesRepository.selectPoemNotificationsData.mockResolvedValue(
				null,
			);
			return this;
		},
	};
}

function addModerationControls(
	mocks: ModerationPoemSutMocks,
): Pick<ModerationPoemScenario, 'withModeratedPoem'> {
	return {
		withModeratedPoem(
			this: ModerationPoemScenario,
			params: {
				id?: number;
				moderationStatus?: PoemModerationRead['moderationStatus'];
			} = {},
		) {
			mocks.commandsRepository.updatePoemModerationStatus.mockResolvedValue({
				ok: true,
				data: {
					id: params.id ?? DEFAULT_POEM_ID,
					moderationStatus:
						params.moderationStatus ?? DEFAULT_POEM_MODERATION_STATUS,
				},
			});
			return this;
		},
	};
}

function addExecutionControls(
	sutFactory: ModerationPoemSut,
): Pick<ModerationPoemScenario, 'executeModeratePoem'> {
	return {
		executeModeratePoem(
			params: Partial<ModeratePoemParams> = {},
		): ReturnType<typeof sutFactory.moderatePoem> {
			const defaultMeta: ModeratePoemParams['meta'] = {
				requesterId: DEFAULT_REQUESTER_ID,
				requesterStatus: 'active',
				requesterRole: 'moderator',
			};

			return sutFactory.moderatePoem({
				poemId: params.poemId ?? DEFAULT_POEM_ID,
				moderationStatus:
					params.moderationStatus ?? DEFAULT_POEM_MODERATION_STATUS,
				meta: makeParams(defaultMeta, params.meta),
			});
		},
	};
}

export function makeModerationPoemScenario(): ModerationPoemScenario {
	const { sut: sutFactory, mocks } = makeSut<
		ModerationPoemSutMocks,
		ModerationPoemSut
	>(
		(deps: ModerationPoemSutMocks) => ({
			moderatePoem: moderatePoemFactory({
				commandsRepository: deps.commandsRepository,
				queriesRepository: deps.queriesRepository,
				eventBus: deps.eventBus,
			}),
		}),
		moderationPoemMockFactories(),
	);

	const scenario: ModerationPoemScenario = {
		...addPoemControls(mocks),
		...addNotificationControls(mocks),
		...addModerationControls(mocks),
		...addExecutionControls(sutFactory),
		get mocks(): ModerationPoemSutMocks {
			return mocks;
		},
	};

	return scenario;
}
