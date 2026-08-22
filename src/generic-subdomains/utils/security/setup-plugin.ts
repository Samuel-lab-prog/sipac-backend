import Elysia, { type Static } from 'elysia';
import { appErrorSchema } from '../error-handling/app-error/util.ts';
import { log } from '../logging/logger';
import {
	userRoleSchema,
	userStatusSchema,
} from '@Domains/users-management/ports/schemas';

type UserRole = Static<typeof userRoleSchema>;
type UserStatus = Static<typeof userStatusSchema>;
type AuthType = {
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};
export const SetupPlugin = new Elysia()
	.as('global')
	.decorate('auth', {
		clientId: 0,
		clientRole: 'student',
		clientStatus: 'blocked',
	} as AuthType satisfies AuthType)
	.decorate('logger', { log })
	.state('reqInitiatedAt', 0)
	.state('authTiming', 0)
	.state('reqId', '')
	.guard({ as: 'scoped', response: { 500: appErrorSchema } });
export type SetupPluginContext = {
	auth: AuthType;
	store: { reqInitiatedAt: number; authTiming: number; reqId: string };
};
