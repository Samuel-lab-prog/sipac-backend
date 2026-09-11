export type StudentProfile = {
	id: number;
	userId: number;
	academicId: string;
	courseId: number | null;
	admissionYear: number | null;
	status: string;
	birthDate?: Date | null;
	gender?: string | null;
	genderIdentity?: string | null;
	sexualOrientation?: string | null;
	race?: string | null;
	nationality?: string | null;
	birthplace?: string | null;
	birthCountry?: string | null;
	maritalStatus?: string | null;
	bloodType?: string | null;
	disability?: string | null;
	fatherName?: string | null;
	motherName?: string | null;
	rgIssueDate?: Date | null;
	rgIssuer?: string | null;
	rgState?: string | null;
	electoralTitle?: string | null;
	electoralZone?: string | null;
	electoralSection?: string | null;
	militaryCertificate?: string | null;
	documentSeries?: string | null;
	postalCode?: string | null;
	street?: string | null;
	addressNumber?: string | null;
	addressComplement?: string | null;
	neighborhood?: string | null;
	state?: string | null;
	city?: string | null;
	phone?: string | null;
	mobilePhone?: string | null;
	familyIncomeRange?: string | null;
};

export type ProfessorProfile = {
	id: number;
	userId: number;
	registryCode: string | null;
	departmentId: number | null;
	title: string | null;
	workload: number | null;
};

export type StaffProfile = {
	id: number;
	userId: number;
	departmentId: number | null;
};

export type AcademicPeriod = {
	id: number;
	code: string;
	year: number;
	term: number;
	startsAt: Date;
	endsAt: Date;
};

export type ClassOffering = {
	id: number;
	courseId: number;
	academicPeriodId: number;
	shift: 'morning' | 'afternoon' | 'evening' | 'integral';
	term: string;
	year: number;
	code: string;
	title: string;
};
import type { FamilyIncomeRange } from '../../../generic-subdomains/persistance/prisma/generated/client';
