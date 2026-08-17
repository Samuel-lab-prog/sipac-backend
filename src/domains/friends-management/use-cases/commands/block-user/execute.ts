import type {
	CommandsRepository,
	BlockUserParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import type { BlockedUserRecord } from '../../../ports/models';
import { ConflictError, ForbiddenError, NotFoundError } from '@DomainError';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { isBannedUser } from '@SharedKernel/policies/BannedUserVisibility';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function blockUserFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: Dependencies) {
	return async function blockUser(
		params: BlockUserParams,
	): Promise<BlockedUserRecord> {
		const { requesterId, addresseeId } = params;

		if (requesterId === addresseeId)
			throw new ConflictError('Users cannot block themselves');

		const [requesterInfo, addresseeInfo] = await Promise.all([
			usersContract.selectUserBasicInfo(requesterId),
			usersContract.selectUserBasicInfo(addresseeId),
		]);
		if (isBannedUser(requesterInfo.status))
			throw new ForbiddenError('Banned users cannot block users');
		if (!addresseeInfo.exists || isBannedUser(addresseeInfo.status))
			throw new NotFoundError('User not found');

		const alreadyBlocked = await queriesRepository.findBlockedRelationship({
			userId1: requesterId,
			userId2: addresseeId,
		});

		if (alreadyBlocked) throw new ConflictError('Users are already blocked');

		const friendship = await queriesRepository.findFriendshipBetweenUsers({
			user1Id: requesterId,
			user2Id: addresseeId,
		});

		if (friendship) {
			const result = await commandsRepository.deleteFriend(
				requesterId,
				addresseeId,
			);
			if (!result.ok) throw new Error(result.message);
		}

		const req1 = await commandsRepository.deleteFriendRequestIfExists(
			requesterId,
			addresseeId,
		);
		if (!req1.ok) throw new Error(req1.message);

		const req2 = await commandsRepository.deleteFriendRequestIfExists(
			addresseeId,
			requesterId,
		);
		if (!req2.ok) throw new Error(req2.message);

		const blockResult = await commandsRepository.blockUser(
			requesterId,
			addresseeId,
		);
		if (!blockResult.ok) throw new Error(blockResult.message);

		return blockResult.data!;
	};
}
