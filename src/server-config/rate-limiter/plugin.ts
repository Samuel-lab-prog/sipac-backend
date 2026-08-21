import Elysia from 'elysia';
import { type RateLimitSettings } from './config';

type RateLimitEntry = {
	count: number;
	expiresAt: number;
};

type RateLimitResult =
	| {
			skipped: true;
	  }
	| {
			skipped: false;
			exceeded: boolean;
			remaining: number;
			resetSeconds: number;
	  };

type RateLimitHeadersTarget =
	| { set(name: string, value: string): void }
	| {
			[key: string]: string | number | undefined;
	  };

function applyRateLimitHeaders(
	target: RateLimitHeadersTarget,
	maxLimit: number,
	remaining: number,
	resetSeconds: number,
	withRetryAfter = false,
) {
	const setHeader =
		typeof (target as { set?: unknown }).set === 'function'
			? (name: string, value: string) =>
					(target as { set: (name: string, value: string) => void }).set(
						name,
						value,
					)
			: (name: string, value: string) => {
					(target as Record<string, string | number | undefined>)[name] = value;
				};

	setHeader('RateLimit-Limit', String(maxLimit));
	setHeader('RateLimit-Remaining', String(remaining));
	setHeader('RateLimit-Reset', String(resetSeconds));

	if (withRetryAfter) setHeader('Retry-After', String(resetSeconds));
}

function cloneRateLimitResponse(
	errorResponse: Response | string,
	maxLimit: number,
	remaining: number,
	resetSeconds: number,
) {
	if (errorResponse instanceof Response) {
		const response = errorResponse.clone();
		applyRateLimitHeaders(
			response.headers,
			maxLimit,
			remaining,
			resetSeconds,
			true,
		);
		return response;
	}

	return errorResponse;
}

function handleLimitExceeded(
	context: { request: Request; set: { status: number } },
	options: RateLimitSettings,
	result: Exclude<RateLimitResult, { skipped: true }>,
	countedRequests: WeakSet<Request>,
) {
	countedRequests.add(context.request);
	context.set.status = 429;
	return cloneRateLimitResponse(
		options.errorResponse,
		options.max,
		result.remaining,
		result.resetSeconds,
	);
}

// eslint-disable-next-line max-lines-per-function
export function createRateLimitPlugin(options: RateLimitSettings) {
	const store = new Map<string, RateLimitEntry>();
	const countedRequests = new WeakSet<Request>();

	const evictOldestEntry = () => {
		const oldestKey = store.keys().next().value as string | undefined;
		if (oldestKey !== undefined) store.delete(oldestKey);
	};

	const ensureEntry = (key: string, duration: number) => {
		const now = Date.now();
		const current = store.get(key);

		if (!current || current.expiresAt <= now) {
			return {
				count: 0,
				expiresAt: now + duration,
			};
		}

		return current;
	};

	const recordRequest = (
		request: Request,
		server: Parameters<RateLimitSettings['generator']>[1],
		context: { set: { headers: RateLimitHeadersTarget } },
	): RateLimitResult => {
		const clientKey = options.generator(request, server);

		if (options.skip(request, clientKey)) return { skipped: true };

		const entry = ensureEntry(clientKey, options.duration);
		entry.count += 1;
		store.set(clientKey, entry);

		if (store.size > options.contextSize) evictOldestEntry();

		const remaining = Math.max(options.max - entry.count, 0);
		const resetSeconds = Math.max(
			0,
			Math.ceil((entry.expiresAt - Date.now()) / 1000),
		);

		applyRateLimitHeaders(
			context.set.headers,
			options.max,
			remaining,
			resetSeconds,
		);

		return {
			skipped: false,
			exceeded: entry.count > options.max,
			remaining,
			resetSeconds,
		};
	};

	const decrementRequest = (
		request: Request,
		server: Parameters<RateLimitSettings['generator']>[1],
	) => {
		const clientKey = options.generator(request, server);
		if (options.skip(request, clientKey)) return;

		const entry = store.get(clientKey);
		if (!entry) return;

		entry.count = Math.max(0, entry.count - 1);
		store.set(clientKey, entry);
	};

	return new Elysia()
		.onBeforeHandle((context) => {
			const result = recordRequest(context.request, context.server, {
				set: { headers: context.set.headers as RateLimitHeadersTarget },
			});
			if (result.skipped || !result.exceeded) return;

			return handleLimitExceeded(
				{
					request: context.request,
					set: { status: Number(context.set.status ?? 0) },
				},
				options,
				result,
				countedRequests,
			);
		})
		.onError((context) => {
			if (context.code === 'NOT_FOUND' || context.set.status === 404) {
				if (countedRequests.has(context.request)) return;

				const result = recordRequest(context.request, context.server, {
					set: { headers: context.set.headers as RateLimitHeadersTarget },
				});
				if (result.skipped || !result.exceeded) return;

				return handleLimitExceeded(
					{
						request: context.request,
						set: { status: Number(context.set.status ?? 0) },
					},
					options,
					result,
					countedRequests,
				);
			}

			if (!options.countFailedRequest && countedRequests.has(context.request)) {
				decrementRequest(context.request, context.server);
			}
		});
}
