import { appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
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
