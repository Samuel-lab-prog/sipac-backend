/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@Prisma/PrismaClient';
import type { UserWhereInput } from '@Prisma/generated/models/User';
import { withPrismaErrorHandling } from '@Prisma/PrismaErrorHandler';

import type { QueriesRepository, SelectUsersParams } from '../../ports/queries';

import type {
	UserPublicProfile,
	UserPrivateProfile,
	UsersPage,
	FullUser,
} from '../../ports/models';

import {
	fullUserSelect,
	previewUserSelect,
	fromRawToPreviewUser,
} from './selects';

import {
	publicProfileSelect,
	fromRawToPublicProfile,
	privateProfileSelect,
	fromRawToPrivateProfile,
} from '@Domains/poems-management/public/Index';
import { publicUserStatusFilter } from '@SharedKernel/policies/BannedUserVisibility';
import {
	selectBannedUserIds,
	visibleNotificationActorWhere,
} from '@Prisma/VisibilityFilters';

type UserUniqueWhere =
	| { id: number }
	| { email: string }
	| { nickname: string };

function selectFullUser(
	where: UserUniqueWhere & { deletedAt: null },
): Promise<FullUser | null> {
	return withPrismaErrorHandling(() =>
		prisma.user.findUnique({
			where,
			select: fullUserSelect,
		}),
	);
}

const selectUserById = (id: number) => selectFullUser({ id, deletedAt: null });

const selectUserByEmail = (email: string) =>
	selectFullUser({ email, deletedAt: null });

const selectUserByNickname = (nickname: string) =>
	selectFullUser({ nickname, deletedAt: null });

function selectProfile(params: {
	id: number;
	isPrivate: boolean;
	requesterId: number;
	requesterRole: UserPublicProfile['role'];
	requesterStatus: UserPublicProfile['status'];
}): Promise<UserPrivateProfile | UserPublicProfile | null> {
	return withPrismaErrorHandling(async () => {
		const user = await prisma.user.findFirst({
			where: { id: params.id, deletedAt: null },
			select: params.isPrivate ? privateProfileSelect : publicProfileSelect,
		});

		if (!user) return null;
		const viewer = {
			id: params.requesterId,
			role: params.requesterRole,
			status: params.requesterStatus,
		};

		if (!params.isPrivate) return fromRawToPublicProfile(user as any, viewer);

		const bannedUserIds = await selectBannedUserIds();
		const unreadNotificationsCount = await prisma.notification.count({
			where: {
				userId: params.id,
				readAt: null,
				...visibleNotificationActorWhere(bannedUserIds),
			},
		});

		return fromRawToPrivateProfile(user as any, viewer, {
			unreadNotificationsCount,
		});
	});
}

function selectUsers(params: SelectUsersParams): Promise<UsersPage> {
	return withPrismaErrorHandling(async () => {
		const {
			navigationOptions: { cursor, limit },
			filterOptions: { searchNickname, role, status },
			sortOptions: { orderBy, orderDirection },
		} = params;

		const where: UserWhereInput = {
			deletedAt: null,
			...(role && { role }),
			status: status ?? publicUserStatusFilter,
			...(searchNickname && {
				nickname: {
					contains: searchNickname,
					mode: 'insensitive',
				},
			}),
		};

		const users = await prisma.user.findMany({
			where,
			take: limit + 1,
			...(cursor && {
				cursor: { id: cursor },
				skip: 1,
			}),
			orderBy: {
				[orderBy]: orderDirection,
			},
			select: previewUserSelect,
		});

		const hasMore = users.length > limit;
		const items = hasMore ? users.slice(0, limit) : users;

		return {
			users: items.map(fromRawToPreviewUser),
			hasMore,
			nextCursor: items.at(-1)?.id,
		};
	});
}

function findNickname(nickname: string): Promise<boolean> {
	return withPrismaErrorHandling(async () => {
		const count = await prisma.user.count({
			where: { nickname, deletedAt: null },
		});
		return count > 0;
	});
}

function findEmail(email: string): Promise<boolean> {
	return withPrismaErrorHandling(async () => {
		const count = await prisma.user.count({
			where: { email, deletedAt: null },
		});
		return count > 0;
	});
}

export const queriesRepository: QueriesRepository = {
	selectUserById,
	selectUserByEmail,
	selectUserByNickname,
	selectProfile,
	selectUsers,
	findNickname,
	findEmail,
};
