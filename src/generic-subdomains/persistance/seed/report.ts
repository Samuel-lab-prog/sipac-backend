import { SEED_PREFIX, type ScenarioName, type SeedDb } from './config';

export async function seedReport(db: SeedDb, scenarios: ScenarioName[]) {
	const referenceProjectPrefix = `[${SEED_PREFIX}REFERENCE]`;
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
		institutions,
		campuses,
		projects,
		projectParticipants,
		projectReports,
		issuedDocuments,
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
		db.institution.count({ where: { id: 1, acronym: 'IFRS' } }),
		db.campus.count({ where: { id: 1, institutionId: 1 } }),
		db.institutionalProject.count({
			where: { title: { startsWith: referenceProjectPrefix } },
		}),
		db.projectParticipant.count({
			where: { project: { title: { startsWith: referenceProjectPrefix } } },
		}),
		db.projectReport.count({
			where: { project: { title: { startsWith: referenceProjectPrefix } } },
		}),
		db.issuedDocument.count({
			where: { verificationCode: { in: ['a'.repeat(48), 'b'.repeat(48)] } },
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
		institutions,
		campuses,
		projects,
		projectParticipants,
		projectReports,
		issuedDocuments,
	};
}
