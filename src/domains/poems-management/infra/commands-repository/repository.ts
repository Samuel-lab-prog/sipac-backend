import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/Types';

import type { CommandsRepository } from '../../ports/commands';
import type {
	CreateCollection,
	CreatePoemDB,
	CreatePoemResult,
	UpdatePoemDB,
	UpdatePoemResult,
} from '../../ports/models';

import { insertPoemSelect, updatePoemSelect } from './selects';
import {
	toPrismaCreatePoemInput,
	toPrismaUpdatePoemInput,
	toCreatePoemResult,
	toUpdatePoemResult,
} from './helpers';

function insertPoem(
	poem: CreatePoemDB,
): Promise<CommandResult<CreatePoemResult>> {
	return withPrismaResult(async () => {
		const result = await prisma.poem.create({
			select: insertPoemSelect,
			data: toPrismaCreatePoemInput(poem),
		});
		return toCreatePoemResult(result);
	});
}

function savePoem(params: {
	poemId: number;
	userId: number;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.savedPoem.create({
			data: {
				poemId: params.poemId,
				userId: params.userId,
			},
		});
	});
}

function deleteSavedPoem(params: {
	poemId: number;
	userId: number;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.savedPoem.delete({
			where: {
				userId_poemId: {
					poemId: params.poemId,
					userId: params.userId,
				},
			},
		});
	});
}

function updatePoem(
	poemId: number,
	poem: UpdatePoemDB,
): Promise<CommandResult<UpdatePoemResult>> {
	return withPrismaResult(async () => {
		const updatedPoem = await prisma.poem.update({
			where: { id: poemId, deletedAt: null },
			data: toPrismaUpdatePoemInput(poem),
			select: updatePoemSelect,
		});
		return toUpdatePoemResult(updatedPoem);
	});
}

function deletePoem(poemId: number): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.poem.update({
			where: { id: poemId, deletedAt: null },
			data: { deletedAt: new Date() },
		});
		return;
	});
}

function updatePoemAudio(params: {
	poemId: number;
	audioUrl: string | null;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		await prisma.poem.update({
			where: { id: params.poemId, deletedAt: null },
			data: { audioUrl: params.audioUrl },
		});
		return;
	});
}

function createCollection(params: {
	data: CreateCollection;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		const { data } = params;
		await prisma.collection.create({
			data: {
				userId: data.userId,
				name: data.name,
				description: data.description,
			},
		});
		return;
	});
}

function addItemToCollection(params: {
	collectionId: number;
	poemId: number;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		const { collectionId, poemId } = params;
		await prisma.collectionItem.create({
			data: {
				collectionId,
				poemId,
			},
		});
		return;
	});
}

function removeItemFromCollection(params: {
	collectionId: number;
	poemId: number;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		const { collectionId, poemId } = params;
		await prisma.collectionItem.delete({
			where: {
				collectionId_poemId: {
					collectionId,
					poemId,
				},
			},
		});
		return;
	});
}

function deleteCollection(params: {
	collectionId: number;
	userId: number;
}): Promise<CommandResult<void>> {
	return withPrismaResult(async () => {
		const { collectionId, userId } = params;
		await prisma.$transaction(async (tx) => {
			await tx.collection.findFirstOrThrow({
				where: { id: collectionId, userId },
				select: { id: true },
			});

			await tx.collectionItem.deleteMany({
				where: { collectionId },
			});

			await tx.collection.delete({
				where: { id: collectionId },
			});
		});
		return;
	});
}

export const commandsRepository: CommandsRepository = {
	insertPoem,
	updatePoem,
	deletePoem,
	updatePoemAudio,
	savePoem,
	removeSavedPoem: deleteSavedPoem,
	createCollection,
	addItemToCollection,
	removeItemFromCollection,
	deleteCollection,
};
