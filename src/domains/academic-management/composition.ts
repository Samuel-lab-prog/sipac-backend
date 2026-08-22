import {
	commandsRepository,
	queriesRepository,
} from './infra/commands-repository/repository';
import { createAcademicCommandsRouter } from './adapters/commands-router';
import { createAcademicQueriesRouter } from './adapters/queries-router';
import { createProfessorProfileFactory } from './use-cases/commands/create-professor-profile/execute';
import { createStaffProfileFactory } from './use-cases/commands/create-staff-profile/execute';
import { createStudentProfileFactory } from './use-cases/commands/create-student-profile/execute';
import { getProfessorProfileByUserIdFactory } from './use-cases/queries/get-professor-profile-by-user-id/execute';
import { getStaffProfileByUserIdFactory } from './use-cases/queries/get-staff-profile-by-user-id/execute';
import { getStudentProfileByUserIdFactory } from './use-cases/queries/get-student-profile-by-user-id/execute';

const createStudentProfile = createStudentProfileFactory({
	commandsRepository,
});
const createProfessorProfile = createProfessorProfileFactory({
	commandsRepository,
});
const createStaffProfile = createStaffProfileFactory({
	commandsRepository,
});

const getStudentProfileByUserId = getStudentProfileByUserIdFactory({
	queriesRepository,
});
const getProfessorProfileByUserId = getProfessorProfileByUserIdFactory({
	queriesRepository,
});
const getStaffProfileByUserId = getStaffProfileByUserIdFactory({
	queriesRepository,
});

export const academicCommandsRouter = createAcademicCommandsRouter({
	createStudentProfile,
	createProfessorProfile,
	createStaffProfile,
});

export const academicQueriesRouter = createAcademicQueriesRouter({
	getStudentProfileByUserId,
	getProfessorProfileByUserId,
	getStaffProfileByUserId,
});
