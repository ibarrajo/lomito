import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Platform } from 'react-native';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock fetch
const fetchMock = vi.fn(() =>
  Promise.resolve(new Response(null, { status: 204 })),
);
vi.stubGlobal('fetch', fetchMock);

import {
  trackEvent,
  trackPageView,
  _resetForTesting,
  _getEventQueue,
} from '../analytics';

/** Parse the JSON body from the nth fetch call. */
function getFetchBody(callIndex = 0): Record<string, unknown> {
  const call = fetchMock.mock.calls[callIndex] as unknown[];
  const init = call[1] as { body: string };
  return JSON.parse(init.body) as Record<string, unknown>;
}

describe('analytics client', () => {
  beforeEach(() => {
    _resetForTesting();
    fetchMock.mockClear();
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('trackEvent', () => {
    it('queues events without immediate flush', () => {
      trackEvent('test_event', { key: 'value' });

      expect(_getEventQueue()).toHaveLength(1);
      expect(_getEventQueue()[0]).toEqual({
        name: 'test_event',
        params: { key: 'value' },
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('batches multiple events into a single request', () => {
      trackEvent('event_1');
      trackEvent('event_2');
      trackEvent('event_3');

      expect(_getEventQueue()).toHaveLength(3);
      expect(fetchMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = getFetchBody();
      expect(body.events).toHaveLength(3);
      expect((body.events as Array<{ name: string }>)[0].name).toBe('event_1');
      expect((body.events as Array<{ name: string }>)[2].name).toBe('event_3');
    });

    it('flushes after 2 second batch interval', () => {
      trackEvent('delayed_event');

      vi.advanceTimersByTime(1999);
      expect(fetchMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('flushes immediately when batch reaches max size (25)', () => {
      for (let i = 0; i < 25; i++) {
        trackEvent(`event_${i}`);
      }

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = getFetchBody();
      expect(body.events).toHaveLength(25);
      expect(_getEventQueue()).toHaveLength(0);
    });

    it('sends to correct Supabase edge function URL', () => {
      trackEvent('url_test');
      vi.advanceTimersByTime(2000);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/track-event',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('includes a client_id in the payload', () => {
      trackEvent('client_id_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.client_id).toBeDefined();
      expect(typeof body.client_id).toBe('string');
      expect((body.client_id as string).length).toBeGreaterThan(0);
    });

    it('persists client_id to localStorage', () => {
      trackEvent('persist_test');
      vi.advanceTimersByTime(2000);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lomito_analytics_client_id',
        expect.any(String),
      );
    });

    it('reuses client_id from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('existing-client-id');
      trackEvent('reuse_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.client_id).toBe('existing-client-id');
    });

    it('accepts events without params', () => {
      trackEvent('no_params');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as Array<{
        name: string;
        params?: Record<string, string>;
      }>;
      expect(events[0]).toEqual({ name: 'no_params', params: undefined });
    });

    it('clears queue after flush', () => {
      trackEvent('clear_test');
      vi.advanceTimersByTime(2000);

      expect(_getEventQueue()).toHaveLength(0);
    });

    it('does not double-flush for events queued during batch interval', () => {
      trackEvent('first');
      vi.advanceTimersByTime(1000);
      trackEvent('second');
      vi.advanceTimersByTime(1000);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = getFetchBody();
      expect(body.events).toHaveLength(2);
    });
  });

  describe('trackPageView', () => {
    it('sends page_view event with page_path param', () => {
      trackPageView('/home');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as Array<{
        name: string;
        params?: Record<string, string>;
      }>;
      expect(events[0]).toEqual({
        name: 'page_view',
        params: { page_path: '/home' },
      });
    });
  });

  describe('platform guard', () => {
    it('does not queue events on non-web platform', () => {
      const originalOS = Platform.OS;
      (Platform as { OS: string }).OS = 'ios';

      trackEvent('should_be_ignored');
      expect(_getEventQueue()).toHaveLength(0);

      (Platform as { OS: string }).OS = originalOS;
    });
  });

  describe('error handling', () => {
    it('does not throw when fetch fails', () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      trackEvent('error_test');
      vi.advanceTimersByTime(2000);

      expect(_getEventQueue()).toHaveLength(0);
    });
  });
});
