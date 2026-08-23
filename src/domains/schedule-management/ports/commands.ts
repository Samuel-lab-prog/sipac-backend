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

export type DeleteClassSessionParams = {
	classSessionId: number;
	actorId: number;
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
	actorStatus: 'active' | 'pending' | 'blocked' | 'suspended';
};

export interface ScheduleCommandsRepository {
	createClassSession(
		params: CreateClassSessionParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	updateClassSession(
		params: UpdateClassSessionParams,
	): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	deleteClassSession(
		classSessionId: number,
	): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	selectClassSessionById(classSessionId: number): Promise<ClassSession | null>;
	selectClassSessionsByClassOfferingId(
		classOfferingId: number,
	): Promise<ClassSession[]>;
}

export interface ScheduleCommandsServices {
	createClassSession(params: CreateClassSessionParams): Promise<ClassSession>;
	updateClassSession(params: UpdateClassSessionParams): Promise<ClassSession>;
	deleteClassSession(params: DeleteClassSessionParams): Promise<ClassSession>;
}
