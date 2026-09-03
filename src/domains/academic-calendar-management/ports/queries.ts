import type { AcademicCalendarEvent } from './models';

export type StudentAcademicCalendarParams = {
	userId: number;
	from?: Date;
	to?: Date;
};

export interface AcademicCalendarQueriesRepository {
	listEventsForStudent(
		params: StudentAcademicCalendarParams,
	): Promise<AcademicCalendarEvent[]>;
}

export type AcademicCalendarQueriesServices = {
	listEventsForStudent(
		params: StudentAcademicCalendarParams,
	): Promise<AcademicCalendarEvent[]>;
};
