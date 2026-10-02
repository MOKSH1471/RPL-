import logger from './logger.js';
import pool from './db.js';

/**
 * Connection Pool Monitor & Keep-Alive Ping (Aashray Standard)
 * - Periodically tests database connectivity with a lightweight ping
 * - Keeps TCP sockets warm to prevent cloud timeouts (TiDB / Render)
 * - Tracks connection pool pressure and logs warnings before exhaustion
 */
export class ConnectionMonitor {
  constructor(intervalMs = 60000) {
    this.intervalMs = intervalMs;
    this.monitoringInterval = null;
    this.isMonitoring = false;
  }

  start() {
    if (this.isMonitoring) {
      logger.warn('[CONNECTION MONITOR] Monitor is already running');
      return;
    }

    this.isMonitoring = true;
    logger.info('[CONNECTION MONITOR] Starting database connection pool monitoring & keep-alive');

    this.monitoringInterval = setInterval(() => {
      this.checkConnectionPool();
    }, this.intervalMs);

    // Initial check
    this.checkConnectionPool();
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('[CONNECTION MONITOR] Connection pool monitoring stopped');
  }

  async checkConnectionPool() {
    try {
      // 1. Keep-alive ping query
      const start = Date.now();
      await pool.query('SELECT 1 AS keepalive');
      const pingMs = Date.now() - start;

      // 2. Inspect underlying mysql2 pool state if available
      const rawPool = pool.pool;
      const status = {
        allConnections: rawPool?._allConnections?.length ?? 'N/A',
        freeConnections: rawPool?._freeConnections?.length ?? 'N/A',
        queuedQueries: rawPool?._connectionQueue?.length ?? 0,
        pingMs,
        timestamp: new Date().toISOString(),
      };

      if (status.queuedQueries > 0) {
        logger.warn(`[CONNECTION MONITOR] Pool has queued requests waiting: ${status.queuedQueries}`, status);
      }

      if (pingMs > 2000) {
        logger.warn(`[CONNECTION MONITOR] Slow database ping: ${pingMs}ms`, status);
      }

      // Log status periodically (every 10 minutes)
      if (Date.now() % 600000 < this.intervalMs) {
        logger.info(`[CONNECTION MONITOR] Pool health OK (ping: ${pingMs}ms)`, status);
      }
    } catch (err) {
      logger.error(`[CONNECTION MONITOR ERROR] Database ping failed: ${err.message}`, {
        code: err.code,
        errno: err.errno,
      });
    }
  }

  async testConnection() {
    try {
      await pool.query('SELECT 1');
      logger.info('[CONNECTION MONITOR] Database connection test successful');
      return true;
    } catch (err) {
      logger.error(`[CONNECTION MONITOR] Database connection test failed: ${err.message}`);
      return false;
    }
  }
}

const connectionMonitor = new ConnectionMonitor();
export default connectionMonitor;
