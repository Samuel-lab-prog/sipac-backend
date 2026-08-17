import { describe, expect, it } from 'bun:test';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

function collectRuleDirectories(rootDir: string): string[] {
	const directories: string[] = [];

	function walk(dir: string): void {
		for (const entry of readdirSync(dir)) {
			const fullPath = path.join(dir, entry);
			const stat = statSync(fullPath);

			if (stat.isDirectory()) {
				walk(fullPath);
				continue;
			}

			if (entry === 'rule.ts') {
				directories.push(dir);
			}
		}
	}

	walk(rootDir);
	return directories.sort();
}

describe('ARCHITECTURE-RULE - Rule Test Coverage', () => {
	it('ARCHITECTURE-RULE ensures every rule.ts has a sibling rule.test.ts', () => {
		const candidates = [
			path.join(
				process.cwd(),
				'architecture-analysis',
				'src',
				'metrics',
				'rules',
			),
			path.join(
				process.cwd(),
				'backend',
				'architecture-analysis',
				'src',
				'metrics',
				'rules',
			),
		];
		const rootDir = candidates.find((candidate) => existsSync(candidate));

		expect(rootDir).toBeDefined();
		if (!rootDir) return;

		const missingTests = collectRuleDirectories(rootDir).filter((dir) => {
			const testPath = path.join(dir, 'rule.test.ts');
			return !existsSync(testPath);
		});

		expect(missingTests).toEqual([]);
	});
});
