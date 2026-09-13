import { Elysia, t } from 'elysia';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import * as service from './service';
const params = t.Object({ id: t.String({ format: 'uuid' }) });
export const documentVerificationRouter = new Elysia({
	prefix: '/documents',
}).get(
	'/verify/:code',
	({ params, set }) => {
		set.headers['Cache-Control'] = 'no-store';
		return service.verify(params.code);
	},
	{ params: t.Object({ code: t.String({ pattern: '^[a-f0-9]{48}$' }) }) },
);
export const documentsRouter = new Elysia({ prefix: '/documents' })
	.use(authPlugin)
	.onAfterHandle(({ set }) => {
		set.headers['Cache-Control'] = 'private, no-store';
	})
	.get('/', ({ auth }) => service.list(auth))
	.get('/participations', ({ auth }) => service.options(auth))
	.post(
		'/',
		({ auth, body, set }) => {
			set.status = 201;
			return service.issue(auth, body);
		},
		{
			body: t.Object({
				kind: t.UnionEnum(['enrollment', 'affiliation', 'participation']),
				subjectUserId: t.Optional(t.Integer({ minimum: 1 })),
				academicPeriodId: t.Optional(t.Integer({ minimum: 1 })),
				participantId: t.Optional(t.Integer({ minimum: 1 })),
			}),
		},
	)
	.get(
		'/:id/pdf',
		async ({ auth, params }) =>
			new Response(await service.download(auth, params.id), {
				headers: {
					'Content-Type': 'application/pdf',
					'Content-Disposition': `attachment; filename="agias-${params.id}.pdf"`,
					'Cache-Control': 'private, no-store',
				},
			}),
		{ params },
	)
	.post(
		'/:id/revoke',
		({ auth, params, body }) => service.revoke(auth, params.id, body.reason),
		{
			params,
			body: t.Object({
				reason: t.String({ minLength: 5, maxLength: 2000, pattern: '\\S' }),
			}),
		},
	);
