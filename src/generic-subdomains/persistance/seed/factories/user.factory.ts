import { SCENARIOS, type ScenarioName, type SeedDb } from '../config';
import { seedRg } from '../utils/documents';

export async function seedStudent(
	db: SeedDb,
	scenario: ScenarioName,
	courseId: number,
	passwordHash: string,
) {
	const index = SCENARIOS.indexOf(scenario) + 1;
	const labels = {
		complete: 'Aluno completo',
		empty: 'Aluno sem aulas',
		semester: 'Aluno em dois períodos',
		exceptions: 'Aluno com dados incompletos',
		reference: 'Ana Luiza Costa',
	};
	const cpf = scenario === 'reference' ? '99010000001' : `9900000000${index}`;
	const data = {
		name: labels[scenario],
		nickname: `dev.agias.${scenario}`,
		rg: seedRg(cpf),
		cpf,
		role: 'student' as const,
		status: 'active' as const,
		passwordHash,
	};
	const user = await db.user.upsert({
		where: { email: `student.${scenario}@dev.agias.example` },
		update: data,
		create: { ...data, email: `student.${scenario}@dev.agias.example` },
	});
	const profile = await db.studentProfile.upsert({
		where: { userId: user.id },
		update: { courseId, status: 'active' },
		create: {
			userId: user.id,
			academicId: `DEVAGIAS2026${index}`,
			courseId,
			admissionYear: 2026,
			status: 'active',
		},
	});
	return { user, profile };
}

export async function seedProfessor(
	db: SeedDb,
	departmentId: number,
	passwordHash: string,
) {
	const data = {
		name: 'Helena Duarte (demonstração)',
		nickname: 'dev.agias.professor',
		rg: seedRg('99000000009'),
		cpf: '99000000009',
		role: 'professor' as const,
		passwordHash,
	};
	const user = await db.user.upsert({
		where: { email: 'professor@dev.agias.example' },
		create: { ...data, email: 'professor@dev.agias.example' },
		update: data,
	});
	return db.professorProfile.upsert({
		where: { userId: user.id },
		create: { userId: user.id, departmentId },
		update: { departmentId },
	});
}
