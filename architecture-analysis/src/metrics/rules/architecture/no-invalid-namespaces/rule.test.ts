import { describe, expect, it } from 'bun:test';
import { makeDepcruiseResult } from '../../test-helpers/fixtures';
import { checkInvalidRootNamespaces } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Namespaces', () => {
	it('ARCHITECTURE-RULE flags invalid root namespaces', () => {
		const cruiseResult = makeDepcruiseResult([
			{ source: 'src/domains/poems-management/index.ts' },
			{ source: 'src/legacy/feature.ts' },
			{ source: 'src/tests/integration/foo/test.ts' },
		]);

		expect(checkInvalidRootNamespaces(cruiseResult)).toEqual([
			{ module: 'src/legacy/feature.ts', rootNamespace: 'legacy' },
		]);
	});

	it('ARCHITECTURE-RULE allows the supported namespaces', () => {
		const cruiseResult = makeDepcruiseResult([
			{ source: 'src/domains/poems-management/index.ts' },
			{ source: 'src/generic-subdomains/persistance/index.ts' },
			{ source: 'src/server-config/bootstrap.ts' },
			{ source: 'src/shared-kernel/Enums.ts' },
			{ source: 'src/tests/integration/foo/test.ts' },
		]);

		expect(checkInvalidRootNamespaces(cruiseResult)).toHaveLength(0);
	});
});
