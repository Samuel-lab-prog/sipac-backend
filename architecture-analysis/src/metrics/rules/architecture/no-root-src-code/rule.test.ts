import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkNoRootSourceCode } from './rule';

describe('ARCHITECTURE-RULE - No Root Src Code', () => {
	it('ARCHITECTURE-RULE flags files directly under src', () => {
		const cruiseResult = makeDepcruiseResult([
			{ source: 'src/feature.ts' },
			{ source: 'src/Index.ts' },
			{ source: 'src/domains/poems-management/index.ts' },
		]);

		expect(checkNoRootSourceCode(cruiseResult)).toEqual([
			{ module: 'src/feature.ts' },
		]);
	});

	it('ARCHITECTURE-RULE allows the explicit bootstrap files', () => {
		const cruiseResult = makeDepcruiseResult([
			{ source: 'src/Index.ts' },
			{ source: 'src/Server.ts' },
			{ source: 'src/config.ts' },
		]);

		expect(checkNoRootSourceCode(cruiseResult)).toHaveLength(0);
	});
});
