import type { ICruiseResult } from 'dependency-cruiser';

export type DepcruiseResult = ICruiseResult;

type ClocFileData = {
	blank: number;
	comment: number;
	code: number;
	language: string;
};

export type ClocResult = {
	header: {
		cloc_url: string;
		cloc_version: string;
		elapsed_seconds: number;
		n_files: number;
		n_lines: number;
		files_per_second: number;
		lines_per_second: number;
		report_file: string;
	};
	SUM: {
		blank: number;
		comment: number;
		code: number;
		nFiles: number;
	};
} & Record<string, ClocFileData>;

export type DomainMetric = {
	domain: string;
	loc: number;
	files: number;
	percent: number;
	zScore: number;
};

export type DomainAggregate = {
	loc: number;
	files: number;
};
