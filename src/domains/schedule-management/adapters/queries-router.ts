import { Elysia, t } from 'elysia';
import { appErrorSchema } from '@AppError';
import type { ScheduleQueriesServices } from '../ports/queries';
import { classSessionSchema } from '../ports/schemas';

export function createScheduleQueriesRouter(services: ScheduleQueriesServices) {
	return new Elysia({ prefix: '/schedule' }).get(
		'/class-offerings/:classOfferingId/sessions',
		({ params }) =>
			services.listClassSessionsByClassOfferingId(
				Number(params.classOfferingId),
			),
		{
			params: t.Object({ classOfferingId: t.Numeric() }),
			response: {
				200: t.Array(classSessionSchema),
				404: appErrorSchema,
			},
		},
	);
}
