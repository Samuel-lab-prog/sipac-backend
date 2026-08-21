import './load-local-env';
import { validateServerEnv } from '../src/server-config/utils/validateEnv';

try {
	validateServerEnv({ silent: false });
} catch (error) {
	console.error(error);
	process.exit(1);
}
