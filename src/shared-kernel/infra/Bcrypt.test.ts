import { describe, it, expect } from 'bun:test';
import { BcryptHashService } from './Bcrypt';

describe('BcryptHashService', () => {
	it('should hash a password and validate it correctly', async () => {
		const password = 'my-secure-password';

		const hashedPassword = await BcryptHashService.hash(password);

		expect(hashedPassword).toBeDefined();
		expect(typeof hashedPassword).toBe('string');
		expect(hashedPassword).not.toBe(password);

		const isValid = await BcryptHashService.compare(password, hashedPassword);

		expect(isValid).toBe(true);
	});

	it('should return false when password does not match hash', async () => {
		const password = 'correct-password';
		const wrongPassword = 'wrong-password';

		const hashedPassword = await BcryptHashService.hash(password);

		const isValid = await BcryptHashService.compare(
			wrongPassword,
			hashedPassword,
		);

		expect(isValid).toBe(false);
	});
});
