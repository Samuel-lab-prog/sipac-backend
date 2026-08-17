import { describe, expect, it } from 'bun:test';
import { sanitize, xssClean } from './xssClean';

describe('xssClean', () => {
	it('sanitizes strings, arrays and objects', () => {
		const payload = {
			comment: '<script>alert(1)</script>',
			list: ['<img src=x onerror=alert(1) />', 'safe'],
			count: 2,
		};

		const sanitized = sanitize(payload);

		expect(sanitized.comment).not.toContain('<script');
		expect(sanitized.list[0]).toContain('<img');
		expect(sanitized.list[0]).not.toContain('onerror');
		expect(sanitized.list[1]).toBe('safe');
		expect(sanitized.count).toBe(2);
	});

	it('sanitizes request body, query, and params in place', () => {
		const ctx: any = {
			body: { note: '<script>hack()</script>' },
			query: { q: '<img src=x onerror=alert(1) />' },
			params: { id: '<script>1</script>' },
		};

		xssClean(ctx);

		expect(ctx.body.note).not.toContain('<script');
		expect(ctx.query.q).toContain('<img');
		expect(ctx.query.q).not.toContain('onerror');
		expect(ctx.params.id).not.toContain('<script');
	});
});
