import { Elysia } from 'elysia';

export function createUsersPublicCommandsRouter() {
	return new Elysia({ prefix: '/users' });
}
