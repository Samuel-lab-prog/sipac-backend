import Elysia from 'elysia';
import { appErrorSchema } from '../error-handling/app-error/util.ts';
import { log } from '../logging/logger';
type UserRole = 'author' | 'moderator' | 'admin';
type UserStatus = 'active' | 'blocked' | 'suspended';
type AuthType = {
	clientId: number;
	clientRole: UserRole;
	clientStatus: UserStatus;
};
export const SetupPlugin = new Elysia()
	.as('global')
	.decorate('auth', {
		clientId: 0,
		clientRole: 'author',
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
