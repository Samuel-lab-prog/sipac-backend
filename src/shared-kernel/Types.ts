import type { ErrorCode } from '@GenericSubdomains/utils/error-handling/errorCodes';
import type { UserRole, UserStatus } from './Enums';
export type { ClientAuthCredentials } from '@GenericSubdomains/authentication/ports/models';

export type CommandResult<T> =
	| {
		ok: true;
		data: T;
	}
	| {
		ok: false;
		data: null;
		error?: Error;
		code: ErrorCode;
		message?: string;
	};

export type RequesterContext = {
	requesterId: number;
	requesterRole: UserRole;
	requesterStatus: UserStatus;
};
