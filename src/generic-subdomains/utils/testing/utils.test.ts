import { describe, expect, it, mock } from 'bun:test';
import {
	createMockedContract,
	expectError,
	givenResolved,
	handleResponse,
	isAppError,
	jsonRequest,
	makeParams,
	makeSut,
} from './utils';

describe('TestUtils', () => {
	it('jsonRequest applies json content-type and serializes body', async () => {
		const req = jsonRequest('http://test.local/resource', {
			method: 'POST',
			body: { ok: true },
		});

		expect(req.method).toBe('POST');
		expect(req.headers.get('Content-Type')).toBe('application/json');
		expect(await req.text()).toBe('{"ok":true}');
	});

	it('jsonRequest preserves custom content-type header', () => {
		const req = jsonRequest('http://test.local/resource', {
			headers: { 'Content-Type': 'application/custom+json' },
		});

		expect(req.headers.get('Content-Type')).toBe('application/custom+json');
	});

	it('handleResponse returns parsed payload on success', async () => {
		const response = new Response(JSON.stringify({ id: 1 }), { status: 200 });

		const result = await handleResponse<{ id: number }>(response);

		expect(result).toEqual({ id: 1 });
	});

	it('handleResponse returns app error payload when response fails', async () => {
		const response = new Response(
			JSON.stringify({
				statusCode: 409,
				message: 'conflict',
				code: 'CONFLICT',
			}),
			{ status: 409 },
		);

		const result = await handleResponse(response);

		expect(isAppError(result)).toBe(true);
		if (!isAppError(result)) return;
		expect(result.statusCode).toBe(409);
		expect(result.code).toBe('CONFLICT');
	});

	it('isAppError validates required shape', () => {
		expect(
			isAppError({
				statusCode: 400,
				message: 'bad request',
				code: 'BAD_REQUEST',
			}),
		).toBe(true);
		expect(isAppError({ message: 'missing statusCode' })).toBe(false);
		expect(isAppError(null)).toBe(false);
	});

	it('expectError asserts rejected error type', async () => {
		const promise = Promise.reject(new TypeError('boom'));
		await expectError(promise, TypeError);
	});

	it('createMockedContract and givenResolved set mock return', async () => {
		const contract = createMockedContract({
			getById: mock(async (_id: number) => ({ id: 0 })),
		});

		givenResolved(contract, 'getById', { id: 42 });

		await expect(contract.getById(1)).resolves.toEqual({ id: 42 });
	});

	it('makeParams merges defaults with overrides', () => {
		const params = makeParams({ a: 1, b: 2 }, { b: 9 });
		expect(params).toEqual({ a: 1, b: 9 });
	});

	it('makeSut returns sut and cloned mocks', () => {
		const mocks = { dep: { value: 1 } };
		const result = makeSut((m) => ({ read: () => m.dep.value }), mocks);

		expect(result.sut.read()).toBe(1);
		expect(result.mocks).not.toBe(mocks);
		expect(result.mocks.dep).toBe(mocks.dep);
	});
});
