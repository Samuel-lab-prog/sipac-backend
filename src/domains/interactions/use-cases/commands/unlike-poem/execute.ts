import type {
	CommandsRepository,
	LikePoemParams,
} from '../../../ports/commands';
import { NotFoundError } from '@DomainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import type { PoemsPublicContract } from '@Domains/poems-management/public/Index';

import type { QueriesRepository } from '../../../ports/queries';

export interface UnlikePoemDependencies {
	queriesRepository: QueriesRepository;
	commandsRepository: CommandsRepository;
	poemsContract: PoemsPublicContract;
	usersContract: UsersPublicContract;
}

export function unlikePoemFactory({
	commandsRepository,
	poemsContract,
	queriesRepository,
	usersContract,
}: UnlikePoemDependencies) {
	return async function unlikePoem(params: LikePoemParams): Promise<void> {
		const { userId, poemId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);

		v.user(userInfo).withStatus(['active']);

		const poemInfo = await poemsContract.selectPoemBasicInfo(poemId);
		v.poem(poemInfo)
			.withAuthorStatus(['active', 'suspended'])
			.withModerationStatus(['approved'])
			.withStatus(['published'])
			.withVisibility(['public', 'friends', 'unlisted']);

		const existingLike = await queriesRepository.selectPoemLike({
			userId,
			poemId,
		});
		if (!existingLike) throw new NotFoundError('Like not found');

		await commandsRepository.deletePoemLike({ userId, poemId });
	};
}
