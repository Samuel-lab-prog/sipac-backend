import type {
	CommandsRepository,
	PatchCommentParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';

export interface UpdateCommentDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
}

export function updateCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
}: UpdateCommentDependencies) {
	return async function updateComment(
		params: PatchCommentParams,
	): Promise<void> {
		const { userId, commentId, content } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const rawComment = await queriesRepository.selectCommentById({ commentId });

		const comment = v
			.comment(rawComment)
			.withStatus(['visible'], 'Comment is not editable');

		if (userInfo.role === 'author') v.sameOwner(userId, comment.author.id);

		v.ensure(content)
			.minLength(1, 'Content must be at least 1 character long')
			.maxLength(3000, 'Content must be at most 3000 characters long');

		await commandsRepository.updateComment({
			commentId,
			content,
		});
	};
}
