/** Recurrence factory uses explicit Brazilian offsets; results never depend on the machine clock. */
export function weeklyDates(
	start: string,
	end: string,
	excludedDates: string[] = [],
) {
	const dates: Date[] = [];
	const last = new Date(end).getTime();
	for (
		let timestamp = new Date(start).getTime();
		timestamp <= last;
		timestamp += 7 * 24 * 60 * 60_000
	) {
		const cursor = new Date(timestamp);
		if (!excludedDates.includes(cursor.toISOString().slice(0, 10)))
			dates.push(new Date(cursor));
	}
	return dates;
}
