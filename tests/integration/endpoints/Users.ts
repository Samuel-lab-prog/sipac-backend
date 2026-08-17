import type { AppError } from '@AppError';
import type {
	CreateUser,
	CreateUserResult,
	UpdateUserData,
	UpdateUserResult,
	UserPublicProfile,
	UserRole,
	UserStatus,
} from '@Domains/users-management/ports/models.ts';
import {
	API_INSTANCE,
	API_PREFIX,
	handleResponse,
	jsonRequest,
} from '@GenericSubdomains/utils/testing/utils';
import { prisma } from '@Prisma/PrismaClient';

export async function getUserProfile(
	cookie: string,
	targetUserId: number,
): Promise<UserPublicProfile | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users/${targetUserId}/profile`, {
			method: 'GET',
			headers: { Cookie: cookie },
		}),
	);
	return handleResponse<UserPublicProfile>(res);
}

export async function createUser(
	data: CreateUser,
): Promise<CreateUserResult | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users`, {
			method: 'POST',
			body: data,
		}),
	);
	return handleResponse<CreateUserResult>(res);
}

export async function updateUserProfile(
	cookie: string,
	updates: UpdateUserData,
): Promise<UpdateUserResult | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/users`, {
			method: 'PATCH',
			headers: { Cookie: cookie },
			body: updates,
		}),
	);
	return handleResponse<UpdateUserResult>(res);
}

/**
 * Updates a user's role or status directly in the database. Useful for setting up test scenarios.
 * @param userId The ID of the user to update.
 * @param updates An object containing the fields to update.
 */
export async function updateUserStatsRaw(
	userId: number,
	updates: Partial<{ role: UserRole; status: UserStatus }>,
) {
	await prisma.user.update({
		where: { id: userId },
		data: updates,
	});
}
