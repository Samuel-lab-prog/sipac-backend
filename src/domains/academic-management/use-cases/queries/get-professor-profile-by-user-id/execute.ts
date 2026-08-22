import type { ProfessorProfile } from '../../../ports/models';

interface Dependencies {
	queriesRepository: {
		selectProfessorProfileByUserId(
			userId: number,
		): Promise<ProfessorProfile | null>;
	};
}

export function getProfessorProfileByUserIdFactory({
	queriesRepository,
}: Dependencies) {
	return function getProfessorProfileByUserId(
		userId: number,
	): Promise<ProfessorProfile | null> {
		return queriesRepository.selectProfessorProfileByUserId(userId);
	};
}
