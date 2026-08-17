import type { PoemComment } from '@Domains/interactions/ports/models';
import { ForbiddenError, NotFoundError } from '@DomainError';
import type { CommentStatus, UserStatus } from '@SharedKernel/Enums';

export function comment(comment?: PoemComment | null) {
	if (!comment) throw new NotFoundError(`Comment not found`);

	return {
		withStatus(allowedStatuses: CommentStatus[], msg?: string): PoemComment {
			if (!allowedStatuses.includes(comment.status))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a comment with status ${comment.status}`,
				);
			return comment;
		},

		withAuthorStatus(allowedStatuses: UserStatus[], msg?: string): PoemComment {
			if (
				!comment.author.status ||
				!allowedStatuses.includes(comment.author.status)
			)
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a comment whose author has status ${comment.author.status}`,
				);
			return comment;
		},
	};
}
