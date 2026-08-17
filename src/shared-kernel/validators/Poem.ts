import type { PoemBasicInfo } from '@Domains/poems-management/public/Index';
import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	PoemStatus,
	PoemModerationStatus,
	PoemVisibility,
	UserStatus,
} from '@SharedKernel/Enums';

export function poem(poem: PoemBasicInfo) {
	if (!poem.exists)
		throw new NotFoundError(`Poem with id ${poem.id} not found`);

	return {
		withVisibility(allowedVisibilities: PoemVisibility[], msg?: string) {
			if (!allowedVisibilities.includes(poem.visibility))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with visibility ${poem.visibility}`,
				);
			return this;
		},

		withModerationStatus(
			allowedModerationStatuses: PoemModerationStatus[],
			msg?: string,
		) {
			if (!allowedModerationStatuses.includes(poem.moderationStatus))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with moderation status ${poem.moderationStatus}`,
				);
			return this;
		},

		withCommentability(allowedCommentability: boolean, msg?: string) {
			if (poem.isCommentable !== allowedCommentability)
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with commentability ${poem.isCommentable}`,
				);
			return this;
		},

		withStatus(allowedStatuses: PoemStatus[], msg?: string) {
			if (!allowedStatuses.includes(poem.status))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem with status ${poem.status}`,
				);
			return this;
		},

		withAuthorStatus(allowedStatuses: UserStatus[], msg?: string) {
			if (!allowedStatuses.includes(poem.authorStatus))
				throw new ForbiddenError(
					msg ||
						`Cannot perform this action on a poem whose author has status ${poem.authorStatus}`,
				);
			return this;
		},
	};
}
