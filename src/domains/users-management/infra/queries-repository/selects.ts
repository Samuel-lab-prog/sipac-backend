import type { Prisma } from '@PrismaGenerated/browser';
import type { UserSelect } from '@PrismaGenerated/models';
import type { UserSelect as InternalUserSelect } from '@PrismaGenerated/internal/prismaNamespaceBrowser';
import type { AuthUser } from '@Domains/users-management/ports/models';
import type { UsersPage } from '../../ports/models';

function normalizeAvatarUrl(
	avatarUrl: string | null | undefined,
): string | null {
	if (!avatarUrl) return null;

	const trimmed = avatarUrl.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export const authUserSelect = {
	id: true,
	email: true,
	passwordHash: true,
	role: true,
	status: true,
} as const satisfies UserSelect;

export type AuthUserRaw = Prisma.UserGetPayload<{
	select: typeof authUserSelect;
}>;

export function fromRawToAuthUser(raw: AuthUserRaw): AuthUser {
	return {
		id: raw.id,
		email: raw.email,
		passwordHash: raw.passwordHash,
		role: raw.role,
		status: raw.status,
	};
}

export const fullUserSelect = {
	id: true,
	nickname: true,
	email: true,
	name: true,
	bio: true,
	avatarUrl: true,
	role: true,
	createdAt: true,
	updatedAt: true,
	emailVerifiedAt: true,
	deletedAt: true,
	status: true,
} as const satisfies UserSelect;

export const previewUserSelect = {
	id: true,
	name: true,
	nickname: true,
	avatarUrl: true,
	role: true,
} as const satisfies InternalUserSelect;

export type PreviewUserRaw = Prisma.UserGetPayload<{
	select: typeof previewUserSelect;
}>;

export function fromRawToPreviewUser(
	raw: PreviewUserRaw,
): UsersPage['users'][number] {
	return {
		id: raw.id,
		name: raw.name,
		nickname: raw.nickname,
		avatarUrl: normalizeAvatarUrl(raw.avatarUrl),
		role: raw.role,
	};
}
