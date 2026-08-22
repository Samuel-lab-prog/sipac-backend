import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import type {
	DeleteClassSessionParams,
	ScheduleCommandsServices,
} from '../ports/commands';
import { classSessionSchema } from '../ports/schemas';

type DeleteClassSessionCommandsServices = Pick<
	ScheduleCommandsServices,
	'deleteClassSession'
>;

export function createDeleteClassSessionCommandsRouter(
	services: DeleteClassSessionCommandsServices,
) {
	return new Elysia({ prefix: '/schedule' }).use(authPlugin).delete(
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
			detail: {
				summary: 'Delete Class Session',
				tags: ['Schedule Management'],
			},
		},
	);
}
