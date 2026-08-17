import type { AppError } from '@AppError';
import type {
	BlockedUserRecord,
	CancelFriendRequestRecord,
	FriendRequestRecord,
	FriendRequestRejectionRecord,
	FriendshipRecord,
	RemovedFriendRecord,
	UnblockUserRecord,
} from '@Domains/friends-management/ports/models.ts';
import {
	API_INSTANCE,
	API_PREFIX,
	handleResponse,
	jsonRequest,
} from '@GenericSubdomains/utils/testing/utils';
import { prisma } from '@Prisma/PrismaClient';

export async function sendFriendRequest(
	cookie: string,
	addresseeId: number,
): Promise<FriendRequestRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/${addresseeId}`, {
			method: 'POST',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<FriendRequestRecord>(res);
}

export async function acceptFriendRequest(
	cookie: string,
	requesterId: number,
): Promise<FriendshipRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/accept/${requesterId}`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<FriendshipRecord>(res);
}

export async function rejectFriendRequest(
	cookie: string,
	requesterId: number,
): Promise<FriendRequestRejectionRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/reject/${requesterId}`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<FriendRequestRejectionRecord>(res);
}

export async function unblockUser(
	cookie: string,
	targetUserId: number,
): Promise<UnblockUserRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/unblock/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<UnblockUserRecord>(res);
}

export async function blockUser(
	cookie: string,
	targetUserId: number,
): Promise<BlockedUserRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/block/${targetUserId}`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<BlockedUserRecord>(res);
}

export async function cancelFriendRequest(
	cookie: string,
	addresseeId: number,
): Promise<CancelFriendRequestRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/cancel/${addresseeId}`, {
			method: 'DELETE',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<CancelFriendRequestRecord>(res);
}

export async function deleteFriend(
	cookie: string,
	friendUserId: number,
): Promise<RemovedFriendRecord | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/friends/delete/${friendUserId}`, {
			method: 'DELETE',
			headers: { Cookie: cookie },
		}),
	);
	return await handleResponse<RemovedFriendRecord>(res);
}

/**
 * Creates a friendship relation between two users in the database. Useful for validating test scenarios.
 * @param requesterId The ID of the user who sent the friend request.
 * @param addresseeId The ID of the user who received the friend request.
 */
export async function createFriendshipRaw(
	requesterId: number,
	addresseeId: number,
) {
	await prisma.friendship.create({
		data: {
			userAId: requesterId,
			userBId: addresseeId,
		},
	});
}
