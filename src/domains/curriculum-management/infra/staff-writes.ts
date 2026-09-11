import {
	ConflictError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import { prisma } from '@Prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import type { ClassOffering } from '../ports/models';

type Transaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];
const enrollmentSelect = {
	id: true,
	studentProfileId: true,
	classOfferingId: true,
	status: true,
} as const;
export function normalizeClassFields(
	input: Pick<ClassOffering, 'title' | 'code' | 'shift'>,
) {
	const title = input.title.trim();
	const code = input.code.trim().toUpperCase();
	if (title.length < 3 || code.length < 2)
		throw new UnprocessableEntityError(
			'Informe um nome e um código válidos para a turma.',
		);
	return { title, code, shift: input.shift };
}
async function write<T>(action: () => Promise<T>) {
	try {
		return await action();
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === 'P2002')
				throw new ConflictError('Este vínculo ou código já existe.');
			if (error.code === 'P2025')
				throw new NotFoundError('Registro não encontrado.');
			if (error.code === 'P2003')
				throw new UnprocessableEntityError(
					'O registro relacionado não está disponível.',
				);
		}
		throw error;
	}
}
export const editStaffClass = (
	id: number,
	input: Pick<ClassOffering, 'title' | 'code' | 'shift'>,
) =>
	write(() =>
		prisma.classOffering.update({
			where: { id },
			data: normalizeClassFields(input),
		}),
	);

async function prepareStudent(
	tx: Transaction,
	classOfferingId: number,
	studentProfileId: number,
) {
	const offering = await tx.classOffering.findUnique({
		where: { id: classOfferingId },
	});
	const student = await tx.studentProfile.findUnique({
		where: { id: studentProfileId },
		include: { user: { select: { role: true, status: true } } },
	});
	if (!offering || !student)
		throw new NotFoundError('Turma ou aluno não encontrado.');
	if (
		student.status !== 'active' ||
		student.user.role !== 'student' ||
		!['active', 'pending'].includes(student.user.status)
	)
		throw new UnprocessableEntityError(
			'Este aluno não está disponível para matrícula.',
		);
	if (student.courseId === null) {
		await tx.studentProfile.updateMany({
			where: { id: studentProfileId, courseId: null },
			data: { courseId: offering.courseId },
		});
	}
	const current = await tx.studentProfile.findUniqueOrThrow({
		where: { id: studentProfileId },
		select: { courseId: true },
	});
	if (current.courseId !== offering.courseId)
		throw new UnprocessableEntityError(
			'O aluno pertence a outro curso. Regularize o vínculo acadêmico antes de matricular.',
		);
}
export function enrollStudent(
	classOfferingId: number,
	studentProfileId: number,
) {
	return write(() =>
		prisma.$transaction(async (tx) => {
			await prepareStudent(tx, classOfferingId, studentProfileId);
			const existing = await tx.enrollment.findUnique({
				where: {
					studentProfileId_classOfferingId: {
						studentProfileId,
						classOfferingId,
					},
				},
			});
			if (existing)
				throw new ConflictError(
					'O aluno já possui matrícula nesta turma. Atualize a situação da matrícula existente.',
				);
			return tx.enrollment.create({
				data: { classOfferingId, studentProfileId, status: 'active' },
				select: enrollmentSelect,
			});
		}),
	);
}
export function changeEnrollmentStatus(
	classOfferingId: number,
	id: number,
	status: string,
) {
	return write(() =>
		prisma.$transaction(async (tx) => {
			const enrollment = await tx.enrollment.findFirst({
				where: { id, classOfferingId },
			});
			if (!enrollment)
				throw new NotFoundError('Matrícula não encontrada nesta turma.');
			if (status === 'active')
				await prepareStudent(tx, classOfferingId, enrollment.studentProfileId);
			return tx.enrollment.update({
				where: { id, classOfferingId },
				data: { status },
				select: enrollmentSelect,
			});
		}),
	);
}
export function assignProfessor(
	classOfferingId: number,
	professorProfileId: number,
) {
	return write(() =>
		prisma.$transaction(async (tx) => {
			const professor = await tx.professorProfile.findUnique({
				where: { id: professorProfileId },
				include: { user: { select: { name: true, role: true, status: true } } },
			});
			if (!professor) throw new NotFoundError('Professor não encontrado.');
			if (
				professor.user.role !== 'professor' ||
				professor.user.status !== 'active'
			)
				throw new UnprocessableEntityError(
					'Selecione um professor com conta ativa.',
				);
			await tx.teachingAssignment.upsert({
				where: {
					professorProfileId_classOfferingId: {
						professorProfileId,
						classOfferingId,
					},
				},
				create: { professorProfileId, classOfferingId, role: 'lead' },
				update: {},
			});
			return { id: professor.id, name: professor.user.name };
		}),
	);
}
export async function unassignProfessor(
	classOfferingId: number,
	professorProfileId: number,
) {
	await write(() =>
		prisma.teachingAssignment.delete({
			where: {
				professorProfileId_classOfferingId: {
					professorProfileId,
					classOfferingId,
				},
			},
		}),
	);
	return { success: true };
}
