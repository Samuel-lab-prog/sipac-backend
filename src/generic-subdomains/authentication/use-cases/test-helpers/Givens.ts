import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { TokenService } from '../../ports/externalServices';

import { givenResolved } from '@GenericSubdomains/utils/testing/utils';
import type { AuthSutMocks } from './sutMocks';

import {
	DEFAULT_CLIENT_EMAIL,
	DEFAULT_CLIENT_ID,
	DEFAULT_CLIENT_ROLE,
	DEFAULT_CLIENT_STATUS,
	DEFAULT_PASSWORD_HASH,
	DEFAULT_TOKEN,
} from './constants';

export type AuthUserOverride = Partial<
	Awaited<ReturnType<UsersPublicContract['selectAuthUserByEmail']>>
>;

export type TokenPayloadOverride = Partial<
	ReturnType<TokenService['verifyToken']>
>;

export function givenAuthUserExists(
	usersContract: AuthSutMocks['usersContract'],
	overrides: AuthUserOverride = {},
) {
	givenResolved(usersContract, 'selectAuthUserByEmail', {
		id: DEFAULT_CLIENT_ID,
		email: DEFAULT_CLIENT_EMAIL,
		passwordHash: DEFAULT_PASSWORD_HASH,
		role: DEFAULT_CLIENT_ROLE,
		status: DEFAULT_CLIENT_STATUS,
		...overrides,
	});
}

export function givenAuthUserNotFound(
	usersContract: AuthSutMocks['usersContract'],
) {
	givenResolved(usersContract, 'selectAuthUserByEmail', null);
}

export function givenPasswordValid(
	hashService: AuthSutMocks['hashService'],
	isValid = true,
) {
	givenResolved(hashService, 'compare', isValid);
}

export function givenTokenGenerated(
	tokenService: AuthSutMocks['tokenService'],
	token: string = DEFAULT_TOKEN,
) {
	tokenService.generateToken.mockReturnValue(token);
}

export function givenTokenValid(
	tokenService: AuthSutMocks['tokenService'],
	overrides: TokenPayloadOverride = {},
) {
	tokenService.verifyToken.mockReturnValue({
		email: DEFAULT_CLIENT_EMAIL,
		clientId: DEFAULT_CLIENT_ID,
		role: DEFAULT_CLIENT_ROLE,
		tokenType: 'access',
		...overrides,
	});
}

export function givenTokenInvalid(tokenService: AuthSutMocks['tokenService']) {
	tokenService.verifyToken.mockReturnValue(null);
}
