import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import {
	createAcademicActivityAttachmentUploadResponseSchema,
	createAcademicActivityAttachmentUploadSchema,
	createProfessorProfileSchema,
	createStaffProfileSchema,
	createStudentProfileSchema,
	linkProfessorToDepartmentSchema,
	linkStudentToCourseSchema,
	professorProfileSchema,
	staffProfileSchema,
	studentProfileSchema,
	unlinkProfessorFromDepartmentSchema,
	unlinkStudentFromCourseSchema,
	updateProfessorProfileSchema,
	updateStaffProfileSchema,
	updateStudentProfileSchema,
} from '../ports/schemas';
import type { AcademicCommandsServices } from '../ports/commands';

export function createAcademicCommandsRouter(
	services: AcademicCommandsServices,
) {
	return new Elysia({ prefix: '/academic' })
		.use(authPlugin)
		.post(
			'/students/profile',
			({ body, auth, set }) => {
				set.status = 201;
				return services.createStudentProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
					userId: auth.clientId,
				});
			},
			{
				body: createStudentProfileSchema,
				response: {
					201: studentProfileSchema,
					401: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Student Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.post(
			'/professors/profile',
			({ body, auth, set }) => {
				set.status = 201;
				return services.createProfessorProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
					userId: auth.clientId,
				});
			},
			{
				body: createProfessorProfileSchema,
				response: {
					201: professorProfileSchema,
					401: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Professor Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.post(
			'/staff/profile',
			({ body, auth, set }) => {
				set.status = 201;
				return services.createStaffProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
					userId: auth.clientId,
				});
			},
			{
				body: createStaffProfileSchema,
				response: {
					201: staffProfileSchema,
					401: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Staff Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/students/profile/me',
			({ body, auth }) =>
				services.updateStudentProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
					userId: auth.clientId,
				}),
			{
				body: updateStudentProfileSchema,
				response: {
					200: studentProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Update Student Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/professors/profile/me',
			({ body, auth }) =>
				services.updateProfessorProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: updateProfessorProfileSchema,
				response: {
					200: professorProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Update Professor Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/staff/profile/me',
			({ body, auth }) =>
				services.updateStaffProfile({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: updateStaffProfileSchema,
				response: {
					200: staffProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Update Staff Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/students/profile/me/course',
			({ body, auth }) =>
				services.linkStudentToCourse({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: linkStudentToCourseSchema,
				response: {
					200: studentProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Link Student to Course',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/professors/profile/me/department',
			({ body, auth }) =>
				services.linkProfessorToDepartment({
					...body,
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: linkProfessorToDepartmentSchema,
				response: {
					200: professorProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Link Professor to Department',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/students/profile/me/course/unlink',
			({ auth }) =>
				services.unlinkStudentFromCourse({
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: unlinkStudentFromCourseSchema,
				response: {
					200: studentProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Unlink Student from Course',
					tags: ['Academic Management'],
				},
			},
		)
		.put(
			'/professors/profile/me/department/unlink',
			({ auth }) =>
				services.unlinkProfessorFromDepartment({
					actorId: auth.clientId,
					actorRole: auth.clientRole,
					actorStatus: auth.clientStatus,
					targetUserId: auth.clientId,
				}),
			{
				body: unlinkProfessorFromDepartmentSchema,
				response: {
					200: professorProfileSchema,
					401: appErrorSchema,
					403: appErrorSchema,
					404: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Unlink Professor from Department',
					tags: ['Academic Management'],
				},
			},
		)
		.post(
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
				params: t.Object({
					activityId: t.Numeric(),
				}),
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
