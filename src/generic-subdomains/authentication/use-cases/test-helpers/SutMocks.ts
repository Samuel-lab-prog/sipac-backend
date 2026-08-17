import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { MockedContract } from '@GenericSubdomains/utils/testing/utils';
import type { HashServices } from '@SharedKernel/ports/HashServices';
import type { TokenService } from '../../ports/externalServices';

export type AuthSutMocks = {
	usersContract: MockedContract<UsersPublicContract>;
	tokenService: MockedContract<TokenService>;
	hashService: MockedContract<HashServices>;
};
