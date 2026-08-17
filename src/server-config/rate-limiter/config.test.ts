import { describe, it, expect, afterEach, mock } from 'bun:test';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
	if (value === undefined) {
		delete process.env.NODE_ENV;
		return;
	}
	process.env.NODE_ENV = value;
}

type RateLimiterMockVars = {
	HAS_TRUSTED_PROXY_IPS: string[] | boolean;
	RATE_LIMIT_MAX: number;
	RATE_LIMIT_DURATION_MS: number;
	RATE_LIMIT_HEADERS: boolean;
	RATE_LIMIT_CONTEXT_SIZE: number;
	RATE_LIMIT_ERROR_JSON: boolean;
	RATE_LIMIT_SKIP_PATHS: string[];
	AUTH_RATE_LIMIT_MAX: number;
	AUTH_RATE_LIMIT_DURATION_MS: number;
	TRUST_PROXY: boolean;
};

const baseRateLimiterVars: RateLimiterMockVars = {
	HAS_TRUSTED_PROXY_IPS: [],
	RATE_LIMIT_MAX: 1000,
	RATE_LIMIT_DURATION_MS: 60_000,
	RATE_LIMIT_HEADERS: true,
	RATE_LIMIT_CONTEXT_SIZE: 100,
	RATE_LIMIT_ERROR_JSON: true,
	RATE_LIMIT_SKIP_PATHS: ['/health', '/metrics'],
	AUTH_RATE_LIMIT_MAX: 20,
	AUTH_RATE_LIMIT_DURATION_MS: 60_000,
	TRUST_PROXY: false,
};

async function loadRateLimiterConfig(options: {
	variables?: Partial<RateLimiterMockVars>;
	nodeEnv?: string;
}) {
	setNodeEnv(options.nodeEnv);
	await mock.module('./variables', () => ({
		...baseRateLimiterVars,
		...options.variables,
	}));
	return import(`./config.ts?test=${Date.now()}-${Math.random()}`);
}

afterEach(() => {
	mock.restore();
	setNodeEnv(ORIGINAL_NODE_ENV);
});

describe('UNIT - Server Config', () => {
	describe('Rate Limiter', () => {
		it('Uses forwarded client IP when the proxy is trusted', async () => {
			const { RATE_LIMIT_SETTINGS } = await loadRateLimiterConfig({
				variables: {
					TRUST_PROXY: true,
					HAS_TRUSTED_PROXY_IPS: ['10.0.0.1'],
				},
				nodeEnv: 'development',
			});

			const request = new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
			});
			const server = {
				requestIP: () => ({ address: '10.0.0.1' }),
			} as const;

			expect(RATE_LIMIT_SETTINGS.generator(request, server)).toBe('1.2.3.4');
		});

		it('Falls back to direct IP when the proxy is not trusted', async () => {
			const { RATE_LIMIT_SETTINGS } = await loadRateLimiterConfig({
				variables: {
					TRUST_PROXY: true,
					HAS_TRUSTED_PROXY_IPS: ['10.0.0.1'],
				},
				nodeEnv: 'development',
			});

			const request = new Request('http://localhost/test', {
				headers: { 'x-forwarded-for': '1.2.3.4' },
			});
			const server = {
				requestIP: () => ({ address: '10.0.0.2' }),
			} as const;

			expect(RATE_LIMIT_SETTINGS.generator(request, server)).toBe('10.0.0.2');
		});

		it('Skips rate limiting for OPTIONS and configured paths', async () => {
			const { RATE_LIMIT_SETTINGS } = await loadRateLimiterConfig({
				variables: { RATE_LIMIT_SKIP_PATHS: ['/health', '/metrics'] },
				nodeEnv: 'development',
			});

			const optionsRequest = new Request('http://localhost/test', {
				method: 'OPTIONS',
			});
			const healthRequest = new Request('http://localhost/health/status');
			const apiRequest = new Request('http://localhost/api/poems');

			expect(RATE_LIMIT_SETTINGS.skip(optionsRequest)).toBe(true);
			expect(RATE_LIMIT_SETTINGS.skip(healthRequest)).toBe(true);
			expect(RATE_LIMIT_SETTINGS.skip(apiRequest)).toBe(false);
		});

		it('Returns JSON error responses when configured', async () => {
			const { RATE_LIMIT_SETTINGS } = await loadRateLimiterConfig({
				variables: { RATE_LIMIT_ERROR_JSON: true },
				nodeEnv: 'development',
			});

			const response = RATE_LIMIT_SETTINGS.errorResponse;
			expect(response).toBeInstanceOf(Response);

			const body = await (response as Response).json();
			expect((response as Response).status).toBe(429);
			expect(body).toMatchObject({
				message: 'rate-limit reached',
				statusCode: 429,
				code: 'RATE_LIMIT_EXCEEDED',
				name: 'AppError',
			});
		});

		it('Returns a string error message when JSON errors are disabled', async () => {
			const { RATE_LIMIT_SETTINGS } = await loadRateLimiterConfig({
				variables: { RATE_LIMIT_ERROR_JSON: false },
				nodeEnv: 'development',
			});

			expect(RATE_LIMIT_SETTINGS.errorResponse).toBe('rate-limit reached');
		});
	});
});
