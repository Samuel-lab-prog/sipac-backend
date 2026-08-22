import { Elysia } from 'elysia';

export const filesCommandsRouter = new Elysia({ prefix: '/files' });
export const filesQueriesRouter = new Elysia({ prefix: '/files' });
