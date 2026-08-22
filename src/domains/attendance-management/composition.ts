import { commandsRepository } from './infra/commands-repository/repository';
import { createAttendanceCommandsRouter } from './adapters/commands-router';
import { createAttendanceQueriesRouter } from './adapters/queries-router';
import { markAttendanceFactory } from './use-cases/commands/mark-attendance/execute';
import { markAttendanceBatchFactory } from './use-cases/commands/mark-attendance-batch/execute';

const markAttendance = markAttendanceFactory({
	commandsRepository,
});
const markAttendanceBatch = markAttendanceBatchFactory({
	commandsRepository,
});

export const attendanceCommandsRouter = createAttendanceCommandsRouter({
	markAttendance,
	markAttendanceBatch,
});

export const attendanceQueriesRouter = createAttendanceQueriesRouter();
