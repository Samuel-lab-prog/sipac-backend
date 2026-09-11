import { ForbiddenError, NotFoundError } from '@DomainError';
import { prisma } from '@Prisma';

export async function professorFor(actor: { clientId: number; clientRole: string; clientStatus: string }) {
	if (actor.clientRole !== 'professor' || actor.clientStatus !== 'active')
		throw new ForbiddenError('Esta área é exclusiva de professores ativos.');
	const profile = await prisma.professorProfile.findUnique({ where: { userId: actor.clientId }, select: { id: true } });
	if (!profile) throw new NotFoundError('Perfil de professor não encontrado. Solicite o vínculo à secretaria.');
	return profile.id;
}
export const assignedTo = (professorProfileId: number) => ({ teachingAssignments: { some: { professorProfileId } } });
export async function requireClass(professorProfileId: number, classId: number) {
	const row = await prisma.classOffering.findFirst({ where: { id: classId, ...assignedTo(professorProfileId) }, select: { id: true } });
	if (!row) throw new NotFoundError('Turma não encontrada entre seus vínculos de docência.');
}
export async function requireLesson(professorProfileId: number, id: number) {
	const row = await prisma.classSession.findFirst({ where: { id, classOffering: assignedTo(professorProfileId) }, select: { id: true, classOfferingId: true, status: true, startsAt: true } });
	if (!row) throw new NotFoundError('Aula não encontrada entre suas turmas.');
	return row;
}
export async function requireActivity(professorProfileId: number, id: number) {
	const row = await prisma.academicActivity.findFirst({ where: { id, classOffering: assignedTo(professorProfileId) }, select: { id: true, classOfferingId: true, maxGrade: true } });
	if (!row) throw new NotFoundError('Atividade não encontrada entre suas turmas.');
	return row;
}
