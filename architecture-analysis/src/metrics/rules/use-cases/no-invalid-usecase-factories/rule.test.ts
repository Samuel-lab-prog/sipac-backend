import { describe, expect, it } from 'bun:test';
import { withMockedReadFile } from '../../test-helpers/fs-mocks';
import { checkInvalidUseCaseFactories } from './rule';

describe('ARCHITECTURE-RULE - No Invalid Usecase Factories', () => {
	const cloc = {
		header: '',
		SUM: '',
		'src/domains/poems-management/use-cases/commands/create-poem/execute.ts': {
			code: 10,
		},
	} as const;

	it('ARCHITECTURE-RULE accepts a well-formed factory', () => {
		withMockedReadFile(
			'export const createPoemFactory = (deps: Dependencies) => deps;',
			() => {
				expect(checkInvalidUseCaseFactories(cloc as never)).toEqual([]);
			},
		);
	});

	it('ARCHITECTURE-RULE reports default exports, bad names and wrong arity', () => {
		withMockedReadFile(
			'export default function createPoem(deps: Dependencies, extra: unknown) { return deps; }',
			() => {
				expect(checkInvalidUseCaseFactories(cloc as never)).toEqual([
					{
						file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
						rule: 'default export',
						details: 'Use-case factories must use named exports.',
					},
					{
						file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
						rule: 'factory name',
						details: 'Expected a name ending with Factory, found createPoem.',
					},
					{
						file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
						rule: 'parameter count',
						details: 'Expected exactly one dependency parameter, found 2.',
					},
				]);
			},
		);
	});

	it('ARCHITECTURE-RULE reports a wrong dependency type', () => {
		withMockedReadFile(
			'export const createPoemFactory = (deps: Dependency) => deps;',
			() => {
				expect(checkInvalidUseCaseFactories(cloc as never)).toEqual([
					{
						file: 'src/domains/poems-management/use-cases/commands/create-poem/execute.ts',
						rule: 'dependency type',
						details:
							'Dependency parameter must use a type whose name ends with Dependencies.',
					},
				]);
			},
		);
	});
});
