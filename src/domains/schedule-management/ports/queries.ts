import type { ClassSession } from './models';

export type ScheduleQueriesRepository = Record<string, never>;
export type ScheduleQueriesServices = {
	listClassSessionsByClassOfferingId(
		classOfferingId: number,
	): Promise<ClassSession[]>;
};
