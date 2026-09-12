import { Elysia } from 'elysia';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { assertAdmin } from './access';
import * as queries from './queries';
import * as writes from './writes';
import * as schemas from './schemas';
import { permissions } from './permissions';

export const adminRouter = new Elysia({ prefix: '/admin' })
	.use(authPlugin)
	.onBeforeHandle(({ auth }) => assertAdmin(auth))
	.get('/overview', () => queries.overview())
	.get('/users', ({ query }) => queries.listUsers(query), {
		query: schemas.filters,
	})
	.get('/users/:id', ({ params }) => queries.detail(params.id), {
		params: schemas.params,
	})
	.get('/departments', () => queries.departments())
	.get('/unassigned-classes', () => queries.unassignedClasses())
	.get('/permissions', () => permissions)
	.post(
		'/team',
		({ auth, body, set }) => {
			set.status = 201;
			return writes.createTeam(auth, body);
		},
		{ body: schemas.teamBody },
	)
	.put(
		'/users/:id/profile',
		({ auth, params, body }) => writes.saveProfile(auth, params.id, body),
		{ params: schemas.params, body: schemas.profileBody },
	)
	.put(
		'/users/:id/access',
		({ auth, params, body }) => writes.saveAccess(auth, params.id, body),
		{ params: schemas.params, body: schemas.accessBody },
	);
