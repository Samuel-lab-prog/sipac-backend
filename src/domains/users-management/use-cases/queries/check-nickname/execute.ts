import type { QueriesRepository } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: QueriesRepository;
}

export function checkNicknameAvailabilityFactory({
	queriesRepository,
}: Dependencies) {
	return function checkNicknameAvailability(
		nickname: string,
	): Promise<boolean> {
		return queriesRepository.findNickname(nickname);
	};
}
