export type AcademicPeriod = {
	id: number;
	code: string;
	year: number;
	term: number;
	startsAt: Date;
	endsAt: Date;
};

export type ClassOffering = {
	id: number;
	courseId: number;
	academicPeriodId: number;
	shift: 'morning' | 'afternoon' | 'evening' | 'integral';
	term: string;
	year: number;
	code: string;
	title: string;
};
