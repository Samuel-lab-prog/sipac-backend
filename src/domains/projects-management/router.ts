import { Elysia, t } from 'elysia';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import * as s from './schemas';
import * as service from './service';
export const projectsRouter = new Elysia({ prefix: '/projects' })
	.use(authPlugin)
	.get('/', ({ auth, query }) => service.list(auth, query), {
		query: s.listQuery,
	})
	.get('/candidates', ({ auth, query }) => service.candidates(auth, query.q), {
		query: t.Object({ q: t.String({ maxLength: 100 }) }),
	})
	.get(
		'/report',
		async ({ auth, query, set }) => {
			set.headers['Content-Type'] = 'text/csv; charset=utf-8';
			set.headers['Content-Disposition'] =
				'attachment; filename="agias-projetos.csv"';
			return '\uFEFF' + (await service.report(auth, query));
		},
		{ query: s.listQuery },
	)
	.get(
		'/departments',
		({ auth, query }) => service.departments(auth, query.scope),
		{
			query: s.scopeQuery,
		},
	)
	.get('/:id', ({ auth, params }) => service.detail(auth, params.id), {
		params: s.params,
	})
	.post(
		'/',
		({ auth, body, set }) => {
			set.status = 201;
			return service.create(auth, body);
		},
		{ body: s.projectBody },
	)
	.post(
		'/:id/participants',
		({ auth, params, body }) => service.addParticipant(auth, params.id, body),
		{ params: s.params, body: s.participantBody },
	)
	.post(
		'/:id/reports',
		({ auth, params, body }) => service.addReport(auth, params.id, body),
		{
			params: s.params,
			body: t.Object({ title: s.text(3, 200), body: s.text(10, 20000) }),
		},
	)
	.post(
		'/:id/reports/:reportId/approve',
		({ auth, params }) =>
			service.approveReport(auth, params.id, params.reportId),
		{ params: t.Object({ id: s.id, reportId: s.id }) },
	)
	.put(
		'/:id/participants/:participantId/hours',
		({ auth, params, body }) =>
			service.approveHours(auth, params.id, params.participantId, body.hours),
		{
			params: t.Object({ id: s.id, participantId: s.id }),
			body: t.Object({ hours: t.Integer({ minimum: 0, maximum: 10000 }) }),
		},
	)
	.post(
		'/:id/status',
		({ auth, params, body }) => service.transition(auth, params.id, body),
		{ params: s.params, body: s.transitionBody },
	);
