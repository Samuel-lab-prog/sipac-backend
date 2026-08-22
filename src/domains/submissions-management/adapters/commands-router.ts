import { Elysia } from 'elysia';

export function createSubmissionsCommandsRouter() {
	return new Elysia({ prefix: '/submissions' });
}
