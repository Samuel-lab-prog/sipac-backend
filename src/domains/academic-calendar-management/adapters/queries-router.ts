import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type { AcademicCalendarQueriesServices } from '../ports/queries';

const eventSchema = t.Object({
	id: t.Number(),
	academicPeriodId: t.Number(),
	type: t.Union([
		t.Literal('holiday'),
		t.Literal('academic_event'),
		t.Literal('instructional_saturday'),
		t.Literal('exam'),
		t.Literal('break'),
	]),
	title: t.String(),
	description: t.Nullable(t.String()),
	startsAt: t.Date(),
	endsAt: t.Nullable(t.Date()),
	allDay: t.Boolean(),
	isInstructionalDay: t.Boolean(),
});

export function createAcademicCalendarQueriesRouter(
	services: AcademicCalendarQueriesServices,
) {
	return new Elysia({ prefix: '/academic-calendar' }).use(authPlugin).get(
		'/students/me/events',
		({ auth, query }) =>
			services.listEventsForStudent({
				userId: auth.clientId,
				from: query.from ? new Date(query.from) : undefined,
				to: query.to ? new Date(query.to) : undefined,
			}),
		{
			query: t.Object({
				from: t.Optional(t.String()),
				to: t.Optional(t.String()),
			}),
			response: {
				200: t.Array(eventSchema),
				400: appErrorSchema,
				401: appErrorSchema,
			},
			detail: {
				summary: 'List My Academic Calendar Events',
				tags: ['Academic Calendar'],
			},
		},
	);
}
