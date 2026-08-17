import { t } from 'elysia';
import { bannedUserResponseSchema } from './BannedUserResponse';
import { suspendedUserResponseSchema } from './SuspendedUserResponse';

export const userSanctionStatusResponseSchema = t.Object({
	activeBan: t.Nullable(bannedUserResponseSchema),
	activeSuspension: t.Nullable(suspendedUserResponseSchema),
});
