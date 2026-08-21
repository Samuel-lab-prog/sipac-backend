import Elysia from 'elysia';
import { initRequestCache } from './request-cache';
export const RequestCachePlugin = new Elysia().onRequest(() => {
	initRequestCache();
});
