import { ForbiddenError, NotFoundError } from '@DomainError';
import type {
	QueriesRepository,
	GetProfileParams,
} from '../../../ports/queries';
import type {
	UserPrivateProfile,
	UserPublicProfile,
} from '../../../ports/models';
import type { FriendsPublicContract } from '@Domains/friends-management/public/Index';
import { canExposeUserToViewer } from '@SharedKernel/policies/BannedUserVisibility';

interface Dependencies {
	queriesRepository: QueriesRepository;
	friendsContract: FriendsPublicContract;
}

function withoutSocialRelation(profile: UserPublicProfile): UserPublicProfile {
	return {
		...profile,
		isFriend: false,
		hasBlockedRequester: false,
		isBlockedByRequester: false,
		isFriendRequester: false,
		hasIncomingFriendRequest: false,
	};
}

export function getProfileFactory({
	queriesRepository,
	friendsContract,
}: Dependencies) {
	return async function getProfile(
		params: GetProfileParams,
	): Promise<UserPrivateProfile | UserPublicProfile> {
		const { requesterId, requesterStatus, id } = params;

		if (requesterStatus === 'banned')
			throw new ForbiddenError('Banned users cannot view private profiles');

		let isPrivateProfile = false;
		if (requesterId === id) isPrivateProfile = true;

		const profile = await queriesRepository.selectProfile({
			id,
			isPrivate: isPrivateProfile,
			requesterId,
			requesterRole: params.requesterRole,
			requesterStatus,
		});

		if (!profile) throw new NotFoundError('Profile not found');
		if (!('isFriend' in profile)) return profile;

		if (
			!canExposeUserToViewer(
				{ id: profile.id, status: profile.status },
				{
					id: requesterId,
					role: params.requesterRole,
					status: requesterStatus,
				},
			)
		) {
			throw new NotFoundError('Profile not found');
		}

		if (profile.status === 'banned') return withoutSocialRelation(profile);

		const relation = await friendsContract.selectRelation(requesterId, id);

		return {
			...profile,
			isFriend: relation.friends,
			hasBlockedRequester: relation.blockedBy !== null,
			isBlockedByRequester: relation.blockedId !== null,
			isFriendRequester: relation.requestSentByUserId === requesterId,
			hasIncomingFriendRequest: relation.requestSentByUserId === id,
		};
	};
}
