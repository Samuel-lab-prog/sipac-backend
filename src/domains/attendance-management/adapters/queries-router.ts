import { Elysia } from 'elysia';

export function createAttendanceQueriesRouter() {
	return new Elysia({ prefix: '/attendance' });
}
