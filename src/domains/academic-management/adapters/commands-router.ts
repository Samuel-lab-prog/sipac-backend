import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	createProfessorProfileSchema,
	createStaffProfileSchema,
	createStudentProfileSchema,
	professorProfileSchema,
	staffProfileSchema,
	studentProfileSchema,
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
		);
}
