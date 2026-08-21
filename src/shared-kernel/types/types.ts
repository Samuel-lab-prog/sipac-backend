import type { ErrorCode } from '@GenericSubdomains/utils/error-handling/errorCodes';
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
