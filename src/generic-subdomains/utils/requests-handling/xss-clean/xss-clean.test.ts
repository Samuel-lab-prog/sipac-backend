import { describe, expect, it } from 'bun:test';
import { sanitize, xssClean } from './xss-clean';

describe('xss-clean', () => {
	it('sanitizes strings, arrays and objects', () => {
		expect(sanitize('<script>alert(1)</script>')).toContain('&lt;script&gt;');
		expect(sanitize(['<script>alert(1)</script>'])).toEqual([
			sanitize('<script>alert(1)</script>'),
		]);
		expect(sanitize({ a: '<img src=x onerror=1>' })).toEqual({
			a: sanitize('<img src=x onerror=1>'),
		});
	});

	it('sanitizes request body, query, and params in place', () => {
		const ctx = {
			body: { a: '<script>' },
			query: { q: '<script>' },
			params: { id: '<script>' },
		} as never;

		xssClean(ctx);

		expect((ctx as any).body.a).not.toContain('<script>');
		expect((ctx as any).query.q).not.toContain('<script>');
		expect((ctx as any).params.id).not.toContain('<script>');
	});
});
