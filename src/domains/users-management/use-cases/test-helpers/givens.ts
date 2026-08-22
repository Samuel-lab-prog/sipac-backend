import { makeParams } from '@GenericSubdomains/utils/testing/utils';
import type { CreateUserParams } from '../../ports/commands';
import type { User, UserRole, UserStatus } from '../../ports/models';
import {
	DEFAULT_USER_CPF,
	DEFAULT_USER_EMAIL,
	DEFAULT_USER_ID,
	DEFAULT_USER_NAME,
	DEFAULT_USER_NICKNAME,
	DEFAULT_USER_PASSWORD,
	DEFAULT_USER_RG,
	DEFAULT_USER_ROLE,
	DEFAULT_USER_STATUS,
} from './constants';
import type { UsersScenarioMocks } from './types';

export type UserOverrides = Partial<User>;

type ResolvedMock<TArgs extends unknown[], TResult> = {
	mockResolvedValue(value: TResult): void;
	(...args: TArgs): Promise<TResult>;
};

export function givenUser(
	queriesRepository: UsersScenarioMocks['queriesRepository'],
	overrides: UserOverrides = {},
) {
	const selectUserById = queriesRepository.selectUserById as ResolvedMock<
		[id: number],
		User | null
	>;

	selectUserById.mockResolvedValue({
		id: DEFAULT_USER_ID,
		name: DEFAULT_USER_NAME,
		nickname: DEFAULT_USER_NICKNAME,
		email: DEFAULT_USER_EMAIL,
		rg: DEFAULT_USER_RG,
		cpf: DEFAULT_USER_CPF,
		role: DEFAULT_USER_ROLE as UserRole,
		status: DEFAULT_USER_STATUS as UserStatus,
		avatarUrl: null,
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		updatedAt: new Date('2026-01-01T00:00:00.000Z'),
		deletedAt: null,
		emailVerifiedAt: null,
		...overrides,
	});
}

export function givenCreatedUser(
	commandsRepository: UsersScenarioMocks['commandsRepository'],
	overrides: Partial<CreateUserParams['data']> = {},
) {
	const insertUser = commandsRepository.insertUser as ResolvedMock<
		[user: CreateUserParams['data'] & { passwordHash: string }],
		Awaited<
			ReturnType<UsersScenarioMocks['commandsRepository']['insertUser']>
		> extends infer R
			? R
			: never
	>;

	insertUser.mockResolvedValue({
		ok: true,
		data: {
			id: DEFAULT_USER_ID,
			role: DEFAULT_USER_ROLE as UserRole,
			status: DEFAULT_USER_STATUS as UserStatus,
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
			updatedAt: new Date('2026-01-01T00:00:00.000Z'),
			deletedAt: null,
			emailVerifiedAt: null,
			...makeParams(
				{
					name: DEFAULT_USER_NAME,
					nickname: DEFAULT_USER_NICKNAME,
					email: DEFAULT_USER_EMAIL,
					password: DEFAULT_USER_PASSWORD,
					rg: DEFAULT_USER_RG,
					cpf: DEFAULT_USER_CPF,
					avatarUrl: null,
				},
				overrides,
			),
		},
	});
}
