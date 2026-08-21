export interface DomainEvents {
	NEW_FRIEND: {
		newFriendId: number;
		newFriendNickname: string;
		actorAvatarUrl?: string | null;
		userId: number;
	};
}
