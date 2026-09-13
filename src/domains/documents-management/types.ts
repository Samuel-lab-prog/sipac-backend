export const titles = {
	enrollment: 'Atestado de matrícula',
	affiliation: 'Declaração de vínculo',
	participation: 'Certificado de participação em projeto',
};
export type IssueBody = {
	kind: keyof typeof titles;
	subjectUserId?: number;
	academicPeriodId?: number;
	participantId?: number;
};
