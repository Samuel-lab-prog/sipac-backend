import type { ErrorCode } from '../../generic-subdomains/utils/error-handling/error-codes';
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
