import type { ClassSession } from './models';

export type CreateClassSessionParams = {
	classOfferingId: number;
	startsAt: Date;
	endsAt?: Date | null;
	topic?: string | null;
};

export type UpdateClassSessionParams = {
	classSessionId: number;
	startsAt?: Date;
	endsAt?: Date | null;
	topic?: string | null;
};

export interface ScheduleCommandsRepository {
	createClassSession(
		params: CreateClassSessionParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	updateClassSession(
		params: UpdateClassSessionParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
}

export interface ScheduleCommandsServices {
	createClassSession(params: CreateClassSessionParams): Promise<ClassSession>;
	updateClassSession(params: UpdateClassSessionParams): Promise<ClassSession>;
}
