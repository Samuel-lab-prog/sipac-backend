import bcrypt from 'bcryptjs';
import type { HashServices } from '../ports/HashServices';

const DEFAULT_SALT_ROUNDS = 12;
const SALT_ROUNDS = Math.max(
	8,
	Number(process.env.BCRYPT_SALT_ROUNDS) || DEFAULT_SALT_ROUNDS,
);

function hash(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

function compare(password: string, hashedPassword: string): Promise<boolean> {
	return bcrypt.compare(password, hashedPassword);
}

export const BcryptHashService: HashServices = {
	hash,
	compare,
};

function fakeHash(password: string): Promise<string> {
	return Promise.resolve(`fake-hash-of-${password}`);
}

function fakeCompare(
	password: string,
	hashedPassword: string,
): Promise<boolean> {
	return Promise.resolve(hashedPassword === `fake-hash-of-${password}`);
}

export const FakeHashService: HashServices = {
	hash: fakeHash,
	compare: fakeCompare,
};
