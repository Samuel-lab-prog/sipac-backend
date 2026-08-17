import Elysia from 'elysia';
import { initRequestCache } from './requestCache';

/**
 * Elysia plugin that initializes a request-scoped cache.
 * This enables per-request memoization via withRequestCache.
 */
export const RequestCachePlugin = new Elysia().onRequest(() => {
	initRequestCache();
});
