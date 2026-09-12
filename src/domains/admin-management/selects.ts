export const accountSelect = {
	id: true,
	name: true,
	email: true,
	nickname: true,
	role: true,
	status: true,
	createdAt: true,
	professorProfile: {
		select: {
			id: true,
			registryCode: true,
			title: true,
			workload: true,
			departmentId: true,
			department: { select: { name: true } },
			_count: { select: { teachingAssignments: true } },
		},
	},
	staffProfile: {
		select: {
			id: true,
			departmentId: true,
			department: { select: { name: true } },
		},
	},
	studentProfile: {
		select: { id: true, academicId: true, course: { select: { name: true } } },
	},
} as const;
