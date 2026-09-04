import { prisma } from '@Prisma';
import type {
	AcademicCalendarCommandsRepository,
	AcademicCalendarEventInput,
} from '../../ports/commands';

const selectEvent = {
	id: true,
	academicPeriodId: true,
	type: true,
	title: true,
	description: true,
	startsAt: true,
	endsAt: true,
	allDay: true,
	isInstructionalDay: true,
} as const;

export function createEvent(
	input: AcademicCalendarEventInput & { createdByUserId: number },
) {
	return prisma.academicCalendarEvent.create({
		data: input,
		select: selectEvent,
	});
}
export function updateEvent(id: number, input: AcademicCalendarEventInput) {
	return prisma.academicCalendarEvent.update({
		where: { id },
		data: input,
		select: selectEvent,
	});
}
export function deleteEvent(id: number) {
	return prisma.academicCalendarEvent.delete({
		where: { id },
		select: selectEvent,
	});
}
export const commandsRepository: AcademicCalendarCommandsRepository = {
	createEvent,
	updateEvent,
	deleteEvent,
};
