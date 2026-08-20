/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface DomainEvents {
	NEW_FRIEND: {
		newFriendId: number;
		newFriendNickname: string;
		actorAvatarUrl?: string | null;
		userId: number;
	};
}

export type EventName = keyof DomainEvents;

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
