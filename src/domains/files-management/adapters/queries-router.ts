import { Elysia } from 'elysia';

export function createFilesQueriesRouter() {
	return new Elysia({ prefix: '/files' });
}
