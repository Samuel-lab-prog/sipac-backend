import type { ScenarioName, SeedDb } from '../config';
import { subjects } from '../catalogs/courses';
import { seedStudent } from '../factories/user.factory';
import { seedPeriod } from '../factories/academic-period.factory';
import { seedOffering } from '../factories/class-offering.factory';
import { seedPlan } from '../factories/plan.factory';
import { seedLessons } from '../factories/lesson.factory';
import { seedActivities } from '../factories/activity.factory';

export async function seedScenario(
	db: SeedDb,
	scenario: ScenarioName,
	courseId: number,
	professorProfileId: number,
	passwordHash: string,
) {
	const student = await seedStudent(db, scenario, courseId, passwordHash);
	if (scenario === 'empty')
		return { scenario, email: student.user.email, cpf: student.user.cpf };
	const terms =
		scenario === 'semester' ? [1, 2] : scenario === 'exceptions' ? [1] : [2];
	for (const term of terms) {
		const period = await seedPeriod(db, term);
		const catalog = scenario === 'exceptions' ? subjects.slice(0, 2) : subjects;
		for (const [index, subject] of catalog.entries()) {
			const incomplete = scenario === 'exceptions';
			const offering = await seedOffering(db, {
				scenario,
				term,
				code: subject.code,
				title: subject.title,
				courseId,
				academicPeriodId: period.id,
				studentProfileId: student.profile.id,
				professorProfileId: incomplete ? undefined : professorProfileId,
			});
			const topics =
				incomplete && index === 0
					? []
					: await seedPlan(db, offering.id, subject.topics, incomplete);
			const sessions = await seedLessons(db, offering.id, topics, {
				term,
				incomplete,
				weekdayOffset: index,
			});
			await seedActivities(db, {
				classOfferingId: offering.id,
				studentProfileId: student.profile.id,
				topic: topics[0],
				classSessionId: sessions[0]?.id,
				incomplete,
				term,
			});
		}
	}
	return { scenario, email: student.user.email, cpf: student.user.cpf };
}
