import { SEED_PREFIX, type SeedDb } from '../config';

export async function seedCourse(db: SeedDb) {
	const department = await db.department.upsert({
		where: { code: `${SEED_PREFIX}INF` },
		update: {},
		create: {
			campusId: 1,
			code: `${SEED_PREFIX}INF`,
			name: 'Informática — demonstração AGIAS',
		},
	});
	const course = await db.course.upsert({
		where: { code: `${SEED_PREFIX}CURSO` },
		update: { departmentId: department.id },
		create: {
			code: `${SEED_PREFIX}CURSO`,
			name: 'Técnico em Informática — demonstração AGIAS',
			departmentId: department.id,
			level: 'Ensino Médio Integrado',
		},
	});
	return { department, course };
}
