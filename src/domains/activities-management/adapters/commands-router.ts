import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import {
	academicActivitySchema,
	academicActivitySubmissionSchema,
	createAcademicActivitySchema,
	createAcademicActivitySubmissionSchema,
	createAcademicActivitySubmissionUploadResponseSchema,
	createAcademicActivitySubmissionUploadSchema,
} from '../ports/schemas';
import type {
	ActivitiesCommandsServices,
	CreateAcademicActivityParams,
	CreateAcademicActivitySubmissionParams,
} from '../ports/commands';

export function createActivitiesCommandsRouter(
	services: ActivitiesCommandsServices,
) {
	return new Elysia({ prefix: '/activities' })
		.use(authPlugin)
		.post(
			'/:activityId/submissions/me/upload-url',
			({ params, body, auth }) =>
				services.createAcademicActivitySubmissionUploadUrl({
					activityId: Number(params.activityId),
					data: body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				params: t.Object({ activityId: t.Numeric() }),
				body: createAcademicActivitySubmissionUploadSchema,
				response: {
					200: createAcademicActivitySubmissionUploadResponseSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Student Activity Submission Upload URL',
					tags: ['Activities Management'],
				},
			},
		)
		.post(
			'/',
			({ body, auth, set }) => {
				set.status = 201;
				return services.createAcademicActivity({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as CreateAcademicActivityParams);
			},
			{
				body: createAcademicActivitySchema,
				response: {
					201: academicActivitySchema,
					401: appErrorSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Academic Activity',
					tags: ['Activities Management'],
				},
			},
		)
		.post(
			'/:activityId/submissions/me',
			({ params, body, auth, set }) => {
				set.status = 201;
				return services.createAcademicActivitySubmission({
					activityId: Number(params.activityId),
					studentProfileId: body.studentProfileId,
					submittedAt: body.submittedAt,
					attachments: body.attachments,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as CreateAcademicActivitySubmissionParams);
			},
			{
				params: t.Object({ activityId: t.Numeric() }),
				body: createAcademicActivitySubmissionSchema,
				response: {
					201: academicActivitySubmissionSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Academic Activity Submission',
					tags: ['Activities Management'],
				},
			},
		);
}
