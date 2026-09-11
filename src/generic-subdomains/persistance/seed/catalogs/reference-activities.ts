import type { ReferenceSubject } from './reference-subjects';

/** Published tasks intentionally cover overdue, upcoming, open-ended and assessment states. */
export function referenceActivities(subject: ReferenceSubject) {
	return [
		{
			key: 'diagnostic',
			title: `Diagnóstico: ${subject.topics[0]}`,
			kind: 'activity' as const,
			sessionIndex: 1,
			dueAt: '2026-08-21T23:59:00-03:00',
			allowLateSubmissions: true,
		},
		{
			key: 'practice',
			title: `Prática orientada: ${subject.topics[1]}`,
			kind: 'activity' as const,
			sessionIndex: 4,
			dueAt: '2026-09-04T23:59:00-03:00',
			allowLateSubmissions: true,
		},
		{
			key: 'project',
			title: subject.project,
			kind: 'activity' as const,
			sessionIndex: 4,
			dueAt: '2026-09-18T23:59:00-03:00',
			allowLateSubmissions: false,
		},
		{
			key: 'portfolio',
			title: `Portfólio de aprendizagem — ${subject.title}`,
			kind: 'activity' as const,
			sessionIndex: 0,
			dueAt: null,
			allowLateSubmissions: true,
		},
		{
			key: 'partial',
			title: `Avaliação parcial — ${subject.title}`,
			kind: 'assessment' as const,
			sessionIndex: 2,
			dueAt: null,
			allowLateSubmissions: false,
		},
		{
			key: 'final',
			title: `Apresentação final — ${subject.title}`,
			kind: 'assessment' as const,
			sessionIndex: -1,
			dueAt: null,
			allowLateSubmissions: false,
		},
	];
}

export type ReferenceActivity = ReturnType<typeof referenceActivities>[number];
