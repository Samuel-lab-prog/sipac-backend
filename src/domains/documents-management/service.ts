import { buildSnapshot } from './snapshot';
import { randomBytes } from 'node:crypto';
import { prisma } from '@Prisma';
import type { Prisma } from '@PrismaGenerated/client';
import { ConflictError, NotFoundError } from '@DomainError';
import {
	activeAccount,
	requireManager,
	type Actor,
} from '../institution-management/access';
import { renderDocument, type DocumentSnapshot } from './pdf';
import type { IssueBody } from './types';
const select = {
	id: true,
	kind: true,
	createdAt: true,
	verificationCode: true,
	revokedAt: true,
	revocationReason: true,
	snapshot: true,
} as const;
export async function list(actor: Actor) {
	const user = await activeAccount(actor);
	return prisma.issuedDocument.findMany({
		where: {
			campusId: user.campusId,
			...(['staff', 'admin'].includes(user.role)
				? {}
				: { subjectUserId: user.id }),
		},
		select,
		orderBy: { createdAt: 'desc' },
		take: 100,
	});
}
export async function options(actor: Actor) {
	const user = await activeAccount(actor);
	return prisma.projectParticipant.findMany({
		where: {
			userId: user.id,
			approvedHours: { gt: 0 },
			project: { campusId: user.campusId, status: 'completed' },
		},
		select: {
			id: true,
			approvedHours: true,
			project: { select: { title: true } },
		},
	});
}
export async function issue(actor: Actor, body: IssueBody) {
	const user = await activeAccount(actor);
	const subjectId = body.subjectUserId ?? user.id;
	if (subjectId !== user.id) requireManager(user);
	const code = randomBytes(24).toString('hex');
	return prisma.$transaction(
		async (tx) => {
			const snapshot = await buildSnapshot(tx, {
				subjectId,
				campusId: user.campusId,
				issuerName: user.name,
				body,
			});
			// Validate the PDF before committing an issuance that cannot be downloaded.
			await renderDocument(snapshot, code);
			return tx.issuedDocument.create({
				data: {
					verificationCode: code,
					campusId: user.campusId,
					subjectUserId: subjectId,
					issuedByUserId: user.id,
					kind: body.kind,
					snapshot: snapshot as unknown as Prisma.InputJsonValue,
				},
				select,
			});
		},
		{ isolationLevel: 'RepeatableRead', timeout: 15000 },
	);
}
export async function download(actor: Actor, id: string) {
	const user = await activeAccount(actor);
	const doc = await prisma.issuedDocument.findFirst({
		where: { id, campusId: user.campusId },
	});
	if (
		!doc ||
		(doc.subjectUserId !== user.id && !['admin', 'staff'].includes(user.role))
	)
		throw new NotFoundError('Documento não encontrado.');
	if (doc.revokedAt)
		throw new ConflictError(
			'Este documento foi revogado. Consulte seu registro de validação.',
		);
	return renderDocument(doc.snapshot as DocumentSnapshot, doc.verificationCode);
}
export async function revoke(actor: Actor, id: string, reason: string) {
	const user = await activeAccount(actor);
	requireManager(user);
	const result = await prisma.issuedDocument.updateMany({
		where: { id, campusId: user.campusId, revokedAt: null },
		data: {
			revokedAt: new Date(),
			revokedByUserId: user.id,
			revocationReason: reason.trim(),
		},
	});
	if (!result.count)
		throw new ConflictError('Documento não encontrado ou já revogado.');
	return { success: true };
}
export async function verify(code: string) {
	const doc = await prisma.issuedDocument.findUnique({
		where: { verificationCode: code },
	});
	if (!doc) throw new NotFoundError('Código de autenticidade não encontrado.');
	const snapshot = doc.snapshot as DocumentSnapshot;
	return {
		id: doc.id,
		title: snapshot.title,
		subjectName: snapshot.subjectName,
		institution: snapshot.institution,
		campus: snapshot.campus,
		issuedAt: doc.createdAt,
		revokedAt: doc.revokedAt,
		templateVersion: doc.templateVersion,
	};
}
