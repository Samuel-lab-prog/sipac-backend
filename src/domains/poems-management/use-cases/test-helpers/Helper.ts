/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import type { PoemPreviewPage } from '@Domains/poems-management/ports/models';
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type {
	CreatePoemParams,
	DeletePoemParams,
	UpdatePoemParams,
} from '../../ports/commands';
import type {
	GetAuthorPoemsParams,
	GetMyPoemsParams,
	GetPendingPoemsParams,
	GetPoemParams,
	SearchPoemsParams,
} from '../../ports/queries';
import {
	canCreatePoem,
	canUpdatePoem,
	canViewPoem,
} from '../policies/Policies';
import {
	DEFAULT_AUTHOR_ID,
	DEFAULT_POEM_CONTENT,
	DEFAULT_POEM_EXCERPT,
	DEFAULT_POEM_ID,
	DEFAULT_POEM_STATUS,
	DEFAULT_POEM_TAGS,
	DEFAULT_POEM_TITLE,
	DEFAULT_POEM_VISIBILITY,
	DEFAULT_REQUESTER_ID,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './Constants';
import {
	type AuthorPoemOverride,
	type MyPoemOverride,
	type SelectPoemByIdOverride,
	type UserBasicInfoOverride,
	givenAuthorPoems,
	givenCreatePoemResult,
	givenMyPoems,
	givenPendingPoems,
	givenPoemById,
	givenPoemDeleted,
	givenPoemNotFound,
	givenPoemsSelected,
	givenSlug,
	givenUpdatePoemResult,
	givenUser,
	makeAuthorPoem,
	makeMyPoem,
} from './Givens';
import {
	type PoemsSutMocks,
	poemsFactory,
	poemsMockFactories,
} from './SutMocks';

type CreatePoemScenarioParams = {
	data?: Partial<CreatePoemParams['data']>;
	meta?: Partial<CreatePoemParams['meta']>;
};

type UpdatePoemScenarioParams = {
	poemId?: number;
	data?: Partial<UpdatePoemParams['data']>;
	meta?: Partial<UpdatePoemParams['meta']>;
};

type CanCreatePoemScenarioParams = {
	author?: {
		id?: number;
		status?: CreatePoemParams['meta']['requesterStatus'];
		role?: CreatePoemParams['meta']['requesterRole'];
	};
	toUserIds?: number[];
};

type CanUpdatePoemScenarioParams = {
	poemId?: number;
	author?: {
		id?: number;
		status?: UpdatePoemParams['meta']['requesterStatus'];
		role?: UpdatePoemParams['meta']['requesterRole'];
	};
	toUserIds?: number[];
};

type CanViewPoemScenarioParams = Parameters<typeof canViewPoem>[0];

export function makePoemsScenario() {
	const { sut: sutFactory, mocks } = makeSut(
		poemsFactory,
		poemsMockFactories(),
	);

	return {
		withUser(overrides: UserBasicInfoOverride = {}) {
			givenUser(mocks.usersContract, overrides);
			return this;
		},

		withPoemsPage(
			poems: PoemPreviewPage = {
				poems: [makeAuthorPoem()],
				hasMore: false,
				nextCursor: null,
			},
		) {
			givenPoemsSelected(mocks.queriesRepository, poems);
			return this;
		},

		withSlug(slug?: string) {
			givenSlug(mocks.slugService, slug);
			return this;
		},

		withCreatedPoem(poemId: number = DEFAULT_POEM_ID) {
			givenCreatePoemResult(mocks.commandsRepository, poemId);
			return this;
		},

		withUpdatedPoem(poemId: number = DEFAULT_POEM_ID) {
			givenUpdatePoemResult(mocks.commandsRepository, poemId);
			return this;
		},

		withPoem(overrides: SelectPoemByIdOverride = {}) {
			givenPoemById(mocks.queriesRepository, overrides);
			return this;
		},

		withPoemNotFound() {
			givenPoemNotFound(mocks.queriesRepository);
			return this;
		},

		withPoemDeleted() {
			givenPoemDeleted(mocks.commandsRepository);
			return this;
		},

		withAuthorPoems(overrides: AuthorPoemOverride[] = [{}]) {
			givenAuthorPoems(
				mocks.queriesRepository,
				overrides.map((item) => makeAuthorPoem(item)),
			);
			return this;
		},

		withMyPoems(overrides: MyPoemOverride[] = [{}]) {
			givenMyPoems(
				mocks.queriesRepository,
				overrides.map((item) => makeMyPoem(item)),
			);
			return this;
		},

		withPendingPoems(overrides: AuthorPoemOverride[] = [{}]) {
			givenPendingPoems(
				mocks.queriesRepository,
				overrides.map((item) => makeAuthorPoem(item)),
			);
			return this;
		},

		executeSearchPoems(params: Partial<SearchPoemsParams> = {}) {
			return sutFactory.searchPoems(
				makeParams({
					navigationOptions: {
						limit: 10,
						cursor: 0,
					},
					sortOptions: {
						orderBy: 'createdAt',
						orderDirection: 'desc',
					},
					filterOptions: {},
					requesterId: DEFAULT_REQUESTER_ID,
					requesterStatus: DEFAULT_USER_STATUS,
					requesterRole: DEFAULT_USER_ROLE,
					...params,
				}),
			);
		},

		executeCreatePoem(params: CreatePoemScenarioParams = {}) {
			return sutFactory.createPoem({
				data: makeParams(
					{
						title: DEFAULT_POEM_TITLE,
						content: DEFAULT_POEM_CONTENT,
						excerpt: DEFAULT_POEM_EXCERPT,
						tags: DEFAULT_POEM_TAGS,
						visibility: DEFAULT_POEM_VISIBILITY,
						status: DEFAULT_POEM_STATUS,
						isCommentable: true,
						toUserIds: [],
					},
					params.data,
				),
				meta: makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_USER_STATUS,
						requesterRole: DEFAULT_USER_ROLE,
					},
					params.meta,
				),
			});
		},

		executeDeletePoem(params: Partial<DeletePoemParams> = {}) {
			return sutFactory.deletePoem({
				poemId: params.poemId ?? DEFAULT_POEM_ID,
				meta: makeParams({
					requesterId: DEFAULT_REQUESTER_ID,
					requesterStatus: DEFAULT_USER_STATUS,
					requesterRole: DEFAULT_USER_ROLE,
				}),
			});
		},

		executeUpdatePoem(params: UpdatePoemScenarioParams = {}) {
			return sutFactory.updatePoem({
				poemId: params.poemId ?? DEFAULT_POEM_ID,
				data: makeParams(
					{
						title: DEFAULT_POEM_TITLE,
						content: DEFAULT_POEM_CONTENT,
						excerpt: DEFAULT_POEM_EXCERPT,
						tags: DEFAULT_POEM_TAGS,
						visibility: DEFAULT_POEM_VISIBILITY,
						status: DEFAULT_POEM_STATUS,
						isCommentable: true,
						toUserIds: [],
					},
					params.data,
				),
				meta: makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_USER_STATUS,
						requesterRole: DEFAULT_USER_ROLE,
					},
					params.meta,
				),
			});
		},

		executeGetAuthorPoems(params: Partial<GetAuthorPoemsParams> = {}) {
			return sutFactory.getAuthorPoems(
				makeParams(
					{
						authorId: DEFAULT_AUTHOR_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_USER_STATUS,
						requesterRole: DEFAULT_USER_ROLE,
					},
					params,
				),
			);
		},

		executeGetMyPoems(params: Partial<GetMyPoemsParams> = {}) {
			return sutFactory.getMyPoems(
				makeParams(
					{
						requesterId: DEFAULT_REQUESTER_ID,
					},
					params,
				),
			);
		},

		executeGetPendingPoems(params: Partial<GetPendingPoemsParams> = {}) {
			return sutFactory.getPendingPoems(
				makeParams(
					{
						requesterRole: 'moderator',
						requesterStatus: DEFAULT_USER_STATUS,
						navigationOptions: {
							limit: 10,
							cursor: 0,
						},
					},
					params,
				),
			);
		},

		executeGetPoemById(params: Partial<GetPoemParams> = {}) {
			return sutFactory.getPoemById(
				makeParams(
					{
						poemId: DEFAULT_POEM_ID,
						requesterId: DEFAULT_REQUESTER_ID,
						requesterStatus: DEFAULT_USER_STATUS,
						requesterRole: DEFAULT_USER_ROLE,
					},
					params,
				),
			);
		},

		executeCanCreatePoem(params: CanCreatePoemScenarioParams = {}) {
			return canCreatePoem({
				ctx: {
					author: makeParams({
						id: DEFAULT_REQUESTER_ID,
						status: DEFAULT_USER_STATUS,
						role: DEFAULT_USER_ROLE,
					}),
				},
				usersContract: mocks.usersContract,
				toUserIds: params.toUserIds,
			});
		},

		executeCanUpdatePoem(params: CanUpdatePoemScenarioParams = {}) {
			return canUpdatePoem({
				poemId: params.poemId ?? DEFAULT_POEM_ID,
				ctx: {
					author: makeParams({
						id: DEFAULT_REQUESTER_ID,
						status: DEFAULT_USER_STATUS,
						role: DEFAULT_USER_ROLE,
					}),
				},
				usersContract: mocks.usersContract,
				queriesRepository: mocks.queriesRepository,
				toUserIds: params.toUserIds,
			});
		},

		executeCanViewPoem(params: CanViewPoemScenarioParams) {
			return canViewPoem(params);
		},

		get mocks(): PoemsSutMocks {
			return mocks;
		},
	};
}
