import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/commands';
import type {
	FriendRequestRecord,
	FriendRequestRejectionRecord,
	FriendshipRecord,
	BlockedUserRecord,
	UnblockUserRecord,
	CancelFriendRequestRecord,
	RemovedFriendRecord,
} from '../../ports/models';
import type { CommandResult } from '@SharedKernel/Types';

export const commandsRepository: CommandsRepository = {
	createFriendRequest,
	acceptFriendRequest,
	rejectFriendRequest,
	blockUser,
	deleteFriend,
	deleteFriendRequestIfExists,
	cancelFriendRequest,
	unblockUser,
};

function normalizePair(id1: number, id2: number): [number, number] {
	return id1 < id2 ? [id1, id2] : [id2, id1];
}

export function createFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<FriendRequestRecord>> {
	return withPrismaResult(async () => {
		const rs = await prisma.friendshipRequest.create({
			data: { requesterId, addresseeId },
		});

		return {
			id: rs.id,
			requesterId: rs.requesterId,
			addresseeId: rs.addresseeId,
			createdAt: rs.createdAt,
		};
	});
}

export function acceptFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<FriendshipRecord>> {
	return withPrismaResult(async () => {
		const [userAId, userBId] = normalizePair(requesterId, addresseeId);

		const friendship = await prisma.$transaction(async (tx) => {
			await tx.friendshipRequest.delete({
				where: { requesterId_addresseeId: { requesterId, addresseeId } },
			});

			return tx.friendship.create({
				data: { userAId, userBId },
			});
		});

		return {
			id: friendship.id,
			userAId: friendship.userAId,
			userBId: friendship.userBId,
			createdAt: friendship.createdAt,
		};
	});
}

export function rejectFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<FriendRequestRejectionRecord>> {
	return withPrismaResult(async () => {
		await prisma.friendshipRequest.delete({
			where: { requesterId_addresseeId: { requesterId, addresseeId } },
		});

		return {
			rejecterId: requesterId,
			rejectedId: addresseeId,
		};
	});
}

export function deleteFriend(
	removedById: number,
	removedId: number,
): Promise<CommandResult<RemovedFriendRecord>> {
	return withPrismaResult(async () => {
		await prisma.friendship.deleteMany({
			where: {
				OR: [
					{ userAId: removedById, userBId: removedId },
					{ userAId: removedId, userBId: removedById },
				],
			},
		});

		return {
			removedById,
			removedId,
		};
	});
}

export function deleteFriendRequestIfExists(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.friendshipRequest.deleteMany({
			where: { requesterId, addresseeId },
		});
	});
}

export function cancelFriendRequest(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<CancelFriendRequestRecord>> {
	return withPrismaResult(async () => {
		await prisma.friendshipRequest.delete({
			where: { requesterId_addresseeId: { requesterId, addresseeId } },
		});

		return {
			cancellerId: requesterId,
			cancelledId: addresseeId,
		};
	});
}

export function blockUser(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<BlockedUserRecord>> {
	return withPrismaResult(async () => {
		const [, , blocked] = await prisma.$transaction([
			prisma.friendshipRequest.deleteMany({
				where: {
					OR: [
						{ requesterId, addresseeId },
						{ requesterId: addresseeId, addresseeId: requesterId },
					],
				},
			}),

			prisma.friendship.deleteMany({
				where: {
					OR: [
						{ userAId: requesterId, userBId: addresseeId },
						{ userAId: addresseeId, userBId: requesterId },
					],
				},
			}),

			prisma.blockedUser.create({
				data: { blockerId: requesterId, blockedId: addresseeId },
			}),
		]);

		return {
			blockedById: blocked.blockerId,
			blockedUserId: blocked.blockedId,
			id: blocked.id,
			createdAt: blocked.createdAt,
		};
	});
}

export function unblockUser(
	requesterId: number,
	addresseeId: number,
): Promise<CommandResult<UnblockUserRecord>> {
	return withPrismaResult(async () => {
		await prisma.blockedUser.delete({
			where: {
				blockerId_blockedId: { blockerId: requesterId, blockedId: addresseeId },
			},
		});

		return {
			unblockerId: requesterId,
			unblockedId: addresseeId,
		};
	});
}
