import type {
	AcademicCalendarEvent,
	AcademicCalendarEventType,
} from './models';

export type AcademicCalendarEventInput = {
	academicPeriodId: number;
	type: AcademicCalendarEventType;
	title: string;
	description?: string | null;
	startsAt: Date;
	endsAt?: Date | null;
	allDay?: boolean;
	isInstructionalDay?: boolean;
};

export type AcademicCalendarCommandsRepository = {
	createEvent(
		input: AcademicCalendarEventInput & { createdByUserId: number },
	): Promise<AcademicCalendarEvent>;
	updateEvent(
		id: number,
		input: AcademicCalendarEventInput,
	): Promise<AcademicCalendarEvent>;
	deleteEvent(id: number): Promise<AcademicCalendarEvent>;
};

export type AcademicCalendarCommandsServices =
	AcademicCalendarCommandsRepository;
