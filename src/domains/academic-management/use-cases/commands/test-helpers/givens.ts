import type { AcademicCommandsRepository } from '../../../ports/commands';
import type {
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from '../../../ports/models';
import {
	DEFAULT_COURSE_ID,
	DEFAULT_DEPARTMENT_ID,
	DEFAULT_PROFESSOR_REGISTRY_CODE,
	DEFAULT_PROFESSOR_TITLE,
	DEFAULT_PROFESSOR_WORKLOAD,
	DEFAULT_STUDENT_ACADEMIC_ID,
	DEFAULT_STUDENT_ADMISSION_YEAR,
	DEFAULT_STUDENT_STATUS,
	DEFAULT_USER_ID,
} from './constants';

export function givenStudentProfile(
	commandsRepository: AcademicCommandsRepository,
	overrides: Partial<StudentProfile> = {},
) {
	commandsRepository.insertStudentProfile = (params) =>
		Promise.resolve({
			ok: true,
			data: {
				id: DEFAULT_USER_ID,
				...params,
				userId: params.userId,
				academicId: DEFAULT_STUDENT_ACADEMIC_ID,
				courseId: DEFAULT_COURSE_ID,
				admissionYear: DEFAULT_STUDENT_ADMISSION_YEAR,
				status: DEFAULT_STUDENT_STATUS,
				...overrides,
			},
		});
}

export function givenLastStudentAcademicId(
	commandsRepository: AcademicCommandsRepository,
	academicId: string | null = DEFAULT_STUDENT_ACADEMIC_ID,
) {
	commandsRepository.selectLastStudentAcademicId = () =>
		Promise.resolve(academicId);
}

export function givenProfessorProfile(
	commandsRepository: AcademicCommandsRepository,
	overrides: Partial<ProfessorProfile> = {},
) {
	commandsRepository.createProfessorProfile = (params) =>
		Promise.resolve({
			ok: true,
			data: {
				id: DEFAULT_USER_ID,
				...params,
				userId: params.userId,
				registryCode: DEFAULT_PROFESSOR_REGISTRY_CODE,
				departmentId: DEFAULT_DEPARTMENT_ID,
				title: DEFAULT_PROFESSOR_TITLE,
				workload: DEFAULT_PROFESSOR_WORKLOAD,
				...overrides,
			},
		});
}

export function givenStaffProfile(
	commandsRepository: AcademicCommandsRepository,
	overrides: Partial<StaffProfile> = {},
) {
	commandsRepository.createStaffProfile = (params) =>
		Promise.resolve({
			ok: true,
			data: {
				id: DEFAULT_USER_ID,
				...params,
				userId: params.userId,
				departmentId: DEFAULT_DEPARTMENT_ID,
				...overrides,
			},
		});
}
