import './load-local-env';
import { validateServerEnv } from '../src/server-config/utils/validateEnv';

try {
	validateServerEnv({ silent: false });
} catch (error) {
	if (error instanceof Error) {
		console.error(`${error.name}: ${error.message}`);
	} else {
		console.error('Env check failed.');
	}
	process.exit(1);
}
