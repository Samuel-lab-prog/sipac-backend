import { Elysia } from 'elysia';

export function createSubmissionsQueriesRouter() {
	return new Elysia({ prefix: '/submissions' });
}
