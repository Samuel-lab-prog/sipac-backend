import { describe, expect, it } from 'bun:test';
import {
	extractDomainFromPath,
	extractIntegrationTestDomainFromPath,
	extractRootNamespace,
	isAbstractFile,
	isGenericSubdomain,
	isRootLevelSourceFile,
	isTestFile,
} from './Utils';

describe('Utils', () => {
	it('normalizes paths across helpers', () => {
		expect(isAbstractFile('src\\domains\\users\\ports\\queries.ts')).toBe(true);
		expect(extractDomainFromPath('src\\domains\\users\\use-cases\\x.ts')).toBe(
			'users',
		);
		expect(extractRootNamespace('src\\generic-subdomains\\utils\\x.ts')).toBe(
			'generic-subdomains',
		);
		expect(isGenericSubdomain('src\\generic-subdomains\\utils\\x.ts')).toBe(
			true,
		);
		expect(isRootLevelSourceFile('src\\Server.ts')).toBe(true);
	});

	it('detects test files and integration domains', () => {
		expect(
			isTestFile('src/domains/users/use-cases/commands/a/execute.test.ts'),
		).toBe(true);
		expect(
			extractIntegrationTestDomainFromPath('tests/integration/users/setup.ts'),
		).toBe('users');
		expect(
			extractIntegrationTestDomainFromPath(
				'tests/integration/endpoints/setup.ts',
			),
		).toBeNull();
	});
});
