import type {
	BannedUserResponse,
	PoemModerationRead,
	PoemNotificationsData,
	SuspendedUserResponse,
	UserSanctionRead,
	UserSanctionsResponse,
	UserSanctionStatusResponse,
} from './models';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';

export type ModerationRequesterContext = {
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};

export type GetUserSanctionsParams = ModerationRequesterContext & {
	userId: number;
};

export type GetUserSanctionStatusParams = ModerationRequesterContext & {
	userId: number;
};

export interface QueriesRepository {
	selectActiveBanByUserId(params: {
		userId: number;
	}): Promise<BannedUserResponse | null>;
	selectActiveSuspensionByUserId(params: {
		userId: number;
	}): Promise<SuspendedUserResponse | null>;
	selectUserSanctions(params: { userId: number }): Promise<UserSanctionRead[]>;

	selectPoemById(poemId: number): Promise<PoemModerationRead | null>;
	selectPoemNotificationsData(
		poemId: number,
	): Promise<PoemNotificationsData | null>;
}

export interface QueriesRouterServices {
	getUserSanctions(
		params: GetUserSanctionsParams,
	): Promise<UserSanctionsResponse>;
	getUserSanctionStatus(
		params: GetUserSanctionStatusParams,
	): Promise<UserSanctionStatusResponse>;
}
