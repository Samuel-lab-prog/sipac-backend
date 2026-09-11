import { SEED_PREFIX, type ScenarioName, type SeedDb } from './config';

export async function seedReport(db: SeedDb, scenarios: ScenarioName[]) {
	const offering = {
		OR: scenarios.map((name) => ({
			code: { startsWith: `${SEED_PREFIX}${name.toUpperCase()}-` },
		})),
		course: { code: `${SEED_PREFIX}CURSO` },
	};
	const [
		classes,
		enrollments,
		lessons,
		plans,
		topics,
		activities,
		submissions,
		attendance,
		materials,
	] = await Promise.all([
		db.classOffering.count({ where: offering }),
		db.enrollment.count({ where: { classOffering: offering } }),
		db.classSession.count({ where: { classOffering: offering } }),
		db.coursePlan.count({ where: { classOffering: offering } }),
		db.coursePlanTopic.count({
			where: { unit: { coursePlan: { classOffering: offering } } },
		}),
		db.academicActivity.count({ where: { classOffering: offering } }),
		db.academicActivitySubmission.count({
			where: { activity: { classOffering: offering } },
		}),
		db.attendanceRecord.count({
			where: { classSession: { classOffering: offering } },
		}),
		db.classSessionMaterial.count({
			where: { classSession: { classOffering: offering } },
		}),
	]);
	return {
		classes,
		enrollments,
		lessons,
		plans,
		topics,
		activities,
		submissions,
		attendance,
		lessonMaterials: materials,
	};
}
