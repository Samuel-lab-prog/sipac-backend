import { prisma } from '@Prisma/PrismaClient';
import { withPrismaResult } from '@Prisma/PrismaErrorHandler';
import type { CommandsRepository } from '../../ports/commands';
import type { CommentStatus } from '../../ports/models';
import type { CommandResult } from '@SharedKernel/Types';

function updateComment(params: {
	commentId: number;
	content: string;
}): Promise<CommandResult<void>> {
	const { commentId, content } = params;
	return withPrismaResult(async () => {
		await prisma.comment.update({
			where: { id: commentId, status: 'visible' },
			data: { content },
		});
	});
}

function createPoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<CommandResult<void>> {
	const { userId, poemId } = params;

	return withPrismaResult(async () => {
		await prisma.poemLike.create({
			data: {
				userId,
				poemId,
			},
		});
	});
}

function deletePoemLike(params: {
	userId: number;
	poemId: number;
}): Promise<CommandResult<void>> {
	const { userId, poemId } = params;

	return withPrismaResult(async () => {
		await prisma.poemLike.delete({
			where: {
				userId_poemId: {
					userId,
					poemId,
				},
			},
		});
	});
}

function createPoemComment(params: {
	userId: number;
	poemId: number;
	content: string;
	parentId?: number;
}): Promise<CommandResult<{ commentId: number }>> {
	const { userId, poemId, content, parentId } = params;
	return withPrismaResult(async () => {
		const rs = await prisma.comment.create({
			data: {
				authorId: userId,
				poemId,
				content,
				parentId,
			},
			select: {
				id: true,
			},
		});
		return { commentId: rs.id };
	});
}

function deletePoemComment(params: {
	commentId: number;
	deletedBy: CommentStatus;
}): Promise<CommandResult<void>> {
	const { commentId, deletedBy } = params;
	return withPrismaResult(async () => {
		await prisma.comment.update({
			where: { id: commentId },
			data: { status: deletedBy },
		});
	});
}

function createCommentLike(params: {
	userId: number;
	commentId: number;
}): Promise<CommandResult<void>> {
	const { userId, commentId } = params;
	return withPrismaResult(async () => {
		await prisma.commentLike.create({
			data: {
				userId,
				commentId,
			},
		});
	});
}

function deleteCommentLike(params: {
	userId: number;
	commentId: number;
}): Promise<CommandResult<void>> {
	const { userId, commentId } = params;
	return withPrismaResult(async () => {
		await prisma.commentLike.delete({
			where: {
				userId_commentId: {
					userId,
					commentId,
				},
			},
		});
	});
}

export const commandsRepository: CommandsRepository = {
	createPoemLike,
	deletePoemLike,
	createPoemComment,
	deletePoemComment,
	createCommentLike,
	deleteCommentLike,
	updateComment,
};
