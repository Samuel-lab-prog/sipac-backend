import type { SeedDb } from '../config';
import { referenceCohort } from '../catalogs/reference-cohort';
import { referenceSubjects } from '../catalogs/reference-subjects';
import { buildReferenceLessons } from '../utils/reference-blueprint';
import { seedPeriod } from '../factories/academic-period.factory';
import { seedOffering } from '../factories/class-offering.factory';
import {
	seedReferenceFaculty,
	seedReferenceManagement,
	seedReferenceStudents,
	type SeedPerson,
} from '../factories/reference-people.factory';
import { seedReferencePlan } from '../factories/reference-plan.factory';
import {
	seedReferenceLessons,
	seedReferenceAttendance,
} from '../factories/reference-lessons.factory';
import { seedReferenceActivities } from '../factories/reference-activities.factory';
import { seedReferenceCommunications } from '../factories/reference-communications.factory';

export async function seedReferenceScenario(
	db: SeedDb,
	courseId: number,
	passwordHash: string,
) {
	const period = await seedPeriod(db, referenceCohort.term);
	if (
		period.startsAt >
			new Date(`${referenceCohort.firstMonday}T07:30:00-03:00`) ||
		period.endsAt < new Date(`${referenceCohort.lastDay}T12:50:00-03:00`)
	)
		throw new Error(
			'The existing academic period does not contain the reference timetable. Its institutional dates were preserved.',
		);
	const students = await seedReferenceStudents(db, courseId, passwordHash);
	const { professors, departmentId } = await seedReferenceFaculty(
		db,
		passwordHash,
	);
	const management = await seedReferenceManagement(
		db,
		departmentId,
		passwordHash,
	);
	await seedReferenceCommunications(db, period.id, management[0]!.userId);
	await seedReferenceSubjects(db, {
		courseId,
		periodId: period.id,
		students,
		professors,
	});
	return {
		scenario: 'reference',
		cohort: referenceCohort.name,
		accounts: [
			...students.map((person) => ({
				role: 'student',
				name: person.name,
				email: person.email,
				cpf: person.cpf,
			})),
			...professors.map((person) => ({
				role: 'professor',
				name: person.name,
				email: person.email,
				cpf: person.cpf,
			})),
			...management.map(({ role, email, cpf }) => ({ role, email, cpf })),
		],
	};
}

async function seedReferenceSubjects(
	db: SeedDb,
	input: {
		courseId: number;
		periodId: number;
		students: SeedPerson[];
		professors: SeedPerson[];
	},
) {
	for (const [subjectIndex, subject] of referenceSubjects.entries()) {
		const professor = input.professors[subjectIndex]!;
		const offering = await seedOffering(db, {
			scenario: 'reference',
			term: 2,
			code: subject.code,
			title: subject.title,
			courseId: input.courseId,
			academicPeriodId: input.periodId,
			studentProfileId: input.students[0]!.profileId,
			professorProfileId: professor.profileId,
		});
		await enrollReferenceStudents(db, offering.id, input.students);
		const lessons = buildReferenceLessons(subjectIndex);
		const topics = await seedReferencePlan(db, offering.id, subject, lessons);
		const sessions = await seedReferenceLessons(db, {
			classOfferingId: offering.id,
			subject,
			topics,
			lessons,
		});
		await seedReferenceAttendance(db, {
			sessions,
			students: input.students,
			professorProfileId: professor.profileId,
			subjectIndex,
		});
		await seedReferenceActivities(db, {
			classOfferingId: offering.id,
			subject,
			subjectIndex,
			students: input.students,
			professor,
			topics,
			sessions,
		});
	}
}

async function enrollReferenceStudents(
	db: SeedDb,
	classOfferingId: number,
	students: SeedPerson[],
) {
	await db.enrollment.createMany({
		data: students.map((student) => ({
			classOfferingId,
			studentProfileId: student.profileId,
			status: 'active',
		})),
		skipDuplicates: true,
	});
	await db.enrollment.updateMany({
		where: {
			classOfferingId,
			studentProfileId: { in: students.map((student) => student.profileId) },
		},
		data: { status: 'active' },
	});
}
