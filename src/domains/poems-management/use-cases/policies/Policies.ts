import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { QueriesRepository } from '../../ports/queries';
import type {
	PoemStatus,
	PoemVisibility,
	PoemModerationStatus,
} from '../../ports/models';
import {
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import {
	canViewBannedUserHistory,
	isBannedUser,
} from '@SharedKernel/policies/BannedUserVisibility';

type AuthorContext = {
	status: UserStatus;
	id: number;
	role: UserRole;
};

type PoemPolicyContext = {
	author: AuthorContext;
};

export type PoemCreationPolicyParams = {
	ctx: PoemPolicyContext;
	usersContract: UsersPublicContract;
	toUserIds?: number[];
	mentionedUserIds?: number[];
};

export type PoemUpdatePolicyParams = PoemCreationPolicyParams & {
	poemId: number;
	queriesRepository: QueriesRepository;
};

/**
 * Validates a list of user IDs.
 * @throws ForbiddenError if the list includes the requester ID
 * @throws UnprocessableEntityError if any user doesn't exist or is inactive
 */
export async function validateUsers(
	usersContract: UsersPublicContract,
	requesterId: number,
	userIds?: number[] | undefined,
	fieldName = 'users',
): Promise<void> {
	const ids = Array.isArray(userIds) ? userIds.map(Number) : [];

	if (!ids.length) return;

	if (ids.includes(requesterId))
		throw new ForbiddenError('Author cannot assign or mention themselves');

	const users = await usersContract.selectUsersBasicInfo(ids);

	const invalidUser = users.find((u) => !u || u.status !== 'active');

	if (invalidUser) throw new UnprocessableEntityError(`Invalid ${fieldName}`);
}

export async function canCreatePoem(
	params: PoemCreationPolicyParams,
): Promise<void> {
	const { ctx, usersContract, toUserIds, mentionedUserIds } = params;
	const { author } = ctx;

	if (author.status !== 'active')
		throw new ForbiddenError('Author is not active');

	await validateUsers(usersContract, author.id, toUserIds, 'dedicated users');
	await validateUsers(
		usersContract,
		author.id,
		mentionedUserIds,
		'mentioned users',
	);
}

export async function canUpdatePoem(
	params: PoemUpdatePolicyParams,
): Promise<void> {
	const {
		ctx,
		usersContract,
		toUserIds,
		mentionedUserIds,
		poemId,
		queriesRepository,
	} = params;
	const { author } = ctx;

	if (author.status !== 'active') {
		throw new ForbiddenError('Author is not active');
	}

	const existingPoem = await queriesRepository.selectPoemById(poemId);
	if (!existingPoem) throw new NotFoundError('Poem not found');
	if (existingPoem.author.id !== author.id)
		throw new ForbiddenError('User is not the author');
	if (
		existingPoem.status === 'published' &&
		existingPoem.moderationStatus !== 'rejected'
	)
		throw new ForbiddenError('Cannot update published poem');
	if (existingPoem.moderationStatus === 'removed')
		throw new ForbiddenError('Cannot update removed poem');

	await validateUsers(usersContract, author.id, toUserIds, 'dedicated users');
	await validateUsers(
		usersContract,
		author.id,
		mentionedUserIds,
		'mentioned users',
	);
}

export async function canManagePoemAudio(params: {
	ctx: PoemPolicyContext;
	poemId: number;
	queriesRepository: QueriesRepository;
}): Promise<void> {
	const { ctx, poemId, queriesRepository } = params;
	const { author } = ctx;

	if (author.status !== 'active') {
		throw new ForbiddenError('Author is not active');
	}

	const existingPoem = await queriesRepository.selectPoemById(poemId);
	if (!existingPoem) throw new NotFoundError('Poem not found');
	if (existingPoem.author.id !== author.id)
		throw new ForbiddenError('User is not the author');
	if (existingPoem.moderationStatus === 'removed')
		throw new ForbiddenError('Cannot update removed poem');
}

type ViewerContext = { id?: number; role?: UserRole; status?: UserStatus };
type AuthorContextForView = {
	friendIds?: number[];
	id: number;
	status?: UserStatus;
	directAccess?: boolean;
};
type PoemContext = {
	id: number;
	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
};

export type PoemPolicyContextForView = {
	viewer: ViewerContext;
	author: AuthorContextForView;
	poem: PoemContext;
};

export function canViewPoem(c: PoemPolicyContextForView): boolean {
	const { viewer, author, poem } = c;

	const isViewerOwnAuthor = viewer.id === author.id;
	if (isViewerOwnAuthor) return true;

	if (viewer.status === 'banned') return false;
	if (isBannedUser(author.status) && !canViewBannedUserHistory(viewer))
		return false;
	if (poem.moderationStatus !== 'approved') return false;
	if (poem.status === 'draft') return false;

	const isViewerModerator = canViewBannedUserHistory(viewer);
	const isPoemPrivate = poem.visibility === 'private';
	if (isViewerModerator && !isPoemPrivate) return true;

	const isDirectAccess = author.directAccess === true;

	function isFriend(): boolean {
		return (
			viewer.id !== undefined && author.friendIds?.includes(viewer.id) === true
		);
	}

	switch (poem.visibility) {
		case 'public':
			return true;
		case 'unlisted':
			return isDirectAccess;
		case 'friends':
			return isFriend();
		case 'private':
			return false;
		default:
			return false;
	}
}
