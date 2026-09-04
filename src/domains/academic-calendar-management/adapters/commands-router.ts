import { appErrorSchema } from '@AppError';
import { ForbiddenError } from '@DomainError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type { AcademicCalendarCommandsServices } from '../ports/commands';

const eventBody = t.Object({
	academicPeriodId: t.Numeric(),
	type: t.Union([
		t.Literal('holiday'),
		t.Literal('academic_event'),
		t.Literal('instructional_saturday'),
		t.Literal('exam'),
		t.Literal('break'),
	]),
	title: t.String({ minLength: 1 }),
	description: t.Optional(t.Nullable(t.String())),
	startsAt: t.String({ format: 'date-time' }),
	endsAt: t.Optional(t.Nullable(t.String({ format: 'date-time' }))),
	allDay: t.Optional(t.Boolean()),
	isInstructionalDay: t.Optional(t.Boolean()),
});

function assertCanManage(role: string) {
	if (role !== 'staff' && role !== 'admin')
		throw new ForbiddenError(
			'You are not allowed to manage academic calendar events',
		);
}

function toInput(body: typeof eventBody.static) {
	return {
		...body,
		startsAt: new Date(body.startsAt),
		endsAt: body.endsAt ? new Date(body.endsAt) : null,
	};
}

export function createAcademicCalendarCommandsRouter(
	services: AcademicCalendarCommandsServices,
) {
	return new Elysia({ prefix: '/academic-calendar' })
		.use(authPlugin)
		.post(
			'/events',
			({ body, auth, set }) => {
				assertCanManage(auth.clientRole);
				set.status = 201;
				return services.createEvent({
					...toInput(body),
					createdByUserId: auth.clientId,
				});
			},
			{
				body: eventBody,
				response: {
					201: t.Any(),
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
			},
		)
		.put(
			'/events/:eventId',
			({ body, params, auth }) => {
				assertCanManage(auth.clientRole);
				return services.updateEvent(Number(params.eventId), toInput(body));
			},
			{
				params: t.Object({ eventId: t.Numeric() }),
				body: eventBody,
				response: {
					200: t.Any(),
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					422: appErrorSchema,
				},
			},
		)
		.delete(
			'/events/:eventId',
			({ params, auth }) => {
				assertCanManage(auth.clientRole);
				return services.deleteEvent(Number(params.eventId));
			},
			{
				params: t.Object({ eventId: t.Numeric() }),
				response: {
					200: t.Any(),
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
			},
		);
}
