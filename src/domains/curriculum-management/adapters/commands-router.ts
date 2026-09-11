import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { assertCanManageCurriculum } from '../use-cases/commands/policies';
import {
	academicPeriodSchema,
	classOfferingSchema,
	createAcademicPeriodSchema,
	createClassOfferingSchema,
} from '../ports/schemas';
import type {
	CreateAcademicPeriodParams,
	CreateClassOfferingParams,
	CurriculumCommandsServices,
} from '../ports/commands';

export function createCurriculumCommandsRouter(
	services: CurriculumCommandsServices,
) {
	return new Elysia({ prefix: '/curriculum' })
		.use(authPlugin)
		.onBeforeHandle(({ auth }) => assertCanManageCurriculum(auth))
		.post(
			'/academic-periods',
			({ body, set }) => {
				set.status = 201;
				return services.createAcademicPeriod(
					body as CreateAcademicPeriodParams,
				);
			},
			{
				body: createAcademicPeriodSchema,
				response: {
					201: academicPeriodSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Academic Period',
					tags: ['Curriculum Management'],
				},
			},
		)
		.post(
			'/class-offerings',
			({ body, set }) => {
				set.status = 201;
				return services.createClassOffering(body as CreateClassOfferingParams);
			},
			{
				body: createClassOfferingSchema,
				response: {
					201: classOfferingSchema,
					403: appErrorSchema,
					409: appErrorSchema,
					422: appErrorSchema,
				},
				detail: {
					summary: 'Create Class Offering',
					tags: ['Curriculum Management'],
				},
			},
		);
}
