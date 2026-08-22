import { Elysia } from 'elysia';

export function createScheduleQueriesRouter() {
	return new Elysia({ prefix: '/schedule' });
}
