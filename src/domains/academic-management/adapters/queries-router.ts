import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	professorProfileSchema,
	studentDashboardSchema,
	staffProfileSchema,
	studentProfileSchema,
} from '../ports/schemas';
import type { AcademicQueriesServices } from '../ports/queries';

export function createAcademicQueriesRouter(services: AcademicQueriesServices) {
	return new Elysia({ prefix: '/academic' })
		.use(authPlugin)
		.get(
			'/students/dashboard/me',
			({ auth }) => services.getStudentDashboardByUserId(auth.clientId),
			{
				response: {
					200: studentDashboardSchema,
					401: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get My Student Dashboard',
					tags: ['Academic Management'],
				},
			},
		)
		.get(
			'/students/profile/me',
			({ auth }) => services.getStudentProfileByUserId(auth.clientId),
			{
				response: {
					200: studentProfileSchema,
					401: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get My Student Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.get(
			'/professors/profile/me',
			({ auth }) => services.getProfessorProfileByUserId(auth.clientId),
			{
				response: {
					200: professorProfileSchema,
					401: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get My Professor Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.get(
			'/staff/profile/me',
			({ auth }) => services.getStaffProfileByUserId(auth.clientId),
			{
				response: {
					200: staffProfileSchema,
					401: appErrorSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get My Staff Profile',
					tags: ['Academic Management'],
				},
			},
		)
		.get(
			'/students/profile/:userId',
			({ params }) => services.getStudentProfileByUserId(Number(params.userId)),
			{
				response: {
					200: studentProfileSchema,
					404: appErrorSchema,
				},
				detail: {
					summary: 'Get Student Profile By User Id',
					tags: ['Academic Management'],
				},
			},
		);
}
