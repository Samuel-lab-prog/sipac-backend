import type {
	TokenService,
	TokenPayload,
	LoginClientParams,
} from '../../../ports/externalServices';
import type { LoginResponse } from '../../../ports/models';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import { UnauthorizedError } from '@DomainError';
import {
	ACCESS_TOKEN_EXPIRATION_TIME,
	REFRESH_TOKEN_EXPIRATION_TIME,
} from 'server-config/config';

export interface LoginClientDependencies {
	tokenService: TokenService;
	hashService: HashServices;
	usersContract: UsersPublicContract;
}

const lockoutState = new Map<
	string,
	{ count: number; firstFailedAt: number; lockedUntil?: number }
>();

const LOCKOUT_THRESHOLD = Number(process.env.AUTH_LOCKOUT_THRESHOLD ?? 5);
const LOCKOUT_WINDOW_MS = Number(
	process.env.AUTH_LOCKOUT_WINDOW_MS ?? 15 * 60 * 1000,
);
const LOCKOUT_DURATION_MS = Number(
	process.env.AUTH_LOCKOUT_DURATION_MS ?? 15 * 60 * 1000,
);
const DEBUG_AUTH_LOGIN =
	process.env.DEBUG_AUTH_LOGIN === 'true' || process.env.NODE_ENV === 'development';

function debugLogin(message: string, details?: Record<string, unknown>) {
	if (!DEBUG_AUTH_LOGIN) return;

	console.log('[auth.login]', message, details ?? '');
}

function normalizeKey(email: string) {
	return email.trim().toLowerCase();
}

function getLockoutEntry(key: string) {
	const now = Date.now();
	const entry = lockoutState.get(key);

	if (!entry) return undefined;

	if (entry.lockedUntil && entry.lockedUntil > now) return entry;

	if (now - entry.firstFailedAt > LOCKOUT_WINDOW_MS) {
		lockoutState.delete(key);
		return undefined;
	}

	return entry;
}

function registerFailedAttempt(key: string) {
	const now = Date.now();
	const entry = getLockoutEntry(key);

	if (!entry) {
		lockoutState.set(key, { count: 1, firstFailedAt: now });
		return;
	}

	const count = entry.count + 1;
	const lockedUntil =
		count >= LOCKOUT_THRESHOLD ? now + LOCKOUT_DURATION_MS : undefined;

	lockoutState.set(key, {
		count,
		firstFailedAt: entry.firstFailedAt,
		lockedUntil,
	});
}

function clearLockout(key: string) {
	lockoutState.delete(key);
}

export function loginClientFactory(dependencies: LoginClientDependencies) {
	return async function loginClient(
		params: LoginClientParams,
	): Promise<LoginResponse> {
		const { tokenService, hashService, usersContract } = dependencies;
		const lockoutKey = normalizeKey(params.email);
		debugLogin('attempt started', {
			email: lockoutKey,
		});

		const client = await usersContract.selectAuthUserByEmail(lockoutKey);
		debugLogin('lookup finished', {
			email: lockoutKey,
			found: !!client,
			clientId: client?.id ?? null,
			status: client?.status ?? null,
		});

		if (client?.status === 'banned') {
			debugLogin('blocked because client is banned', {
				email: lockoutKey,
				clientId: client.id,
			});
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Client is banned');
		}

		const lockoutEntry = getLockoutEntry(lockoutKey);

		if (lockoutEntry?.lockedUntil && lockoutEntry.lockedUntil > Date.now()) {
			debugLogin('blocked because lockout is active', {
				email: lockoutKey,
				lockedUntil: lockoutEntry.lockedUntil,
			});
			throw new UnauthorizedError('Too many login attempts. Try again later.');
		}

		if (!client) {
			debugLogin('blocked because client was not found', {
				email: lockoutKey,
			});
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Invalid credentials');
		}

		const isPasswordValid = await hashService.compare(
			params.password,
			client.passwordHash,
		);
		debugLogin('password comparison finished', {
			email: lockoutKey,
			clientId: client.id,
			passwordValid: isPasswordValid,
		});

		if (!isPasswordValid) {
			debugLogin('blocked because password did not match', {
				email: lockoutKey,
				clientId: client.id,
			});
			registerFailedAttempt(lockoutKey);
			throw new UnauthorizedError('Invalid credentials');
		}

		clearLockout(lockoutKey);
		debugLogin('login succeeded', {
			email: lockoutKey,
			clientId: client.id,
		});

		const accessTokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
			tokenType: 'access',
		};

		const refreshTokenPayload: TokenPayload = {
			clientId: client.id,
			role: client.role,
			email: client.email,
			tokenType: 'refresh',
		};

		const accessToken = await tokenService.generateToken(
			accessTokenPayload,
			ACCESS_TOKEN_EXPIRATION_TIME,
		);

		const refreshToken = await tokenService.generateToken(
			refreshTokenPayload,
			REFRESH_TOKEN_EXPIRATION_TIME,
		);
		return {
			accessToken,
			refreshToken,
			client: {
				id: client.id,
				role: client.role,
				status: client.status,
			},
		};
	};
}
