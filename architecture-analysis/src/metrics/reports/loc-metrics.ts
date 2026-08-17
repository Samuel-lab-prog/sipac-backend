import type { ClocResult } from '../Types';
import type { FanMetric } from './dependency-metrics';

export function buildLocMap(cloc: ClocResult): Map<string, number> {
	const map = new Map<string, number>();

	Object.entries(cloc).forEach(([file, info]) => {
		if ('code' in info && info.code) map.set(file, info.code);
	});

	return map;
}

export function attachLocToFanOut(
	fanOut: FanMetric[],
	locMap: Map<string, number>,
): FanMetric[] {
	return fanOut.map((m) => ({
		...m,
		loc: locMap.get(m.module) ?? 0,
	}));
}
