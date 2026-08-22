import { Elysia } from 'elysia';

export function createActivitiesQueriesRouter() {
	return new Elysia({ prefix: '/activities' });
}
