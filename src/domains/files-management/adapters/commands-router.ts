import { Elysia } from 'elysia';

export function createFilesCommandsRouter() {
	return new Elysia({ prefix: '/files' });
}
