import type {
	UserRole,
	UserStatus,
	PoemModerationStatus,
} from '@SharedKernel/Enums';
import type {
	BannedUserResponse,
	ModeratePoemResult,
	SuspendedUserResponse,
} from './models';
import type { CommandResult } from '@SharedKernel/Types';

export type BanUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export type SuspendUserParams = {
	userId: number;
	reason: string;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
	durationDays?: number;
};

export type UnbanUserParams = {
	userId: number;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export type UnsuspendUserParams = {
	userId: number;
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export type ModeratePoemParams = {
	poemId: number;
	moderationStatus: PoemModerationStatus;
	reason?: string;
	meta: {
		requesterId: number;
		requesterStatus: UserStatus;
		requesterRole: UserRole;
	};
};

export interface CommandsRepository {
	createBan(params: {
		userId: number;
		reason: string;
		moderatorId: number;
	}): Promise<BannedUserResponse>;
	createSuspension(params: {
		userId: number;
		reason: string;
		moderatorId: number;
		endAt: Date;
	}): Promise<SuspendedUserResponse>;
	endBan(params: { banId: number; endAt: Date }): Promise<void>;
	endSuspension(params: { suspensionId: number; endAt: Date }): Promise<void>;
	activateUser(params: { userId: number }): Promise<void>;
	updatePoemModerationStatus(params: {
		poemId: number;
		moderationStatus: PoemModerationStatus;
		reason?: string;
	}): Promise<CommandResult<ModeratePoemResult>>;
}

export interface CommandsRouterServices {
	banUser(params: BanUserParams): Promise<BannedUserResponse>;
	suspendUser(params: SuspendUserParams): Promise<SuspendedUserResponse>;
	unbanUser(params: UnbanUserParams): Promise<void>;
	unsuspendUser(params: UnsuspendUserParams): Promise<void>;
	moderatePoem(params: ModeratePoemParams): Promise<ModeratePoemResult>;
}
