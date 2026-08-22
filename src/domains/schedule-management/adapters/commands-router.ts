import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type {
	CreateClassSessionParams,
	DeleteClassSessionParams,
	ScheduleCommandsServices,
	UpdateClassSessionParams,
} from '../ports/commands';
import {
	classSessionSchema,
	createClassSessionSchema,
	updateClassSessionSchema,
} from '../ports/schemas';

export function createScheduleCommandsRouter(
	services: ScheduleCommandsServices,
) {
	return new Elysia({ prefix: '/schedule' })
		.use(authPlugin)
		.post(
			'/class-sessions',
			({ body, auth, set }) => {
				set.status = 201;
				return services.createClassSession({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as CreateClassSessionParams);
			},
			{
				body: createClassSessionSchema,
				response: {
					201: classSessionSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
			},
		)
		.put(
			'/class-sessions/:classSessionId',
			({ params, body, auth }) =>
				services.updateClassSession({
					...body,
					classSessionId: Number(params.classSessionId),
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as UpdateClassSessionParams),
			{
				params: t.Object({ classSessionId: t.Numeric() }),
				body: updateClassSessionSchema,
				response: {
					200: classSessionSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
			},
		)
		.delete(
			'/class-sessions/:classSessionId',
			({ params, auth }) =>
				services.deleteClassSession({
					classSessionId: Number(params.classSessionId),
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
				} as DeleteClassSessionParams),
			{
				params: t.Object({ classSessionId: t.Numeric() }),
				response: {
					200: classSessionSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
				},
			},
		);
}
