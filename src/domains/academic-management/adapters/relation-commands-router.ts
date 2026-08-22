import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import type {
	LinkProfessorToDepartmentParams,
	LinkStudentToCourseParams,
	UnlinkProfessorFromDepartmentParams,
	UnlinkStudentFromCourseParams,
} from '../ports/commands';
import type { ProfessorProfile, StudentProfile } from '../ports/models';
import {
	linkProfessorToDepartmentSchema,
	linkStudentToCourseSchema,
	professorProfileSchema,
	studentProfileSchema,
	unlinkProfessorFromDepartmentSchema,
	unlinkStudentFromCourseSchema,
} from '../ports/schemas';

type AcademicRelationCommandsServices = {
	linkStudentToCourse(
		params: LinkStudentToCourseParams,
	): Promise<StudentProfile>;
	linkProfessorToDepartment(
		params: LinkProfessorToDepartmentParams,
	): Promise<ProfessorProfile>;
	unlinkStudentFromCourse(
		params: UnlinkStudentFromCourseParams,
	): Promise<StudentProfile>;
	unlinkProfessorFromDepartment(
		params: UnlinkProfessorFromDepartmentParams,
	): Promise<ProfessorProfile>;
};

export function createAcademicRelationCommandsRouter(
	services: AcademicRelationCommandsServices,
) {
	return new Elysia({ prefix: '/academic' })
		.use(authPlugin)
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
		);
}
