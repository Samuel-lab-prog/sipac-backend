/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import type { DomainEvents } from './domain-events';

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
	) {
		const set = handlers[name];
		if (!set || set.size === 0) return;
		for (const handler of Array.from(set))
			await (handler as EventHandler<N>)(payload);
	}
	function subscribe<N extends EventName>(name: N, handler: EventHandler<N>) {
		const set = handlers[name] ?? new Set<Function>();
		set.add(handler);
		handlers[name] = set;
		return () => set.delete(handler);
	}
	function once<N extends EventName>(name: N, handler: EventHandler<N>) {
		const unsubscribe = subscribe(name, async (payload) => {
			unsubscribe();
			await handler(payload);
		});
		return unsubscribe;
	}
	return { publish, subscribe, once };
}
