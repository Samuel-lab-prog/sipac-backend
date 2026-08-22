import { appErrorSchema } from '@AppError';
import { NotFoundError } from '@DomainError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import {
	professorProfileSchema,
	staffProfileSchema,
	studentProfileSchema,
} from '../ports/schemas';
import type { AcademicQueriesServices } from '../ports/queries';

export function createAcademicQueriesRouter(services: AcademicQueriesServices) {
	return new Elysia({ prefix: '/academic' })
		.use(authPlugin)
		.get(
			'/students/profile/me',
			async ({ auth }) => {
				const profile = await services.getStudentProfileByUserId(auth.clientId);
				if (!profile) throw new NotFoundError('Student profile not found');
				return profile;
			},
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
			async ({ auth }) => {
				const profile = await services.getProfessorProfileByUserId(
					auth.clientId,
				);
				if (!profile) throw new NotFoundError('Professor profile not found');
				return profile;
			},
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
			async ({ auth }) => {
				const profile = await services.getStaffProfileByUserId(auth.clientId);
				if (!profile) throw new NotFoundError('Staff profile not found');
				return profile;
			},
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
			async ({ params }) => {
				const profile = await services.getStudentProfileByUserId(
					Number(params.userId),
				);
				if (!profile) throw new NotFoundError('Student profile not found');
				return profile;
			},
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
