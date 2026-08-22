export type ClassSession = {
	id: number;
	classOfferingId: number;
	startsAt: Date;
	endsAt: Date | null;
	topic: string | null;
};
