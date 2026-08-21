import { usersPublicContract } from '@Domains/users-management/public/index';
import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { createAuthPlugin } from './adapters/auth-plugin';
import { createAuthRouter } from './adapters/auth-router';
import {
	FakeJwtTokenService,
	JwtTokenService,
} from './infra/jwt-token-service/jwt-token-service';
import {
	refreshSessionFactory,
	loginClientFactory,
	authenticateClientFactory,
} from './use-cases/commands';

const login = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: BcryptHashService,
	tokenService: JwtTokenService,
});

const authenticate = authenticateClientFactory({
	usersContract: usersPublicContract,
	tokenService: JwtTokenService,
});

const refreshSession = refreshSessionFactory({
	usersContract: usersPublicContract,
	tokenService: JwtTokenService,
});

const loginWithFakeHash = loginClientFactory({
	usersContract: usersPublicContract,
	hashService: FakeHashService,
	tokenService: JwtTokenService,
});

const authenticateWithFakeTokenService = authenticateClientFactory({
	usersContract: usersPublicContract,
	tokenService: FakeJwtTokenService,
});

export const authRouter = createAuthRouter({ login, refreshSession });
export const authPlugin = createAuthPlugin({ authenticate });
export const authRouterWithFakeHash = createAuthRouter({
	login: loginWithFakeHash,
	refreshSession,
});
export const authPluginWithFakeTokenService = createAuthPlugin({
	authenticate: authenticateWithFakeTokenService,
});
