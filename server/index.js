/**
 * Server Entrypoint Forwarder
 * Delegates directly to the canonical API service in apps/api/index.js
 * Ensures complete backwards compatibility with Render deployment hooks
 * while eliminating duplicate server maintenance.
 */
import app from '../apps/api/index.js';

export default app;
