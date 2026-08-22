import type { ProfessorProfile, StaffProfile, StudentProfile } from './models';

export interface AcademicQueriesRepository {
	selectStudentProfileByUserId(userId: number): Promise<StudentProfile | null>;
	selectProfessorProfileByUserId(
		userId: number,
	): Promise<ProfessorProfile | null>;
	selectStaffProfileByUserId(userId: number): Promise<StaffProfile | null>;
}

export interface AcademicQueriesServices {
	getStudentProfileByUserId(userId: number): Promise<StudentProfile | null>;
	getProfessorProfileByUserId(userId: number): Promise<ProfessorProfile | null>;
	getStaffProfileByUserId(userId: number): Promise<StaffProfile | null>;
}
