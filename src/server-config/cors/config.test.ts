import { describe, it, expect, afterEach, mock } from 'bun:test';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
	if (value === undefined) {
		delete process.env.NODE_ENV;
		return;
	}
	process.env.NODE_ENV = value;
}

async function loadCorsConfig(options: {
	variables: { CORS_ORIGINS: string[]; HAS_CROSS_SITE_CORS: boolean };
	nodeEnv?: string;
}) {
	setNodeEnv(options.nodeEnv);
	await mock.module('./variables', () => options.variables);
	return import(`./config.ts?test=${Date.now()}-${Math.random()}`);
}

afterEach(() => {
	mock.restore();
	setNodeEnv(ORIGINAL_NODE_ENV);
});

describe('UNIT - Server Config', () => {
	describe('CORS', () => {
		it('Allows requests without an Origin header', async () => {
			const { corsConfig } = await loadCorsConfig({
				variables: { CORS_ORIGINS: [], HAS_CROSS_SITE_CORS: false },
				nodeEnv: 'production',
			});

			const request = new Request('http://localhost/test');
			expect(corsConfig.origin(request)).toBe(true);
		});

		it('Allows allowlisted origins and blocks others', async () => {
			const { corsConfig } = await loadCorsConfig({
				variables: {
					CORS_ORIGINS: ['https://a.com', 'https://b.com'],
					HAS_CROSS_SITE_CORS: true,
				},
				nodeEnv: 'production',
			});

			const allowed = new Request('http://localhost/test', {
				headers: { origin: 'https://a.com' },
			});
			const blocked = new Request('http://localhost/test', {
				headers: { origin: 'https://c.com' },
			});

			expect(corsConfig.origin(allowed)).toBe(true);
			expect(corsConfig.origin(blocked)).toBe(false);
		});

		it('Treats localhost and 127.0.0.1 as equivalent loopback origins', async () => {
			const { corsConfig } = await loadCorsConfig({
				variables: {
					CORS_ORIGINS: ['http://localhost:4173'],
					HAS_CROSS_SITE_CORS: true,
				},
				nodeEnv: 'production',
			});

			const request = new Request('http://localhost/test', {
				headers: { origin: 'http://127.0.0.1:4173' },
			});

			expect(corsConfig.origin(request)).toBe(true);
		});

		it('Blocks cross-site when no allowlist is configured in production', async () => {
			const { corsConfig } = await loadCorsConfig({
				variables: { CORS_ORIGINS: [], HAS_CROSS_SITE_CORS: false },
				nodeEnv: 'production',
			});

			const request = new Request('http://localhost/test', {
				headers: { origin: 'https://external.com' },
			});

			expect(corsConfig.origin(request)).toBe(false);
		});

		it('Reports cross-site capability via hasCrossSiteCors', async () => {
			const { hasCrossSiteCors } = await loadCorsConfig({
				variables: {
					CORS_ORIGINS: ['https://a.com'],
					HAS_CROSS_SITE_CORS: true,
				},
				nodeEnv: 'development',
			});

			expect(hasCrossSiteCors()).toBe(true);
		});
	});
});
