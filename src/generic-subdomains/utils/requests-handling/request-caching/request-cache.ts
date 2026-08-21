import { AsyncLocalStorage } from 'node:async_hooks';

type RequestCacheStore = { cache: Map<string, unknown> };
const requestCacheStorage = new AsyncLocalStorage<RequestCacheStore>();
export function initRequestCache(): void {
	requestCacheStorage.enterWith({ cache: new Map() });
}
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
