import { afterEach, describe, expect, it, mock } from 'bun:test';

const ORIGINAL_BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS;

function setBcryptSaltRounds(value: string | undefined) {
	if (value === undefined) {
		delete process.env.BCRYPT_SALT_ROUNDS;
		return;
	}
	process.env.BCRYPT_SALT_ROUNDS = value;
}

async function loadBcryptModule(options?: {
	saltRounds?: string;
	hashResult?: string;
	compareResult?: boolean;
}) {
	const hash = mock(async (password: string, rounds: number) => {
		return options?.hashResult ?? `hashed:${password}:${rounds}`;
	});
	const compare = mock(async (password: string, hashedPassword: string) => {
		return options?.compareResult ?? hashedPassword === `hashed:${password}:12`;
	});

	setBcryptSaltRounds(options?.saltRounds);
	await mock.module('bcryptjs', () => ({
		default: { hash, compare },
	}));

	return {
		...(await import(`./bcrypt.ts?test=${Date.now()}-${Math.random()}`)),
		bcryptMock: { hash, compare },
	};
}

afterEach(() => {
	mock.restore();
	setBcryptSaltRounds(ORIGINAL_BCRYPT_SALT_ROUNDS);
});

describe('UNIT - Shared Kernel Infra', () => {
	describe('bcrypt', () => {
		it('uses the configured salt rounds, with a minimum of 8', async () => {
			const { BcryptHashService, bcryptMock } = await loadBcryptModule({
				saltRounds: '6',
			});

			await expect(BcryptHashService.hash('secret')).resolves.toBe(
				'hashed:secret:8',
			);
			expect(bcryptMock.hash).toHaveBeenCalledTimes(1);
			expect(bcryptMock.hash).toHaveBeenCalledWith('secret', 8);
		});

		it('uses the provided salt rounds when they are valid', async () => {
			const { BcryptHashService, bcryptMock } = await loadBcryptModule({
				saltRounds: '14',
			});

			await expect(BcryptHashService.hash('secret')).resolves.toBe(
				'hashed:secret:14',
			);
			expect(bcryptMock.hash).toHaveBeenCalledWith('secret', 14);
		});

		it('delegates password comparison to bcryptjs', async () => {
			const { BcryptHashService, bcryptMock } = await loadBcryptModule({
				compareResult: true,
			});

			await expect(
				BcryptHashService.compare('secret', 'hashed-value'),
			).resolves.toBe(true);
			expect(bcryptMock.compare).toHaveBeenCalledWith('secret', 'hashed-value');
		});

		it('provides a deterministic fake hash service for tests', async () => {
			const { FakeHashService } = await loadBcryptModule();

			await expect(FakeHashService.hash('secret')).resolves.toBe(
				'fake-hash-of-secret',
			);
			await expect(
				FakeHashService.compare('secret', 'fake-hash-of-secret'),
			).resolves.toBe(true);
			await expect(
				FakeHashService.compare('secret', 'something-else'),
			).resolves.toBe(false);
		});
	});
});
