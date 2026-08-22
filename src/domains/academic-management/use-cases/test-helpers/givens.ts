import type {
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from '../../ports/models';
import type { AcademicQueriesRepository } from '../../ports/queries';
import {
	DEFAULT_PROFESSOR_PROFILE_ID,
	DEFAULT_PROFESSOR_REGISTRY_CODE,
	DEFAULT_PROFESSOR_TITLE,
	DEFAULT_PROFESSOR_WORKLOAD,
	DEFAULT_STAFF_PROFILE_ID,
	DEFAULT_STUDENT_ACADEMIC_ID,
	DEFAULT_STUDENT_ADMISSION_YEAR,
	DEFAULT_STUDENT_PROFILE_ID,
	DEFAULT_STUDENT_STATUS,
	DEFAULT_USER_ID,
} from './constants';

export type StudentProfileOverrides = Partial<StudentProfile>;
export type ProfessorProfileOverrides = Partial<ProfessorProfile>;
export type StaffProfileOverrides = Partial<StaffProfile>;

export function givenStudentProfile(
	queriesRepository: AcademicQueriesRepository,
	overrides: StudentProfileOverrides = {},
) {
	queriesRepository.selectStudentProfileByUserId = (userId) =>
		Promise.resolve(
			userId === DEFAULT_USER_ID
				? {
						id: DEFAULT_STUDENT_PROFILE_ID,
						userId,
						academicId: DEFAULT_STUDENT_ACADEMIC_ID,
						courseId: null,
						admissionYear: DEFAULT_STUDENT_ADMISSION_YEAR,
						status: DEFAULT_STUDENT_STATUS,
						...overrides,
					}
				: null,
		);
}

export function givenProfessorProfile(
	queriesRepository: AcademicQueriesRepository,
	overrides: ProfessorProfileOverrides = {},
) {
	queriesRepository.selectProfessorProfileByUserId = (userId) =>
		Promise.resolve(
			userId === DEFAULT_USER_ID
				? {
						id: DEFAULT_PROFESSOR_PROFILE_ID,
						userId,
						registryCode: DEFAULT_PROFESSOR_REGISTRY_CODE,
						departmentId: null,
						title: DEFAULT_PROFESSOR_TITLE,
						workload: DEFAULT_PROFESSOR_WORKLOAD,
						...overrides,
					}
				: null,
		);
}

export function givenStaffProfile(
	queriesRepository: AcademicQueriesRepository,
	overrides: StaffProfileOverrides = {},
) {
	queriesRepository.selectStaffProfileByUserId = (userId) =>
		Promise.resolve(
			userId === DEFAULT_USER_ID
				? {
						id: DEFAULT_STAFF_PROFILE_ID,
						userId,
						departmentId: null,
						...overrides,
					}
				: null,
		);
}
