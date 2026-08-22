import { Elysia } from 'elysia';

export const scheduleCommandsRouter = new Elysia({ prefix: '/schedule' });
export const scheduleQueriesRouter = new Elysia({ prefix: '/schedule' });
