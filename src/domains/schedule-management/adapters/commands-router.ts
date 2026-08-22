import { Elysia } from 'elysia';

export function createScheduleCommandsRouter() {
	return new Elysia({ prefix: '/schedule' });
}
