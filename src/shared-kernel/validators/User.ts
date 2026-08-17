import type { UserBasicInfo } from '@Domains/users-management/public/Index';
import type { UserRole, UserStatus } from '@SharedKernel/Enums';
import { ForbiddenError, NotFoundError } from '@DomainError';

export function user(user: Omit<UserBasicInfo, 'nickname'>) {
	if (!user.exists)
		throw new NotFoundError(`User with id ${user.id} not found`);
	return {
		withStatus(allowedStatuses: UserStatus[], msg?: string) {
			if (!allowedStatuses.includes(user.status))
				throw new ForbiddenError(
					msg || `User with status ${user.status} cannot perform this action`,
				);
			return this;
		},
		withRole(allowedRoles: UserRole[], msg?: string) {
			if (!allowedRoles.includes(user.role))
				throw new ForbiddenError(
					msg || `User with role ${user.role} cannot perform this action`,
				);
			return this;
		},
	};
}
