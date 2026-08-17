import 'server-config/utils/envBootstrap'; // Load environment variables from env files.

import { server } from 'Index';
import { SERVER_HOST_NAME, SERVER_PORT } from 'server-config/config';

server.listen({
	hostname: SERVER_HOST_NAME,
	port: SERVER_PORT,
});
