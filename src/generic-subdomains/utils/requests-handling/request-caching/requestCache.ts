import { AsyncLocalStorage } from 'node:async_hooks';

type RequestCacheStore = {
	cache: Map<string, unknown>;
};

/**
 * Request-scoped in-memory cache.
 * Uses AsyncLocalStorage to isolate cached values per incoming request.
 */
const requestCacheStorage = new AsyncLocalStorage<RequestCacheStore>();

/**
 * Initializes the cache store for the current request.
 * Should be called once at the beginning of each request lifecycle.
 */
export function initRequestCache(): void {
	requestCacheStorage.enterWith({ cache: new Map() });
}

/**
 * Returns a cached value for the given key within the current request.
 * If the key is missing, executes the loader, stores the result, and returns it.
 * If there is no request context, it simply runs the loader without caching.
 */
export async function withRequestCache<T>(
	key: string,
	loader: () => Promise<T>,
): Promise<T> {
	const store = requestCacheStorage.getStore();
	if (!store) return loader();

	if (store.cache.has(key)) return store.cache.get(key) as T;

	const value = await loader();
	store.cache.set(key, value);
	return value;
}
