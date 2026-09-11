import type { CoursePlanSelect } from '../../../../generic-subdomains/persistance/prisma/generated/models/CoursePlan';

// Keep the student read model independent of persistence metadata and write-only fields.
export const studentDashboardPlanSelect = {
	id: true,
	syllabus: true,
	status: true,
	generalObjectives: true,
	methodology: true,
	assessmentCriteria: true,
	workloadMinutes: true,
	units: {
		orderBy: { position: 'asc' },
		select: {
			id: true,
			title: true,
			description: true,
			position: true,
			topics: {
				orderBy: { position: 'asc' },
				select: {
					id: true,
					title: true,
					description: true,
					position: true,
					type: true,
				},
			},
		},
	},
} as const satisfies CoursePlanSelect;
