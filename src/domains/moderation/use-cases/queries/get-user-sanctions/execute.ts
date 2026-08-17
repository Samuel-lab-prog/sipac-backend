import type {
	GetUserSanctionsParams,
	QueriesRepository,
} from '../../../ports/queries';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import type { UserSanctionsResponse } from '../../../ports/models';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function getUserSanctionsFactory({
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function getUserSanctions(
		params: GetUserSanctionsParams,
	): Promise<UserSanctionsResponse> {
		const { userId, requesterRole, requesterStatus } = params;

		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to view sanctions.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');

		const items = await queriesRepository.selectUserSanctions({ userId });
		return { items };
	};
}
