import { user } from './User';
import { poem } from './Poem';
import { relation } from './UsersRelation';
import { compareIds } from './CompareNumbers';
import { ensure } from './Esnure';
import { comment } from './Comment';
import { ForbiddenError } from '@DomainError';

function sameOwner(id1: number, id2: number) {
	if (id1 !== id2)
		throw new ForbiddenError(`Only owners can perform this action`);
}
function differentOwner(id1: number, id2: number) {
	if (id1 === id2)
		throw new ForbiddenError(`Owners cannot perform this action`);
}

export function validator() {
	return {
		user,
		poem,
		relation,
		compareIds,
		ensure,
		comment,
		sameOwner,
		differentOwner,
	};
}
