import type { SeedDb } from '../config';
import {
	referenceStudents,
	referenceAreas,
} from '../catalogs/reference-cohort';
import { referenceSubjects } from '../catalogs/reference-subjects';
import { seedStudent } from './user.factory';
import { seedRg } from '../utils/documents';

export type SeedPerson = {
	userId: number;
	profileId: number;
	index: number;
	name: string;
	email: string;
	cpf: string;
};

export async function seedReferenceStudents(
	db: SeedDb,
	courseId: number,
	passwordHash: string,
): Promise<SeedPerson[]> {
	const primary = await seedStudent(db, 'reference', courseId, passwordHash);
	const students = [
		{
			userId: primary.user.id,
			profileId: primary.profile.id,
			index: 0,
			name: primary.user.name,
			email: primary.user.email,
			cpf: primary.user.cpf,
		},
	];
	for (let index = 1; index < referenceStudents.length; index++) {
		const key = String(index + 1).padStart(2, '0');
		const email = `student.reference.${key}@dev.agias.example`;
		const cpf = `9901000${String(index + 1).padStart(4, '0')}`;
		const data = {
			campusId: 1,
			name: referenceStudents[index]!,
			email,
			nickname: `dev.agias.reference.${key}`,
			rg: seedRg(cpf),
			cpf,
			role: 'student' as const,
			status: 'active' as const,
			passwordHash,
		};
		const user = await db.user.upsert({
			where: { email },
			update: data,
			create: data,
		});
		const profileData = { courseId, admissionYear: 2023, status: 'active' };
		const profile = await db.studentProfile.upsert({
			where: { userId: user.id },
			update: profileData,
			create: {
				...profileData,
				userId: user.id,
				academicId: `DEVAGIASREF2026${key}`,
			},
		});
		students.push({
			userId: user.id,
			profileId: profile.id,
			index,
			name: user.name,
			email,
			cpf: user.cpf,
		});
	}
	await db.studentProfile.update({
		where: { id: primary.profile.id },
		data: { admissionYear: 2023 },
	});
	return students;
}

export async function seedReferenceFaculty(db: SeedDb, passwordHash: string) {
	const departments = new Map<string, number>();
	for (const [code, name] of Object.entries(referenceAreas)) {
		const department = await db.department.upsert({
			where: { code: `DEV-AGIAS-REF-${code}` },
			update: { name: `${name} — turma de referência AGIAS`, campusId: 1 },
			create: {
				campusId: 1,
				code: `DEV-AGIAS-REF-${code}`,
				name: `${name} — turma de referência AGIAS`,
			},
		});
		departments.set(code, department.id);
	}
	const professors: SeedPerson[] = [];
	for (const [index, subject] of referenceSubjects.entries()) {
		const email = `professor.reference.${subject.code.toLowerCase()}@dev.agias.example`;
		const cpf = `9902000${String(index + 1).padStart(4, '0')}`;
		const data = {
			campusId: 1,
			email,
			name: subject.professor,
			nickname: `dev.agias.prof.${subject.code.toLowerCase()}`,
			cpf,
			rg: seedRg(cpf),
			role: 'professor' as const,
			status: 'active' as const,
			passwordHash,
		};
		const user = await db.user.upsert({
			where: { email },
			update: data,
			create: data,
		});
		const profileData = {
			departmentId: departments.get(subject.area)!,
			registryCode: `DEVAGIASREFPROF${subject.code}`,
			title: 'Docente de demonstração',
			workload: 20,
		};
		const profile = await db.professorProfile.upsert({
			where: { userId: user.id },
			update: profileData,
			create: { ...profileData, userId: user.id },
		});
		professors.push({
			userId: user.id,
			profileId: profile.id,
			index,
			name: user.name,
			email,
			cpf: user.cpf,
		});
	}
	return { professors, departmentId: departments.get('INF')! };
}

export async function seedReferenceManagement(
	db: SeedDb,
	departmentId: number,
	passwordHash: string,
) {
	const accounts = [];
	for (const [index, role] of (['staff', 'admin'] as const).entries()) {
		const email = `${role}.reference@dev.agias.example`;
		const cpf = `9903000000${index + 1}`;
		const data = {
			campusId: 1,
			email,
			name:
				role === 'staff'
					? 'Marina Campos (Secretaria)'
					: 'Alex Moraes (Administração)',
			nickname: `dev.agias.reference.${role}`,
			cpf,
			rg: seedRg(cpf),
			role,
			status: 'active' as const,
			passwordHash,
		};
		const user = await db.user.upsert({
			where: { email },
			update: data,
			create: data,
		});
		if (role === 'staff')
			await db.staffProfile.upsert({
				where: { userId: user.id },
				update: { departmentId },
				create: { userId: user.id, departmentId },
			});
		accounts.push({ userId: user.id, role, email, cpf: user.cpf });
	}
	return accounts;
}
