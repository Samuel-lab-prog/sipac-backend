import type { AppError } from '@AppError';
import type {
	AuthorPoem,
	CreatePoem,
	CreatePoemResult,
	MyPoem,
	PoemModerationStatus,
	PoemStatus,
	PoemVisibility,
	UpdatePoem,
	UpdatePoemResult,
} from '@Domains/poems-management/ports/models.ts';
import {
	API_INSTANCE,
	API_PREFIX,
	handleResponse,
	jsonRequest,
} from '@GenericSubdomains/utils/testing/utils.ts';
import { prisma } from '@Prisma/PrismaClient.ts';
import { poemsData, poemsForUpdate } from '../data/Index.ts';
import { type AuthUser } from './Auth.ts';

export async function createPoem(
	cookie: string,
	poem: CreatePoem,
): Promise<CreatePoemResult | AppError> {
	const request = jsonRequest(`${API_PREFIX}/poems`, {
		method: 'POST',
		headers: { Cookie: cookie },
		body: poem,
	});
	const response = await API_INSTANCE.handle(request);
	return handleResponse<CreatePoemResult>(response);
}

export async function getMyPoems(cookie: string): Promise<MyPoem[] | AppError> {
	const request = jsonRequest(`${API_PREFIX}/poems/me`, {
		method: 'GET',
		headers: { Cookie: cookie },
	});
	const response = await API_INSTANCE.handle(request);
	return handleResponse<MyPoem[]>(response);
}

export async function getPoemById(
	cookie: string,
	poemId: number,
): Promise<AuthorPoem | AppError> {
	const request = jsonRequest(`${API_PREFIX}/poems/${poemId}`, {
		method: 'GET',
		headers: { Cookie: cookie },
	});
	const response = await API_INSTANCE.handle(request);
	return handleResponse<AuthorPoem>(response);
}

export async function getAuthorPoems(
	cookie: string,
	authorId: number,
): Promise<AuthorPoem[] | AppError> {
	const request = jsonRequest(`${API_PREFIX}/poems/authors/${authorId}`, {
		method: 'GET',
		headers: { Cookie: cookie },
	});
	const response = await API_INSTANCE.handle(request);
	return handleResponse<AuthorPoem[]>(response);
}

export async function updatePoem(
	cookie: string,
	poemId: number,
	data: Partial<UpdatePoem>,
): Promise<UpdatePoemResult | AppError> {
	const request = jsonRequest(`${API_PREFIX}/poems/${poemId}`, {
		method: 'PUT',
		headers: { Cookie: cookie },
		body: data,
	});
	const response = await API_INSTANCE.handle(request);
	return handleResponse<UpdatePoemResult>(response);
}

export async function createAndApprovePoem(
	cookie: string,
	poem: CreatePoem,
): Promise<CreatePoemResult | AppError> {
	const result = (await createPoem(cookie, poem)) as CreatePoemResult;

	await updatePoemRaw(result.id!, { moderationStatus: 'approved' });
	return result;
}

export async function createDraftPoem(
	user: AuthUser,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): Promise<CreatePoemResult | AppError> {
	const poemData = makePoem(user.id, { status: 'draft', ...overrides }, index);
	return await createPoem(user.cookie, poemData);
}

export async function getMyFirstPoem(cookie: string): Promise<MyPoem> {
	const poems = (await getMyPoems(cookie)) as MyPoem[];
	return poems[0]!;
}

// ------------------- Helper functions for test data generation -----------------

/**
 * Returns a poem object with default data, allowing overrides.
 * @param authorId The ID of the poem's author.
 * @param overrides Optional field overrides for the poem object.
 * @param index Optional index to avoid duplicate titles in tests.
 * @returns The constructed poem object.
 */
export function makePoem(
	authorId: number,
	overrides: Partial<CreatePoem> = {},
	index = 0,
): CreatePoem & { authorId: number } {
	return {
		...poemsData[index]!,
		authorId,
		...overrides,
	};
}

/**
 * Returns an object of type UpdatePoem with default data, allowing overrides.
 * @param overrides Optional field overrides for the updated poem object.
 * @param index Optional index to avoid duplicate titles in tests.
 * @returns The constructed updated poem object.
 */
export function makeUpdatedPoem(
	overrides: Partial<UpdatePoem> = {},
	index = 0,
): UpdatePoem {
	return {
		...poemsForUpdate[index]!,
		...overrides,
	};
}

/**
 * Updates a poem's attributes in the database. Useful for setting up test scenarios.
 * @param poemId - The ID of the poem to update.
 * @param updates - An object containing the fields to update.
 * @returns The updated poem with selected fields.
 */
export async function updatePoemRaw(
	poemId: number,
	updates: Partial<{
		visibility: PoemVisibility;
		status: PoemStatus;
		moderationStatus: PoemModerationStatus;
	}>,
) {
	return await prisma.poem.update({
		where: { id: poemId },
		data: updates,
		select: {
			id: true,
			moderationStatus: true,
			status: true,
			visibility: true,
		},
	});
}
