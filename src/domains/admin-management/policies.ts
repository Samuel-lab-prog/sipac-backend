import { ConflictError } from '@DomainError';

export function validateAccessChange(input: {
	actorId: number;
	targetId: number;
	currentRole: string;
	currentStatus: string;
	role: string;
	status: string;
	activeAdmins: number;
	hasAcademicHistory: boolean;
	hasStudentProfile: boolean;
}) {
	const removingAdmin =
		input.currentRole === 'admin' &&
		input.currentStatus === 'active' &&
		(input.role !== 'admin' || input.status !== 'active');
	if (removingAdmin && input.activeAdmins <= 1)
		throw new ConflictError(
			'O último administrador ativo deve ser preservado.',
		);
	if (input.actorId === input.targetId)
		throw new ConflictError(
			'Você não pode alterar seu próprio acesso administrativo.',
		);
	if (input.currentStatus === 'pending')
		throw new ConflictError(
			'Esta conta deve concluir o primeiro acesso antes de uma alteração administrativa.',
		);
	if (input.currentRole !== input.role && input.hasAcademicHistory)
		throw new ConflictError(
			'O perfil possui vínculos acadêmicos. Preserve o papel e gerencie apenas a situação de acesso.',
		);
	if (
		input.role === 'student' &&
		input.currentRole !== 'student' &&
		!input.hasStudentProfile
	)
		throw new ConflictError(
			'Cadastre o aluno pelo fluxo da secretaria para gerar seu registro acadêmico.',
		);
}
