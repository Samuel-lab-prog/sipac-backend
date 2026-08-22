import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia } from 'elysia';
import type {
	CreateProfessorProfileUseCaseParams,
	CreateStaffProfileUseCaseParams,
	CreateStudentProfileUseCaseParams,
	UpdateProfessorProfileParams,
	UpdateStaffProfileParams,
	UpdateStudentProfileParams,
} from '../ports/commands';
import type {
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from '../ports/models';
import {
	createProfessorProfileSchema,
	createStaffProfileSchema,
	createStudentProfileSchema,
	professorProfileSchema,
	staffProfileSchema,
	studentProfileSchema,
	updateProfessorProfileSchema,
	updateStaffProfileSchema,
	updateStudentProfileSchema,
} from '../ports/schemas';

type AcademicProfileCommandsServices = {
	createStudentProfile(
		params: CreateStudentProfileUseCaseParams,
	): Promise<StudentProfile>;
	createProfessorProfile(
		params: CreateProfessorProfileUseCaseParams,
	): Promise<ProfessorProfile>;
	createStaffProfile(
		params: CreateStaffProfileUseCaseParams,
	): Promise<StaffProfile>;
	updateStudentProfile(
		params: UpdateStudentProfileParams,
	): Promise<StudentProfile>;
	updateProfessorProfile(
		params: UpdateProfessorProfileParams,
	): Promise<ProfessorProfile>;
	updateStaffProfile(params: UpdateStaffProfileParams): Promise<StaffProfile>;
};

export function createAcademicProfileCommandsRouter(
	services: AcademicProfileCommandsServices,
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
		);
}
