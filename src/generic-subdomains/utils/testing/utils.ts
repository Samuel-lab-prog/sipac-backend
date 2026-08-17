/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HeadersInit } from 'bun';
import { expect, mock } from 'bun:test';
import { testServer } from '../../../Index';
import type { AppError } from '../error-handling/app-error/util';

type JsonRequestOptions<TBody = unknown> = Omit<
	RequestInit,
	'body' | 'headers'
> & {
	body?: TBody;
	headers?: HeadersInit;
};

/**
 * Create a Request with JSON headers and body.
 * @param url The request URL.
 * @param options Request options, including body and headers.
 * @returns A Request object with JSON headers and body.
 *
 * You can pass any type of body, and it will be stringified to JSON.
 */
export function jsonRequest<TBody = unknown>(
	url: string,
	options: JsonRequestOptions<TBody> = {},
) {
	const { body, headers, ...rest } = options;

	const finalHeaders = new Headers(headers);

	if (!finalHeaders.has('Content-Type'))
		finalHeaders.set('Content-Type', 'application/json');

	return new Request(url, {
		...rest,
		headers: finalHeaders,
		body: body !== undefined ? JSON.stringify(body) : undefined,
	});
}

/**
 * Correctly handles a Response by parsing its JSON and checking the status code.
 * If the response is not OK, it returns an AppError. Otherwise, it returns the parsed JSON as type T.
 * @param response The Response object to handle.
 * @returns A promise that resolves to either the parsed JSON as type T or an AppError.
 */
export async function handleResponse<T>(
	response: Response,
): Promise<T | AppError> {
	const parsed = await response.json();
	if (!response.ok) return parsed as AppError;
	return parsed as T;
}

/**
 * Correctly identifies whether a given result is an AppError by checking for the presence of 'statusCode' and 'message' properties.
 * @param result The result to check.
 * @returns True if the result is an AppError, false otherwise.
 */
export function isAppError(result: unknown): result is AppError {
	return (
		typeof result === 'object' &&
		result !== null &&
		'statusCode' in result &&
		'message' in result &&
		'code' in result
	);
}

/**
 * Expects the result to be an AppError and checks its status code. Uses expect from Bun's test framework.
 * @param result The result to check.
 * @param statusCode The expected status code.
 */
export function expectAppError(result: unknown, statusCode: number) {
	const error = result as AppError;
	expect(error.statusCode).toBe(statusCode);
}

/** * Expects a promise to reject with an error of a specific type. Uses expect from Bun's test framework.
 * @param promise The promise that is expected to reject.
 * @param expectedType The constructor of the expected error type.
 */
export function expectError(
	promise: Promise<unknown>,
	expectedType: new (...args: any[]) => Error,
) {
	return expect(promise).rejects.toBeInstanceOf(expectedType);
}
/**
 * A constant representing a non-existent ID, useful for testing error cases where an ID is expected to not be found in the database.
 * We are not using -1 because the API might have validation that rejects negative IDs before it even checks if they exist, which would prevent us from testing the "not found" logic in the handlers.
 */
export const NON_EXISTENT_ID = 999999999;
/**
 * The app instance used for testing. We create a new Elysia instance and use our server for handling requests in tests.
 */
export const API_INSTANCE = testServer;
/**
 * The API prefix used for making requests to the test server. This should match the prefix defined in the server setup.
 */
export const API_PREFIX = 'http://test/api/v1';

/**
 * A constant representing the maximum time limit for queries in tests, useful for ensuring that tests do not run indefinitely and to catch performance issues.
 */
export const MAX_QUERY_TIME_LIMIT = 300;

type AnyFn = (...args: any[]) => any;

type MockedFn<T extends AnyFn> = ReturnType<typeof mock<T>> & {
	(...args: Parameters<T>): ReturnType<T>;
};

/**
 * A type representing a mocked version of a contract, where each function in the contract is replaced with a mocked function using Bun's mock utility.
 * This allows for easy creation of mocks for testing purposes, while maintaining type safety and autocompletion for the mocked functions.
 * For example, if you have a contract with a function `getUserById(id: number): Promise<User>`, the mocked contract will have a function `getUserById` that is a mocked function, allowing you to specify its behavior in tests.
 *
 * @template T The type of the contract to mock.
 * returns A mocked contract of type T, where each function is replaced with a mocked function.
 */
export type MockedContract<T> = {
	readonly [K in keyof T]: T[K] extends AnyFn ? MockedFn<T[K]> : T[K];
};

/**
 * A utility function to create a mocked contract for testing purposes. It takes a generic type T representing the contract interface and returns an object where each function is replaced with a mocked version using Bun's mock function.
 * This allows us to easily create mocks for external services or repositories when testing our use cases without having to manually mock each function.
 *
 * We also get strict type checking and autocompletion for the mocked contract, since the returned object is typed as MockedContract<T>.
 *
 * @template T The type of the contract to mock.
 * @returns A mocked contract of type T.
 */
export function createMockedContract<T>(
	overrides: MockedContract<T>,
): MockedContract<T> {
	return overrides;
}
/**
 * A utility function to set up a mocked function to resolve with a specific value when called.
 * This is useful for configuring the behavior of mocked contracts in tests, allowing us
 * to specify what a mocked function should return when invoked.
 *
 * @template T The type of the contract being mocked.
 * @param mockedContract The mocked contract containing the function to configure.
 * @param key The key of the function in the mocked contract to configure.
 * @param value The value that the mocked function should resolve to when called.
 */
export function givenResolved<
	T extends Record<string, (...args: any[]) => any>,
	K extends keyof T,
>(mocked: T, key: K, value: Awaited<ReturnType<T[K]>>) {
	(mocked[key] as any).mockResolvedValue(value);
}

/**
 * A utility function to create a new object by merging default values with overrides.
 * This is useful for creating test data with default values while allowing specific properties
 * to be overridden as needed in different test scenarios.
 *
 * @template T The type of the object being created.
 * @param defaults An object containing the default values for the properties.
 * @param overrides An optional object containing properties that should override the default values.
 * @returns A new object with the merged default and override values.
 */
export function makeParams<T>(defaults: T, overrides?: Partial<T>): T {
	return { ...defaults, ...overrides };
}

type Factory<TMocks, TSut> = (mocks: TMocks) => TSut;

/**
 * A generic utility function to create a System Under Test (SUT) along with its mocked dependencies.
 * This function clones the provided mocks to avoid side effects between tests.
 *
 * It is designed to work with any bounded context (BC) and any set of mocks, providing a
 * type-safe and reusable pattern for initializing SUTs in unit and integration tests.
 *
 * @template TMocks The type of the mocked dependencies.
 * @template TSut The type of the SUT being created.
 * @param factory A factory function that takes mocks and returns the SUT.
 * @param mocks An object containing all the mocked dependencies required by the factory.
 * @returns An object containing:
 *   - `sut`: The instantiated System Under Test.
 *   - `mocks`: The cloned mocks used to create the SUT, safe for individual test isolation.
 */
export function makeSut<TMocks extends Record<string, any>, TSut>(
	factory: Factory<TMocks, TSut>,
	mocks: TMocks,
) {
	const clonedMocks: TMocks = { ...mocks };

	const sut = factory(clonedMocks);

	return { sut, mocks: clonedMocks };
}
