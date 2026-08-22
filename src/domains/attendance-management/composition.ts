import { commandsRepository } from './infra/commands-repository/repository';
import { createAttendanceCommandsRouter } from './adapters/commands-router';
import { createDeleteAttendanceCommandsRouter } from './adapters/delete-attendance-commands-router';
import { createAttendanceQueriesRouter } from './adapters/queries-router';
import { deleteAttendanceFactory } from './use-cases/commands/delete-attendance/execute';
import { markAttendanceFactory } from './use-cases/commands/mark-attendance/execute';
import { markAttendanceBatchFactory } from './use-cases/commands/mark-attendance-batch/execute';

const markAttendance = markAttendanceFactory({
	commandsRepository,
});
const markAttendanceBatch = markAttendanceBatchFactory({
	commandsRepository,
});
const deleteAttendance = deleteAttendanceFactory({
	commandsRepository,
});

export const attendanceCommandsRouter = createAttendanceCommandsRouter({
	markAttendance,
	markAttendanceBatch,
});

export const attendanceDeleteCommandsRouter =
	createDeleteAttendanceCommandsRouter({
		deleteAttendance,
	});

export const attendanceQueriesRouter = createAttendanceQueriesRouter({
	listAttendanceByClassSessionId(classSessionId) {
		return commandsRepository.selectAttendanceByClassSessionId(classSessionId);
	},
	listAttendanceByStudentProfileId(studentProfileId) {
		return commandsRepository.selectAttendanceByStudentProfileId(
			studentProfileId,
		);
	},
});
