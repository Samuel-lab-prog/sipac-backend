import { ConflictError } from '@DomainError';
import { expectError } from '@GenericSubdomains/utils/testing/utils';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

const prismaUserFindFirstMock = mock<(...args: any[]) => Promise<any>>(() =>
	Promise.resolve(null),
);
const prismaUserFindUniqueMock = mock<(...args: any[]) => Promise<any>>(() =>
	Promise.resolve(null),
);
const prismaUserUpdateMock = mock<(...args: any[]) => Promise<any>>(() =>
	Promise.resolve({
		id: 1,
	}),
);
const prismaUserCreateMock = mock<(...args: any[]) => Promise<any>>(() =>
	Promise.resolve({
		id: 2,
	}),
);

mock.module('@Prisma/PrismaClient', () => ({
	prisma: {
		user: {
			findFirst: prismaUserFindFirstMock,
			findUnique: prismaUserFindUniqueMock,
			update: prismaUserUpdateMock,
			create: prismaUserCreateMock,
		},
	},
}));

const { bootstrapAdminFactory } = await import('./execute');

const DEFAULT_PARAMS = {
	email: 'admin@olapoesia.dev',
	password: 'plain_password',
	name: 'Admin',
	nickname: 'admin',
	bio: 'Admin bio',
	avatarUrl: null,
};

describe.concurrent('USE-CASE - Users Management - BootstrapAdmin', () => {
	const hashServices = {
		hash: mock<(...args: any[]) => Promise<string>>(() =>
			Promise.resolve('hashed_password'),
		),
		compare: mock<(...args: any[]) => Promise<boolean>>(() =>
			Promise.resolve(true),
		),
	};

	beforeEach(() => {
		prismaUserFindFirstMock.mockReset();
		prismaUserFindUniqueMock.mockReset();
		prismaUserUpdateMock.mockReset();
		prismaUserCreateMock.mockReset();
		hashServices.hash.mockReset();
		hashServices.compare.mockReset();

		prismaUserFindFirstMock.mockResolvedValue(null);
		prismaUserFindUniqueMock.mockResolvedValue(null);
		prismaUserUpdateMock.mockResolvedValue({ id: 1 });
		prismaUserCreateMock.mockResolvedValue({ id: 2 });
		hashServices.hash.mockResolvedValue('hashed_password');
		hashServices.compare.mockResolvedValue(true);
	});

	it('should throw ConflictError when admin already exists', async () => {
		prismaUserFindFirstMock.mockResolvedValue({ id: 99 });

		const execute = bootstrapAdminFactory({ hashServices });

		await expectError(execute(DEFAULT_PARAMS), ConflictError);
		expect(prismaUserFindUniqueMock).not.toHaveBeenCalled();
	});

	it('should update existing user by email and return created=false', async () => {
		prismaUserFindUniqueMock.mockImplementation((args: any) => {
			if ('email' in args.where)
				return Promise.resolve({ id: 10, nickname: 'admin' });
			return Promise.resolve(null);
		});

		const execute = bootstrapAdminFactory({ hashServices });

		const result = await execute(DEFAULT_PARAMS);

		expect(result.created).toBe(false);
		expect(prismaUserUpdateMock).toHaveBeenCalledTimes(1);
	});

	it('should throw ConflictError when nickname is already in use', async () => {
		prismaUserFindUniqueMock.mockImplementation((args: any) => {
			if ('email' in args.where)
				return Promise.resolve({ id: 10, nickname: 'someone-else' });
			if ('nickname' in args.where) return Promise.resolve({ id: 20 });
			return Promise.resolve(null);
		});

		const execute = bootstrapAdminFactory({ hashServices });

		await expectError(execute(DEFAULT_PARAMS), ConflictError);
		expect(prismaUserUpdateMock).not.toHaveBeenCalled();
	});

	it('should create a new admin when email and nickname are free', async () => {
		prismaUserFindUniqueMock.mockImplementation((args: any) => {
			if ('email' in args.where) return Promise.resolve(null);
			if ('nickname' in args.where) return Promise.resolve(null);
			return Promise.resolve(null);
		});

		const execute = bootstrapAdminFactory({ hashServices });

		const result = await execute(DEFAULT_PARAMS);

		expect(result.created).toBe(true);
		expect(prismaUserCreateMock).toHaveBeenCalledTimes(1);
	});
});
