import type { ErrorCode } from '../../generic-subdomains/utils/error-handling/error-codes';

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
