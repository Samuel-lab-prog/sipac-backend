import {
	bannedUserResponseSchema,
	ModeratePoemBodySchema,
	ModeratePoemResultSchema,
	suspendedUserResponseSchema,
	userSanctionStatusResponseSchema,
	userSanctionsResponseSchema,
} from '../ports/schemas/Index';
import type {
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
	SanctionType,
} from '@SharedKernel/Enums';

export type BannedUserResponse = (typeof bannedUserResponseSchema)['static'];
export type SuspendedUserResponse =
	(typeof suspendedUserResponseSchema)['static'];
export type ModeratePoemBody = (typeof ModeratePoemBodySchema)['static'];
export type ModeratePoemResult = (typeof ModeratePoemResultSchema)['static'];
export type UserSanctionsResponse =
	(typeof userSanctionsResponseSchema)['static'];
export type UserSanctionStatusResponse =
	(typeof userSanctionStatusResponseSchema)['static'];

export type PoemModerationRead = {
	id: number;
	title: string;
	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: PoemModerationStatus;
	author: {
		id: number;
		nickname: string;
		avatarUrl: string | null;
	};
};

export type PoemNotificationsData = {
	id: number;
	title: string;
	authorId: number;
	authorNickname: string;
	authorAvatarUrl: string | null;
	authorFriendIds: number[];
	dedicatedUserIds: number[];
	mentionedUserIds: number[];
};

export type UserSanctionRead = {
	id: number;
	userId: number;
	moderatorId: number;
	type: SanctionType;
	reason: string;
	startAt: Date;
	endAt: Date | null;
};
