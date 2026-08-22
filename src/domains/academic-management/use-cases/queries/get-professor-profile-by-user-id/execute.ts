import { NotFoundError } from '@DomainError';
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
	): Promise<ProfessorProfile> {
		return queriesRepository
			.selectProfessorProfileByUserId(userId)
			.then((profile) => {
				if (!profile) throw new NotFoundError('Professor profile not found');
				return profile;
			});
	};
}
