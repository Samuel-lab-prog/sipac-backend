import { green, red } from 'kleur/colors';
import fs from 'fs';
import { type Adr, withAdr } from '../metrics/adr-labels';
import type { ClocResult, DepcruiseResult } from '../metrics/Types';

function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}

const TERMINAL_WIDTH = 120;

export function center(text: string, width = TERMINAL_WIDTH): string {
	const pad = Math.max(0, Math.floor((width - text.length) / 2));
	return ' '.repeat(pad) + text;
}

export function divider(char = '─', width = TERMINAL_WIDTH): string {
	return char.repeat(width);
}

export function padRight(text: string, width: number): string {
	return text.padEnd(width, ' ');
}

export function padLeft(text: string, width: number): string {
	return text.padStart(width, ' ');
}

export function section(title: string): void {
	console.log('\n' + divider());
	console.log(center(title.toUpperCase()));
	console.log(divider());
}

/**
 * Given a file path, determines if it is an abstract file based on certain conventions or content.
 * @param path The file path
 * @param content Optional content of the file to check for abstract declarations
 * @returns True if the file is considered abstract, false otherwise
 */
export function isAbstractFile(path: string, content?: string): boolean {
	const normalizedPath = normalizePath(path);
	return (
		normalizedPath.includes('/ports/') ||
		(content?.includes('interface ') ?? false) ||
		(content?.includes('abstract class') ?? false)
	);
}

/**
 * Given a file path, extracts the domain name based on the convention of being under src/domains or src/generic-subdomains.
 * @param path The file path
 * @returns The domain name
 */
export function extractDomainFromPath(path: string): string | null {
	const normalizedPath = normalizePath(path);
	const match = normalizedPath.match(
		/(?:^|\/)src\/(domains|generic-subdomains)\/([^/]+)\//,
	);
	return match?.[2] ?? null;
}

export function extractIntegrationTestDomainFromPath(
	path: string,
): string | null {
	const normalizedPath = normalizePath(path);
	const match = normalizedPath.match(
		/(?:^|\/)tests\/integration\/(?!test-helpers\/)([^/]+)\//i,
	);
	if ((match && match[1] === 'endpoints') || (match && match[1] === 'data'))
		return null;
	return match?.[1] ?? null;
}

/**
 * Given a file path, determines if it is a test file based on common test file suffixes.
 * @param path The file path
 * @returns True if the file is a test file, false otherwise
 */
export function isTestFile(path: string): boolean {
	const normalizedPath = normalizePath(path);
	const testHelpersPattern = /\/test-helpers(\/|$)/i;
	const integrationTestsPattern = /\/tests(\/.*)?/i;

	if (testHelpersPattern.test(normalizedPath)) return true;
	if (integrationTestsPattern.test(normalizedPath)) return true;

	return (
		normalizedPath.endsWith('.test.ts') || normalizedPath.endsWith('.spec.ts')
	);
}

export type DomainKind = 'CORE' | 'UTILITY' | 'INFRA_SHARED';

/**
 * Classifies the domain into one of the predefined DomainKind categories.
 * @param domain The domain name to classify
 * @returns The DomainKind classification
 */
export function classifyDomainKind(domain: string): DomainKind {
	if (domain === 'utils') return 'UTILITY';
	if (domain === 'persistance' || domain === 'authentication')
		return 'INFRA_SHARED';
	return 'CORE';
}

/**
 * Determines if the given path belongs to a generic subdomain.
 * @param path The file path
 * @returns True if the path is within a generic subdomain, false otherwise
 */
export function isGenericSubdomain(path: string): boolean {
	return normalizePath(path).startsWith('src/generic-subdomains/');
}

/**
 * Extracts the root namespace from a given file path.
 * @param path The file path
 * @returns The root namespace or null if not found
 */
export function extractRootNamespace(path: string): string | null {
	const match = normalizePath(path).match(/^src\/([^/]+)\//);
	return match?.[1] ?? null;
}

/**
 * Determines if the given path is a root-level source file.
 * @param path The file path
 * @returns True if the path is a root-level source file, false otherwise
 */
export function isRootLevelSourceFile(path: string): boolean {
	return /^src\/[^/]+\.(ts|js)$/.test(normalizePath(path));
}

export type RuleStatus = 'OK' | 'VIOLATION';

export function formatRuleStatus(
	status: RuleStatus,
	label: string,
	...adrs: Adr[]
): string {
	return `${status} ${withAdr(label, ...adrs)}`;
}

export function formatRuleSuccess(label: string, ...adrs: Adr[]): string {
	return green(formatRuleStatus('OK', label, ...adrs));
}

export function formatRuleViolation(label: string, ...adrs: Adr[]): string {
	return red(formatRuleStatus('VIOLATION', label, ...adrs));
}

export function formatRuleTitle(
	label: string,
	count: number | undefined,
	...adrs: Adr[]
): string {
	return withAdr(count === undefined ? label : `${label} (${count})`, ...adrs);
}

/**
 * Loads and parses the dependency cruise result from a JSON file.
 * @param path The path to the depcruise JSON output (default: 'depcruise.json')
 * @returns The parsed DepcruiseResult object
 */
export function loadDepcruiseData(path = 'depcruise.json'): DepcruiseResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}

/**
 * Loads and parses the cloc result from a JSON file.
 * @param path The path to the cloc JSON output (default: 'cloc.json')
 * @returns The parsed ClocResult object
 */
export function loadClocData(path = 'cloc.json'): ClocResult {
	return JSON.parse(fs.readFileSync(path, 'utf-8'));
}
