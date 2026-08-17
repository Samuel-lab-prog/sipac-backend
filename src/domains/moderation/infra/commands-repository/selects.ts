import type { Prisma } from '@PrismaGenerated/browser';
import type {
	BannedUserResponse,
	SuspendedUserResponse,
} from '../../ports/models';

export const banSelect = {
	id: true,
	userId: true,
	moderatorId: true,
	reason: true,
	startAt: true,
	endAt: true,
} as const satisfies Prisma.UserSanctionSelect;

export type BanRaw = Prisma.UserSanctionGetPayload<{
	select: typeof banSelect;
}>;

export function fromRawToBannedUser(raw: BanRaw): BannedUserResponse {
	return {
		id: raw.id,
		reason: raw.reason,
		moderatorId: raw.moderatorId,
		bannedUserId: raw.userId,
		bannedAt: raw.startAt,
	};
}

export const suspensionSelect = {
	id: true,
	userId: true,
	moderatorId: true,
	reason: true,
	startAt: true,
	endAt: true,
} as const satisfies Prisma.UserSanctionSelect;

export type SuspensionRaw = Prisma.UserSanctionGetPayload<{
	select: typeof suspensionSelect;
}>;

export function fromRawToSuspendedUser(
	raw: SuspensionRaw,
): SuspendedUserResponse {
	return {
		id: raw.id,
		reason: raw.reason,
		moderatorId: raw.moderatorId,
		suspendedUserId: raw.userId,
		suspendedAt: raw.startAt,
		endAt: raw.endAt!, // Valid because endAt is required for suspensions
	};
}

export const poemModerationSelect = {
	id: true,
	moderationStatus: true,
} as const satisfies Prisma.PoemSelect;
