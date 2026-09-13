import {
	ConflictError,
	ForbiddenError,
	UnprocessableEntityError,
} from '@DomainError';

export function validateDates(
	start: Date,
	end: Date,
	bounds?: { startsAt: Date; endsAt: Date },
) {
	if (
		!Number.isFinite(start.getTime()) ||
		!Number.isFinite(end.getTime()) ||
		start > end
	)
		throw new UnprocessableEntityError(
			'O término deve ser igual ou posterior ao início.',
		);
	if (bounds && (start < bounds.startsAt || end > bounds.endsAt))
		throw new UnprocessableEntityError(
			'A participação deve estar dentro da vigência do projeto.',
		);
}
export function validateTransition(
	current: string,
	target: string,
	manager: boolean,
	approvedReports: number,
	pendingHours: number,
) {
	const transitions: Record<string, string[]> = {
		draft: ['submitted', 'cancelled'],
		submitted: ['draft', 'active', 'cancelled'],
		active: ['completed', 'cancelled'],
		completed: [],
		cancelled: [],
	};
	if (!transitions[current]?.includes(target))
		throw new ConflictError('Esta mudança de situação não está disponível.');
	if (
		['active', 'completed'].includes(target) ||
		(current === 'submitted' && target === 'draft')
	) {
		if (!manager)
			throw new ForbiddenError(
				'A gestão acadêmica precisa avaliar esta mudança.',
			);
	}
	if (target === 'completed' && (!approvedReports || pendingHours))
		throw new UnprocessableEntityError(
			'A conclusão exige relatório aprovado e carga horária validada de todos os participantes.',
		);
}
