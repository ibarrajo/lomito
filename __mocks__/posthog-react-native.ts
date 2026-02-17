import { vi } from 'vitest';

export default class PostHog {
  constructor(_apiKey: string, _options?: Record<string, unknown>) {}

  async ready(): Promise<void> {}
  capture = vi.fn();
  identify = vi.fn();
  reset = vi.fn();
}
