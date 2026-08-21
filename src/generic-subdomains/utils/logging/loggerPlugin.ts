import Elysia from 'elysia';
import { SetupPlugin } from '../security/setupPlugin';
import { log } from './logger';

/* ---------------------------------- */
/* Logger Plugin */
/* ---------------------------------- */

export const LoggerPlugin = new Elysia()
	.use(SetupPlugin)

	.onStart(() => {
		log.info({ scope: 'server.start' }, 'Server started');
	})

	.onRequest(({ store }) => {
		store.reqId = crypto.randomUUID();
		store.reqInitiatedAt = performance.now();
	})

	.onAfterResponse(
		{ as: 'scoped' },
		({ store, auth, request, set, responseValue }) => {
			if (request.url.includes('/docs')) return;

			const url = new URL(request.url);
			const path = url.pathname;
			const segments = path.split('/').filter(Boolean);

			const totalMs = Math.round(performance.now() - store.reqInitiatedAt);

			const authMs = store.authTiming || 0;

			log.info(
				{
					scope: 'request.completed',
					request: {
						reqId: store.reqId ?? 'unknown',
						method: request.method,
						path,
						segments,
						targetId: extractNumericSegment(segments),
					},
					response: {
						statusCode: set.status ?? 200,
						sizeBytes: getResponseSize(responseValue),
						contentType: set.headers['content-type'] ?? 'unknown',
					},
					auth: {
						isAuthenticated: auth.clientId > 0,
						userId: auth.clientId > 0 ? auth.clientId : 'guest',
						role: auth.clientId > 0 ? auth.clientRole : 'guest',
					},
					timings: {
						totalMs,
						authMs,
					},
				},
				'Request completed',
			);

			store.authTiming = 0;
		},
	);

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function extractNumericSegment(segments: string[]): number | undefined {
	const candidate = segments.at(-1);
	if (!candidate) return undefined;

	const parsed = Number(candidate);
	return Number.isInteger(parsed) ? parsed : undefined;
}

function getResponseSize(response: unknown): number {
	if (response === null || response === undefined) return 0;

	if (typeof response === 'string') {
		return Buffer.byteLength(response);
	}

	if (response instanceof Uint8Array) {
		return response.byteLength;
	}

	if (response instanceof Response) {
		const len = response.headers.get('content-length');
		return len ? Number(len) : 0;
	}

	try {
		return Buffer.byteLength(JSON.stringify(response));
	} catch {
		return 0;
	}
}
