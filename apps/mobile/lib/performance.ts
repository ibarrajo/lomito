/**
 * Performance Monitoring Utilities
 * Tools for measuring and logging app performance metrics.
 */

const START_TIME = Date.now();
let coldStartMeasured = false;

interface PerformanceMetric {
  name: string;
  durationMs: number;
  timestamp: number;
}

/**
 * Measures the app cold start time from module initialization to first call.
 * Should be called as early as possible in _layout.tsx.
 */
export function measureColdStart(): number {
  if (coldStartMeasured) {
    console.warn('[Performance] Cold start already measured');
    return 0;
  }

  const durationMs = Date.now() - START_TIME;
  coldStartMeasured = true;

  logPerformanceMetric('cold_start', durationMs);

  return durationMs;
}

/**
 * Measures screen transition duration.
 * Call at the start of navigation and again when screen is fully rendered.
 */
const transitionStartTimes: Record<string, number> = {};

export function measureScreenTransition(
  screenName: string,
  phase: 'start' | 'end' = 'end'
): number | null {
  const now = Date.now();

  if (phase === 'start') {
    transitionStartTimes[screenName] = now;
    return null;
  }

  const startTime = transitionStartTimes[screenName];
  if (!startTime) {
    console.warn(
      `[Performance] No start time found for screen: ${screenName}`
    );
    return null;
  }

  const durationMs = now - startTime;
  delete transitionStartTimes[screenName];

  logPerformanceMetric(`screen_transition_${screenName}`, durationMs);

  return durationMs;
}

/**
 * Logs a performance metric to console (dev) or PostHog (production).
 * Integrates with PostHog when analytics is implemented.
 */
export function logPerformanceMetric(name: string, durationMs: number): void {
  const metric: PerformanceMetric = {
    name,
    durationMs,
    timestamp: Date.now(),
  };

  // In development: log to console
  if (__DEV__) {
    const status = getPerformanceStatus(name, durationMs);
    const emoji = status === 'good' ? '✅' : status === 'warn' ? '⚠️' : '❌';
    console.log(
      `[Performance] ${emoji} ${name}: ${durationMs.toFixed(0)}ms`,
      metric
    );
  }

  // In production: send to PostHog
  // TODO: Integrate with PostHog analytics when implemented
  // posthog.capture('performance_metric', {
  //   metric_name: name,
  //   duration_ms: durationMs,
  // });
}

/**
 * Determines performance status based on metric name and duration.
 */
function getPerformanceStatus(
  name: string,
  durationMs: number
): 'good' | 'warn' | 'poor' {
  const budgets: Record<string, { good: number; warn: number }> = {
    cold_start: { good: 2000, warn: 3000 },
    screen_transition_map: { good: 1500, warn: 2500 },
    screen_transition_default: { good: 1000, warn: 1500 },
  };

  // Match specific metric or use default
  const budget =
    budgets[name] ||
    budgets[`screen_transition_${name}`] ||
    budgets.screen_transition_default;

  if (durationMs <= budget.good) return 'good';
  if (durationMs <= budget.warn) return 'warn';
  return 'poor';
}

/**
 * Performance monitoring object with all measurement methods.
 */
export const PerformanceMonitor = {
  measureColdStart,
  measureScreenTransition,
  logPerformanceMetric,
};
