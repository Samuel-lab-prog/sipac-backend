import { usersPublicContract } from '@Domains/users-management/public/index';
import {
	BcryptHashService,
	FakeHashService,
} from '@SharedKernel/infra/encrypting/bcrypt';
import { createAuthPlugin } from './adapters/AuthPlugin';
import { createAuthRouter } from './adapters/AuthRouter';
import {
	FakeJwtTokenService,
	JwtTokenService,
} from './infra/jwt-token-service/JwtTokenService';
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
