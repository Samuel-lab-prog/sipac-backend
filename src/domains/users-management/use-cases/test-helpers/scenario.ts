import { mock } from 'bun:test';
import { makeParams, makeSut } from '@GenericSubdomains/utils/testing/utils';
import type { CommandsRepository } from '../../ports/commands';
import type { QueriesRepository } from '../../ports/queries';
import { createUserFactory } from '../commands/create/execute';
import { getCurrentUserFactory } from '../queries/get-current-user/execute';
import {
	DEFAULT_USER_EMAIL,
	DEFAULT_USER_CPF,
	DEFAULT_USER_ID,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_PASSWORD,
	DEFAULT_USER_RG,
	DEFAULT_USER_NAME,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './constants';
import { givenCreatedUser, givenUser } from './givens';

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
	};
}

export function makeUsersScenario() {
	const { sut, mocks } = makeSut(
		(m) => ({
			createUser: createUserFactory({
				commandsRepository: m.commandsRepository,
				hashServices: {
					hash: (value: string) => Promise.resolve(`hashed:${value}`),
					compare: () => Promise.resolve(true),
				},
			}),
			getCurrentUser: getCurrentUserFactory({
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
		get mocks() {
			return mocks;
		},
	};
}
