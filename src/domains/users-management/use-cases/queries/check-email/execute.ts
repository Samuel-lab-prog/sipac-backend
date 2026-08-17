import type { QueriesRepository } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function checkEmailAvailabilityFactory({
	queriesRepository,
}: Dependencies) {
	return function checkEmailAvailability(email: string): Promise<boolean> {
		return queriesRepository.findEmail(email);
	};
}
