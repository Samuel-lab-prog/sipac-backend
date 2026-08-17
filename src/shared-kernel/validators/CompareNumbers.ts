import { ForbiddenError } from '@DomainError';

export function compareIds(id1: number, id2: number) {
	return {
		sameOwner(msg?: string) {
			if (id1 !== id2)
				throw new ForbiddenError(msg ?? `Only owners can perform this action`);
			return this;
		},
		differentOwner(msg?: string) {
			if (id1 === id2)
				throw new ForbiddenError(msg ?? `Owners cannot perform this action`);
			return this;
		},
	};
}
