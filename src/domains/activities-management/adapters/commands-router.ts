import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import { dateSchema, idSchema } from '@SharedKernel/schemas/schemas';
import {
	academicActivitySchema,
	academicActivitySubmissionSchema,
	createAcademicActivitySchema,
	createAcademicActivitySubmissionSchema,
	createAcademicActivitySubmissionCommentSchema,
	createAcademicActivitySubmissionUploadResponseSchema,
	createAcademicActivitySubmissionUploadSchema,
} from '../ports/schemas';
import type {
	ActivitiesCommandsServices,
	CreateAcademicActivityParams,
	CreateAcademicActivitySubmissionParams,
	CreateAcademicActivitySubmissionCommentParams,
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
			'/submissions/:submissionId/comments/me',
			({ params, body, auth, set }) => {
				set.status = 201;
				return services.createAcademicActivitySubmissionComment({
					submissionId: Number(params.submissionId),
					body: body.body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				} as CreateAcademicActivitySubmissionCommentParams);
			},
			{
				params: t.Object({ submissionId: t.Numeric() }),
				body: createAcademicActivitySubmissionCommentSchema,
				response: {
					201: t.Object({
						id: idSchema,
						submissionId: idSchema,
						authorUserId: idSchema,
						body: t.String(),
						createdAt: dateSchema,
						updatedAt: dateSchema,
					}),
					401: appErrorSchema,
					403: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Student Activity Submission Comment',
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
