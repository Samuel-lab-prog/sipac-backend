import type {
	GetUserSanctionStatusParams,
	QueriesRepository,
} from '../../../ports/queries';
import type { UsersServicesForModeration } from '../../../ports/externalServices';
import type { UserSanctionStatusResponse } from '../../../ports/models';
import { ForbiddenError, NotFoundError } from '@DomainError';

interface Dependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersServicesForModeration;
}

export function getUserSanctionStatusFactory({
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function getUserSanctionStatus(
		params: GetUserSanctionStatusParams,
	): Promise<UserSanctionStatusResponse> {
		const { userId, requesterRole, requesterStatus } = params;

		if (requesterStatus !== 'active') {
			throw new ForbiddenError('User is not active.');
		}
		if (requesterRole === 'author') {
			throw new ForbiddenError('You do not have permission to view sanctions.');
		}

		const userExists = await usersContract.selectUserBasicInfo(userId);
		if (!userExists.exists) throw new NotFoundError('User not found.');

		const [activeBan, activeSuspension] = await Promise.all([
			queriesRepository.selectActiveBanByUserId({ userId }),
			queriesRepository.selectActiveSuspensionByUserId({ userId }),
		]);

		return {
			activeBan,
			activeSuspension,
		};
	};
}
