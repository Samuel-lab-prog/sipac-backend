/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface DomainEvents {
	NEW_FRIEND: {
		newFriendId: number;
		newFriendNickname: string;
		actorAvatarUrl?: string | null;
		userId: number;
	};
	NEW_FRIEND_REQUEST: {
		requesterNickname: string;
		requesterId: number;
		actorAvatarUrl?: string | null;
		recipientId: number;
	};
	POEM_LIKED: {
		userId: number;
		poemId: number;
		likerId: number;
		likerNickname: string;
		actorAvatarUrl?: string | null;
	};
	COMMENT_LIKED: {
		userId: number;
		commentId: number;
		likerId: number;
		likerNickname: string;
		actorAvatarUrl?: string | null;
	};
	POEM_COMMENT_CREATED: {
		commentId: number;
		poemId: number;
		poemTitle: string;
		authorId: number;
		commenterId: number;
		commenterNickname: string;
		actorAvatarUrl?: string | null;
	};
	POEM_COMMENT_REPLIED: {
		commentId: number;
		parentCommentId: number;
		poemId: number;
		replierId: number;
		originalCommenterId: number;
		replierNickname: string;
		poemTitle: string;
		actorAvatarUrl?: string | null;
	};
	POEM_DEDICATED: {
		poemId: number;
		poemTitle: string;
		dedicatorId: number;
		dedicatorNickname: string;
		actorAvatarUrl?: string | null;
		userId: number;
	};
	USER_MENTION_IN_POEM: {
		poemId: number;
		poemTitle: string;
		mentionerId: number;
		mentionerNickname: string;
		actorAvatarUrl?: string | null;
		userId: number;
	};
	POEM_APPROVED: {
		poemId: number;
		poemTitle: string;
		authorId: number;
		authorNickname: string;
		actorAvatarUrl?: string | null;
	};
	POEM_REJECTED: {
		poemId: number;
		poemTitle: string;
		authorId: number;
		authorNickname: string;
		actorAvatarUrl?: string | null;
		reason?: string;
	};
	POEM_REMOVED: {
		poemId: number;
		poemTitle: string;
		authorId: number;
		authorNickname: string;
		actorAvatarUrl?: string | null;
		reason?: string;
	};
}

export type EventName = keyof DomainEvents;
export type Entity = 'POEM' | 'COMMENT' | 'USER';

type EventPayload<N extends EventName> = DomainEvents[N];

type EventHandler<N extends EventName> = (
	payload: EventPayload<N>,
) => Promise<void> | void;

type Unsubscribe = () => void;

export interface EventBus {
	publish<N extends EventName>(
		name: N,
		payload: EventPayload<N>,
	): Promise<void>;

	subscribe<N extends EventName>(
		name: N,
		handler: EventHandler<N>,
	): Unsubscribe;

	once<N extends EventName>(name: N, handler: EventHandler<N>): Unsubscribe;
}

export function createInMemoryEventBus(): EventBus {
	const handlers: Record<string, Set<Function>> = {};

	async function publish<N extends EventName>(
		name: N,
		payload: EventPayload<N>,
	): Promise<void> {
		const set = handlers[name];

		if (!set || set.size === 0) return;

		const list = Array.from(set);

		for (const handler of list) await (handler as EventHandler<N>)(payload);
	}

	function subscribe<N extends EventName>(
		name: N,
		handler: EventHandler<N>,
	): Unsubscribe {
		const set = handlers[name] ?? new Set<Function>();

		set.add(handler);
		handlers[name] = set;

		return () => set.delete(handler);
	}

	function once<N extends EventName>(
		name: N,
		handler: EventHandler<N>,
	): Unsubscribe {
		const unsubscribe = subscribe(name, async (payload) => {
			unsubscribe();
			await handler(payload);
		});

		return unsubscribe;
	}

	return {
		publish,
		subscribe,
		once,
	};
}

export const eventBus = createInMemoryEventBus();
