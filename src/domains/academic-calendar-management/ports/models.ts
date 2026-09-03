export type AcademicCalendarEventType =
	| 'holiday'
	| 'academic_event'
	| 'instructional_saturday'
	| 'exam'
	| 'break';

export type AcademicCalendarEvent = {
	id: number;
	academicPeriodId: number;
	type: AcademicCalendarEventType;
	title: string;
	description: string | null;
	startsAt: Date;
	endsAt: Date | null;
	allDay: boolean;
	isInstructionalDay: boolean;
};
