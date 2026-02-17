import { vi } from 'vitest';

const store: Record<string, string> = {};

export default {
  getItem: vi.fn((key: string) => Promise.resolve(store[key] ?? null)),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
    return Promise.resolve();
  }),
};
