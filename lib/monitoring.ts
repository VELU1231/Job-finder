/**
 * Monitoring & Logging Utilities
 * 
 * Provides consistent error tracking, performance monitoring, and audit logging
 * for the JobFinder platform.
 */

interface LogContext {
  timestamp: Date;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  endpoint?: string;
  userId?: string;
  duration?: number;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Central logging sink
 * In production, this should integrate with:
 * - Sentry for error tracking
 * - LogRocket for session replay
 * - DataDog for metrics
 * - CloudWatch for infrastructure
 */
export function logEvent(context: LogContext): void {
  const formatted = JSON.stringify({
    timestamp: context.timestamp.toISOString(),
    level: context.level,
    service: context.service,
    endpoint: context.endpoint,
    duration_ms: context.duration,
    message: context.message,
    ...context.metadata
  });

  if (process.env.NODE_ENV === "production") {
    // Send to Sentry, DataDog, etc.
    console.log(formatted);
  } else {
    // Local development
    const color = {
      info: "\x1b[36m",    // cyan
      warn: "\x1b[33m",    // yellow
      error: "\x1b[31m",   // red
      debug: "\x1b[35m"    // magenta
    }[context.level];
    const reset = "\x1b[0m";
    console.log(`${color}[${context.level.toUpperCase()}]${reset} ${formatted}`);
  }
}

/**
 * API response timing middleware
 * Tracks request duration and logs slow endpoints
 */
export function trackEndpointPerformance(
  endpoint: string,
  duration: number,
  statusCode: number
): void {
  const slow = duration > 1000;
  const level = statusCode >= 500 ? "error" : slow ? "warn" : "info";

  logEvent({
    timestamp: new Date(),
    level,
    service: "api",
    endpoint,
    duration,
    message: `${endpoint} ${statusCode} ${duration}ms`
  });
}

/**
 * Fetcher health tracking
 * Logs per-source sync results for monitoring dashboards
 */
export function logFetcherResult(
  source: string,
  result: {
    fetched: number;
    upserted: number;
    failed: number;
    duration: number;
    error?: string;
  }
): void {
  logEvent({
    timestamp: new Date(),
    level: result.error ? "error" : "info",
    service: "fetcher",
    message: `${source} sync completed`,
    metadata: {
      source,
      fetched: result.fetched,
      upserted: result.upserted,
      failed: result.failed,
      duration_ms: result.duration,
      error: result.error
    }
  });
}

/**
 * Database operation tracking
 * Monitor query performance and connection health
 */
export function logDatabaseOperation(
  operation: "query" | "insert" | "update" | "delete" | "upsert",
  table: string,
  duration: number,
  rowsAffected: number,
  error?: string
): void {
  const level = error ? "error" : duration > 500 ? "warn" : "debug";

  logEvent({
    timestamp: new Date(),
    level,
    service: "database",
    message: `${operation} on ${table}`,
    metadata: {
      operation,
      table,
      rows_affected: rowsAffected,
      duration_ms: duration,
      error
    }
  });
}

/**
 * Security event logging
 * Track authentication, authorization, and security boundaries
 */
export function logSecurityEvent(
  event: "auth_failed" | "auth_success" | "invalid_token" | "rate_limit" | "invalid_input",
  details: {
    endpoint: string;
    userId?: string;
    reason?: string;
    ip?: string;
  }
): void {
  logEvent({
    timestamp: new Date(),
    level: "warn",
    service: "security",
    endpoint: details.endpoint,
    userId: details.userId,
    message: `Security event: ${event}`,
    metadata: {
      event,
      reason: details.reason,
      ip: details.ip
    }
  });
}

/**
 * Cache hit/miss tracking
 * Monitor Redis effectiveness
 */
export function logCacheEvent(
  key: string,
  hit: boolean,
  duration: number
): void {
  logEvent({
    timestamp: new Date(),
    level: "debug",
    service: "cache",
    duration,
    message: `Cache ${hit ? "hit" : "miss"} for ${key}`,
    metadata: { key, hit }
  });
}

/**
 * Error boundary for unhandled exceptions
 * Ensures all errors are logged consistently
 */
export function logUnhandledError(
  error: Error | unknown,
  context: {
    endpoint?: string;
    userId?: string;
    action?: string;
  }
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logEvent({
    timestamp: new Date(),
    level: "error",
    service: "app",
    endpoint: context.endpoint,
    userId: context.userId,
    message: `Unhandled error: ${message}`,
    metadata: {
      action: context.action,
      stack,
      error: String(error)
    }
  });
}

/**
 * Health check metrics
 * Aggregates system status for monitoring dashboards
 */
export interface SystemHealth {
  status: "healthy" | "degraded" | "critical";
  services: {
    api: { status: string; latency_ms: number };
    database: { status: string; connections: number };
    cache: { status: string; hit_rate: number };
    fetchers: { status: string; last_sync: string };
  };
  timestamp: string;
}

export function getSystemHealthStatus(): SystemHealth {
  // This would be populated by real metrics in production
  return {
    status: "healthy",
    services: {
      api: { status: "operational", latency_ms: 45 },
      database: { status: "operational", connections: 12 },
      cache: { status: "operational", hit_rate: 0.87 },
      fetchers: { status: "operational", last_sync: new Date().toISOString() }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Alert thresholds for production monitoring
 * Configure in Sentry, PagerDuty, or monitoring platform
 */
export const ALERT_THRESHOLDS = {
  API_RESPONSE_TIME_MS: 2000,      // Alert if endpoint > 2s
  DATABASE_QUERY_TIME_MS: 1000,    // Alert if query > 1s
  FETCHER_TIMEOUT_MS: 30000,       // Alert if fetcher > 30s
  ERROR_RATE_THRESHOLD: 0.05,      // Alert if error rate > 5%
  CACHE_HIT_RATE_MIN: 0.75,        // Alert if cache hit rate < 75%
  MEMORY_USAGE_MB: 900              // Alert if memory > 900MB
} as const;

/**
 * Structured metric export for dashboards
 * Format for Prometheus, CloudWatch, or custom dashboard
 */
export function exportMetrics(): string {
  return `
# HELP jobfinder_api_requests_total Total API requests
# TYPE jobfinder_api_requests_total counter

# HELP jobfinder_api_response_time_ms API response time in milliseconds
# TYPE jobfinder_api_response_time_ms histogram

# HELP jobfinder_database_operations_total Total database operations
# TYPE jobfinder_database_operations_total counter

# HELP jobfinder_fetcher_jobs_synced_total Total jobs synced per source
# TYPE jobfinder_fetcher_jobs_synced_total counter

# HELP jobfinder_cache_hits_total Total cache hits
# TYPE jobfinder_cache_hits_total counter

# HELP jobfinder_errors_total Total errors by type
# TYPE jobfinder_errors_total counter
`;
}
