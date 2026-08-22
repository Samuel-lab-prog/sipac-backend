/* eslint-disable max-lines, max-lines-per-function */
import { mock } from 'bun:test';
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type { HashServices } from '@SharedKernel/ports/hash-services';
import type { StorageService } from '@SharedKernel/ports/storage';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import { createUserFactory } from '../commands/create/execute';
import { createAvatarUploadUrlFactory } from '../commands/create-avatar-upload-url/execute';
import { deleteUserFactory } from '../commands/delete/execute';
import { restoreUserFactory } from '../commands/restore/execute';
import { setAvatarFactory } from '../commands/set-avatar/execute';
import { updateCurrentUserFactory } from '../commands/update-current/execute';
import { updateUserFactory } from '../commands/update/execute';
import { changePasswordFactory } from '../commands/change-password/execute';
import { getCurrentUserFactory } from '../queries/get-current-user/execute';
import { getUserByIdFactory } from '../queries/get-user-by-id/execute';
import { getUsersByRoleFactory } from '../queries/get-users-by-role/execute';
import { getUsersByStatusFactory } from '../queries/get-users-by-status/execute';
import { listDeletedUsersFactory } from '../queries/list-deleted-users/execute';
import { searchUsersFactory } from '../queries/search-users/execute';
import {
	DEFAULT_USER_EMAIL,
	DEFAULT_USER_CPF,
	DEFAULT_USER_ID,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_PASSWORD,
	DEFAULT_USER_PASSWORD_HASH,
	DEFAULT_USER_RG,
	DEFAULT_USER_NAME,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './constants';
import { givenCreatedUser, givenUser } from './givens';

type AsyncResolvedMock<TArgs extends unknown[], TResult> = ((
	...args: TArgs
) => Promise<TResult>) & {
	mockResolvedValue(value: TResult): void;
};

function usersScenarioMockFactories() {
	return {
		commandsRepository: {
			insertUser: mock(),
			updateUser: mock(),
			updateCurrentUser: mock(),
			getUserPasswordHashById: mock(),
			deleteUser: mock(),
			restoreUser: mock(),
		} satisfies CommandsRepository,
		queriesRepository: {
			selectUsers: mock(),
			selectUserById: mock(),
		} satisfies QueriesRepository,
		storageService: {
			generateAvatarUploadUrl: mock(),
			validateImageContentType: mock(),
			generatePoemAudioUploadUrl: mock(),
			validateAudioContentType: mock(),
			generateFileUploadUrl: mock(),
			validateFileContentType: mock(),
		} satisfies StorageService,
	};
}

export function makeUsersScenario() {
	const hashServices = {
		hash: (value: string) => Promise.resolve(`hashed:${value}`),
		compare: mock(() => Promise.resolve(true)) as AsyncResolvedMock<
			[string, string],
			boolean
		>,
	};
	const { sut, mocks } = makeSut(
		(m) => ({
			createUser: createUserFactory({
				commandsRepository: m.commandsRepository,
				hashServices: hashServices as HashServices,
			}),
			createAvatarUploadUrl: createAvatarUploadUrlFactory({
				storageService: m.storageService,
			}),
			updateUser: updateUserFactory({
				commandsRepository: m.commandsRepository,
			}),
			updateCurrentUser: updateCurrentUserFactory({
				commandsRepository: m.commandsRepository,
			}),
			deleteUser: deleteUserFactory({
				commandsRepository: m.commandsRepository,
			}),
			restoreUser: restoreUserFactory({
				commandsRepository: m.commandsRepository,
			}),
			setAvatar: setAvatarFactory({
				commandsRepository: m.commandsRepository,
			}),
			changePassword: changePasswordFactory({
				commandsRepository: m.commandsRepository,
				hashServices: hashServices as HashServices,
			}),
			getCurrentUser: getCurrentUserFactory({
				queriesRepository: m.queriesRepository,
			}),
			getUserById: getUserByIdFactory({
				queriesRepository: m.queriesRepository,
			}),
			getUsersByRole: getUsersByRoleFactory({
				queriesRepository: m.queriesRepository,
			}),
			getUsersByStatus: getUsersByStatusFactory({
				queriesRepository: m.queriesRepository,
			}),
			listDeletedUsers: listDeletedUsersFactory({
				queriesRepository: m.queriesRepository,
			}),
			searchUsers: searchUsersFactory({
				queriesRepository: m.queriesRepository,
			}),
		}),
		usersScenarioMockFactories(),
	);

	return {
		withUser(overrides = {}) {
			givenUser(mocks.queriesRepository, overrides);
			return this;
		},
		withCreatedUser(overrides = {}) {
			givenCreatedUser(mocks.commandsRepository, overrides);
			return this;
		},
		withCurrentPasswordHash(hash = DEFAULT_USER_PASSWORD_HASH) {
			mocks.commandsRepository.getUserPasswordHashById.mockResolvedValue(hash);
			return this;
		},
		withPasswordComparisonResult(isValid: boolean) {
			hashServices.compare.mockResolvedValue(isValid);
			return this;
		},
		withAvatarUploadUrl() {
			mocks.storageService.validateImageContentType.mockReturnValue(true);
			mocks.storageService.generateAvatarUploadUrl.mockResolvedValue({
				uploadUrl: 'https://example.com/upload',
				fields: { key: 'avatar' },
				fileUrl: 'https://example.com/avatar.jpg',
			});
			return this;
		},
		withSelectedUsers() {
			mocks.queriesRepository.selectUsers.mockResolvedValue({
				users: [
					{
						id: DEFAULT_USER_ID,
						name: DEFAULT_USER_NAME,
						nickname: DEFAULT_USER_NICKNAME,
						email: DEFAULT_USER_EMAIL,
						rg: DEFAULT_USER_RG,
						cpf: DEFAULT_USER_CPF,
						role: DEFAULT_USER_ROLE,
						status: DEFAULT_USER_STATUS,
						avatarUrl: null,
						createdAt: new Date('2026-01-01T00:00:00.000Z'),
						updatedAt: new Date('2026-01-01T00:00:00.000Z'),
						deletedAt: null,
						emailVerifiedAt: null,
					},
				],
				hasMore: false,
				nextCursor: undefined,
			});
			return this;
		},
		executeCreateUser(params = {}) {
			return sut.createUser(
				makeParams(
					{
						data: {
							name: DEFAULT_USER_NAME,
							nickname: DEFAULT_USER_NICKNAME,
							email: DEFAULT_USER_EMAIL,
							password: DEFAULT_USER_PASSWORD,
							rg: DEFAULT_USER_RG,
							cpf: DEFAULT_USER_CPF,
							avatarUrl: null,
						},
					},
					params,
				),
			);
		},
		executeCreateAvatarUploadUrl(params = {}) {
			return sut.createAvatarUploadUrl(
				makeParams(
					{
						clientId: DEFAULT_USER_ID,
						clientRole: DEFAULT_USER_ROLE,
						clientStatus: DEFAULT_USER_STATUS,
						data: { contentType: 'image/jpeg', contentLength: 10 },
					},
					params,
				),
			);
		},
		executeUpdateUser(params = {}) {
			return sut.updateUser(
				makeParams(
					{
						params: { id: DEFAULT_USER_ID },
						data: {
							name: DEFAULT_USER_NAME,
							nickname: DEFAULT_USER_NICKNAME,
							email: DEFAULT_USER_EMAIL,
							rg: DEFAULT_USER_RG,
							cpf: DEFAULT_USER_CPF,
							avatarUrl: null,
						},
						clientId: DEFAULT_USER_ID + 1,
						clientRole: 'admin',
						clientStatus: DEFAULT_USER_STATUS,
					},
					params,
				),
			);
		},
		executeUpdateCurrentUser(params = {}) {
			return sut.updateCurrentUser(
				makeParams(
					{
						clientId: DEFAULT_USER_ID,
						clientRole: DEFAULT_USER_ROLE,
						clientStatus: DEFAULT_USER_STATUS,
						data: {
							name: DEFAULT_USER_NAME,
							nickname: DEFAULT_USER_NICKNAME,
							email: DEFAULT_USER_EMAIL,
							rg: DEFAULT_USER_RG,
							cpf: DEFAULT_USER_CPF,
							avatarUrl: null,
						},
					},
					params,
				),
			);
		},
		executeDeleteUser(params = {}) {
			return sut.deleteUser(
				makeParams(
					{
						id: DEFAULT_USER_ID,
						clientId: DEFAULT_USER_ID + 1,
						clientRole: 'admin',
						clientStatus: DEFAULT_USER_STATUS,
					},
					params,
				),
			);
		},
		executeRestoreUser(params = {}) {
			return sut.restoreUser(
				makeParams(
					{
						id: DEFAULT_USER_ID,
						clientId: DEFAULT_USER_ID + 1,
						clientRole: 'admin',
						clientStatus: DEFAULT_USER_STATUS,
					},
					params,
				),
			);
		},
		executeSetAvatar(params = {}) {
			return sut.setAvatar(
				makeParams(
					{
						clientId: DEFAULT_USER_ID,
						clientRole: DEFAULT_USER_ROLE,
						clientStatus: DEFAULT_USER_STATUS,
						data: { avatarUrl: 'https://example.com/avatar.jpg' },
					},
					params,
				),
			);
		},
		executeChangePassword(params = {}) {
			return sut.changePassword(
				makeParams(
					{
						clientId: DEFAULT_USER_ID,
						clientRole: DEFAULT_USER_ROLE,
						clientStatus: DEFAULT_USER_STATUS,
						data: {
							currentPassword: DEFAULT_USER_PASSWORD,
							newPassword: DEFAULT_USER_PASSWORD,
						},
					},
					params,
				),
			);
		},
		executeGetCurrentUser(params = {}) {
			return sut.getCurrentUser(
				makeParams(
					{
						clientId: DEFAULT_USER_ID,
						clientRole: DEFAULT_USER_ROLE,
						clientStatus: DEFAULT_USER_STATUS,
					},
					params,
				),
			);
		},
		executeGetUserById(params = {}) {
			return sut.getUserById(
				makeParams(
					{
						id: DEFAULT_USER_ID,
						clientId: DEFAULT_USER_ID + 1,
						clientRole: 'admin',
						clientStatus: DEFAULT_USER_STATUS,
					},
					params,
				),
			);
		},
		executeGetUsersByRole(params = {}) {
			return sut.getUsersByRole(
				makeParams({ role: DEFAULT_USER_ROLE, limit: 20 }, params),
			);
		},
		executeGetUsersByStatus(params = {}) {
			return sut.getUsersByStatus(
				makeParams({ status: DEFAULT_USER_STATUS, limit: 20 }, params),
			);
		},
		executeListDeletedUsers(params = {}) {
			return sut.listDeletedUsers(makeParams({ limit: 20 }, params));
		},
		executeSearchUsers(params = {}) {
			return sut.searchUsers(makeParams({ limit: 20 }, params));
		},
		get mocks() {
			return mocks;
		},
	};
}
