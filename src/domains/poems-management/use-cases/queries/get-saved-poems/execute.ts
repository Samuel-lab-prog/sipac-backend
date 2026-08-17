import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { validator } from 'GlobalValidator';
import type { QueriesRepository } from '@Domains/poems-management/ports/queries';
import type { SavedPoem } from '@Domains/poems-management/ports/models';

interface Dependencies {
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function getSavedPoemsFactory(deps: Dependencies) {
	const { queriesRepository, usersContract } = deps;
	return async function getSavedPoems(params: {
		requesterId: number;
	}): Promise<SavedPoem[]> {
		const { requesterId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(requesterId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		return await queriesRepository.selectSavedPoems(requesterId);
	};
}
