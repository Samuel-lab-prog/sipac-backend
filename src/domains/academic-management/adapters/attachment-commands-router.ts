import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import type { FileUploadUrlResult } from '@SharedKernel/ports/storage';
import { Elysia, t } from 'elysia';
import type { CreateAcademicActivityAttachmentUploadParams } from '../ports/commands';
import {
	createAcademicActivityAttachmentUploadResponseSchema,
	createAcademicActivityAttachmentUploadSchema,
} from '../ports/schemas';

type AcademicAttachmentCommandsServices = {
	createAcademicActivityAttachmentUploadUrl(
		params: CreateAcademicActivityAttachmentUploadParams,
	): Promise<FileUploadUrlResult>;
};

export function createAcademicAttachmentCommandsRouter(
	services: AcademicAttachmentCommandsServices,
) {
	return new Elysia({ prefix: '/academic' }).use(authPlugin).post(
		'/activities/:activityId/attachments/upload-url',
		({ params, body, auth }) =>
			services.createAcademicActivityAttachmentUploadUrl({
				activityId: Number(params.activityId),
				data: body,
				actorId: auth.clientId,
				actorRole: auth.clientRole,
				actorStatus: auth.clientStatus,
				targetUserId: auth.clientId,
			}),
		{
			params: t.Object({ activityId: t.Numeric() }),
			body: createAcademicActivityAttachmentUploadSchema,
			response: {
				200: createAcademicActivityAttachmentUploadResponseSchema,
				401: appErrorSchema,
				403: appErrorSchema,
				422: appErrorSchema,
			},
			detail: {
				summary: 'Create Academic Activity Attachment Upload URL',
				tags: ['Academic Management'],
			},
		},
	);
}
