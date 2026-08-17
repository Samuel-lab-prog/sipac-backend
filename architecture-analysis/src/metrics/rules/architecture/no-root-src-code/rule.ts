import { red } from 'kleur/colors';
import type { DepcruiseResult } from '../../../Types';
import {
	divider,
	formatRuleSuccess,
	formatRuleViolation,
	isRootLevelSourceFile,
	padRight,
} from '../../../../utils/Utils';
import { ADR } from '../../../adr-labels';

type Violation = {
	module: string;
};

const ALLOWED_ROOT_FILES = ['src/Index.ts', 'src/Server.ts', 'src/config.ts'];

export function checkNoRootSourceCode(
	cruiseResult: DepcruiseResult,
): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const source = module.source;

		if (isRootLevelSourceFile(source) && !ALLOWED_ROOT_FILES.includes(source))
			violations.push({ module: source });
	}

	return violations;
}

export function printNoRootSourceCode(cruiseResult: DepcruiseResult): void {
	const violations = checkNoRootSourceCode(cruiseResult);

	if (violations.length === 0) {
		console.log(
			formatRuleSuccess(
				'No source files found at src root',
				ADR.noRootSourceCode,
			),
		);
		return;
	}

	console.log(
		formatRuleViolation(
			`${violations.length} source file(s) found at src root`,
			ADR.noRootSourceCode,
		),
	);

	console.log(padRight('MODULE', 60));
	console.log(divider('·'));

	for (const v of violations) console.log(red(padRight(v.module, 60)));
}
