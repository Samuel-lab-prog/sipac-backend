import type { ClocResult, DepcruiseResult } from '../../Types';

type ClocEntry = {
	code: number;
	language?: string;
};

export function makeClocResult(entries: Record<string, ClocEntry>): ClocResult {
	const files = Object.entries(entries);
	const code = files.reduce((sum, [, file]) => sum + file.code, 0);

	return {
		header: {
			cloc_url: '',
			cloc_version: '',
			elapsed_seconds: 0,
			n_files: files.length,
			n_lines: 0,
			files_per_second: 0,
			lines_per_second: 0,
			report_file: '',
		},
		SUM: {
			blank: 0,
			comment: 0,
			code,
			nFiles: files.length,
		},
		...Object.fromEntries(
			files.map(([file, info]) => [
				file,
				{
					blank: 0,
					comment: 0,
					code: info.code,
					language: info.language ?? 'TypeScript',
				},
			]),
		),
	} as ClocResult;
}

type ModuleFixture = {
	source: string;
	dependencies?: Array<{
		resolved?: string;
		circular?: boolean;
		cycle?: Array<{ name: string }>;
	}>;
};

export function makeDepcruiseResult(
	modules: ModuleFixture[],
	violations: Array<{
		from: string;
		to: string;
		rule?: { name: string };
		cycle?: Array<{ name: string }>;
	}> = [],
): DepcruiseResult {
	return {
		modules: modules.map((module) => ({
			source: module.source,
			dependencies: module.dependencies,
		})),
		summary: {
			violations,
		},
	} as unknown as DepcruiseResult;
}
