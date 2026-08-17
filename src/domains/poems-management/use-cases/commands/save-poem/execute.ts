import type { CommandsRepository } from '../../../ports/commands';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { validator } from 'GlobalValidator';
import type { QueriesRepository } from '@Domains/poems-management/ports/queries';

interface Dependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function savePoemFactory(deps: Dependencies) {
	const { commandsRepository, queriesRepository, usersContract } = deps;
	return async function savePoem(params: {
		poemId: number;
		userId: number;
	}): Promise<void> {
		const { poemId, userId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active', 'suspended']);

		const poemInfo = await queriesRepository.selectPoemById(poemId);

		if (!poemInfo) throw new NotFoundError('Poem not found');
		if (poemInfo.author.id === userId)
			throw new ConflictError('Cannot save your own poem');

		const result = await commandsRepository.savePoem({ poemId, userId });
		if (result.ok === true) return result.data;

		if (result.code === 'CONFLICT')
			throw new ConflictError('Poem already saved');

		throw new UnknownError('Failed to save poem');
	};
}
