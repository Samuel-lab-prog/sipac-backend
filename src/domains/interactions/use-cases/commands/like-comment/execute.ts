import type {
	CommandsRepository,
	LikeCommentParams,
} from '../../../ports/commands';
import type { QueriesRepository } from '../../../ports/queries';
import { ConflictError } from '@DomainError';
import { validator } from '@SharedKernel/validators/Global';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { type EventBus } from '@SharedKernel/events/EventBus';

export interface LikeCommentDependencies {
	commandsRepository: CommandsRepository;
	queriesRepository: QueriesRepository;
	usersContract: UsersPublicContract;
	eventBus: EventBus;
}

export function likeCommentFactory({
	commandsRepository,
	queriesRepository,
	usersContract,
	eventBus,
}: LikeCommentDependencies) {
	return async function likeComment(params: LikeCommentParams): Promise<void> {
		const { userId, commentId } = params;
		const v = validator();

		const userInfo = await usersContract.selectUserBasicInfo(userId);
		v.user(userInfo).withStatus(['active']);

		const rawComment = await queriesRepository.selectCommentById({ commentId });
		const comment = v
			.comment(rawComment)
			.withStatus(['visible'], 'Comment is not available');
		v.comment(comment).withAuthorStatus(
			['active', 'suspended'],
			'Comment is not available',
		);

		const alreadyLiked = await queriesRepository.selectCommentLike({
			userId,
			commentId,
		});
		if (alreadyLiked) throw new ConflictError('Comment already liked');

		await commandsRepository.createCommentLike({
			commentId,
			userId,
		});

		eventBus.publish('COMMENT_LIKED', {
			userId,
			likerId: userId,
			likerNickname: userInfo.nickname,
			actorAvatarUrl: userInfo.avatarUrl ?? null,
			commentId,
		});
	};
}
