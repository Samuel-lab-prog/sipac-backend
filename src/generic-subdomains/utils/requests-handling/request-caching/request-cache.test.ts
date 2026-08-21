import { afterEach, describe, expect, it, mock } from 'bun:test';
import { initRequestCache, withRequestCache } from './request-cache';

afterEach(() => mock.restore());

describe('request-cache', () => {
	it('returns loader result without cache context', async () => {
		const loader = mock(async () => 'value');

		await expect(withRequestCache('k', loader)).resolves.toBe('value');
		expect(loader).toHaveBeenCalledTimes(1);
	});

	it('memoizes by key within a request context', async () => {
		initRequestCache();
		const loader = mock(async () => 'value');

		await withRequestCache('k', loader);
		await withRequestCache('k', loader);

		expect(loader).toHaveBeenCalledTimes(1);
	});
});
