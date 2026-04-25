import { vi } from 'vitest';

/**
 * Holds the most recently constructed mock instance so tests can spy on
 * .capture() / .identify() / .reset() without needing to plumb the singleton
 * out of the module under test.
 */
export let _latestPostHog: {
  capture: ReturnType<typeof vi.fn>;
  identify: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
} | null = null;

export default class PostHog {
  capture = vi.fn();
  identify = vi.fn();
  reset = vi.fn();

  constructor(_apiKey: string, _options?: Record<string, unknown>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    _latestPostHog = this;
  }

  async ready(): Promise<void> {}
}
