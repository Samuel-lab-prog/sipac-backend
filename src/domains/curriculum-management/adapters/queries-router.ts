import { Elysia } from 'elysia';

export function createCurriculumQueriesRouter() {
	return new Elysia({ prefix: '/curriculum' });
}
