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
  identifyUser,
  setUserProperties,
  resetAnalytics,
  _resetForTesting,
  _getEventQueue,
} from '../analytics';

/** Parse the JSON body from the nth fetch call. */
function getFetchBody(callIndex = 0): Record<string, unknown> {
  const call = fetchMock.mock.calls[callIndex] as unknown[];
  const init = call[1] as { body: string };
  return JSON.parse(init.body) as Record<string, unknown>;
}

type EventPayload = {
  name: string;
  params?: Record<string, string>;
};

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

      // Queue has session_start + the actual event
      const queue = _getEventQueue();
      const userEvent = queue.find((e) => e.name === 'test_event');
      expect(userEvent).toBeDefined();
      expect(userEvent!.params).toMatchObject({ key: 'value' });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('batches multiple events into a single request', () => {
      trackEvent('event_1');
      trackEvent('event_2');
      trackEvent('event_3');

      expect(fetchMock).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2000);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const body = getFetchBody();
      const events = body.events as EventPayload[];
      const userEvents = events.filter((e) => e.name.startsWith('event_'));
      expect(userEvents).toHaveLength(3);
      expect(userEvents[0].name).toBe('event_1');
      expect(userEvents[2].name).toBe('event_3');
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

      // At least one flush should have happened
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    it('sends to correct Supabase edge function URL', () => {
      trackEvent('url_test');
      vi.advanceTimersByTime(2000);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://test.supabase.co/functions/v1/track-event',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
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

      // Check that client_id was persisted (among other localStorage writes for session)
      const setItemCalls = localStorageMock.setItem.mock.calls as string[][];
      const clientIdCall = setItemCalls.find(
        (c) => c[0] === 'lomito_analytics_client_id',
      );
      expect(clientIdCall).toBeDefined();
      expect(typeof clientIdCall![1]).toBe('string');
    });

    it('reuses client_id from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'lomito_analytics_client_id') return 'existing-client-id';
        return null;
      });
      trackEvent('reuse_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.client_id).toBe('existing-client-id');
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
      const events = body.events as EventPayload[];
      const userEvents = events.filter((e) => e.name !== 'session_start');
      expect(userEvents).toHaveLength(2);
    });
  });

  describe('GA4 session management', () => {
    it('emits session_start as the first event', () => {
      trackEvent('after_session');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      expect(events[0].name).toBe('session_start');
    });

    it('includes session_id on every event', () => {
      trackEvent('session_check');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      for (const event of events) {
        expect(event.params?.session_id).toBeDefined();
        // session_id should be a numeric string (epoch seconds)
        expect(Number(event.params!.session_id)).toBeGreaterThan(0);
      }
    });

    it('includes engagement_time_msec on every event', () => {
      trackEvent('engagement_check');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      for (const event of events) {
        expect(event.params?.engagement_time_msec).toBeDefined();
        expect(
          Number(event.params!.engagement_time_msec),
        ).toBeGreaterThanOrEqual(0);
      }
    });

    it('persists session_id to localStorage', () => {
      trackEvent('persist_session');
      vi.advanceTimersByTime(2000);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lomito_ga4_session_id',
        expect.any(String),
      );
    });

    it('restores a valid session from localStorage', () => {
      const now = Date.now();
      const sessionId = String(Math.floor(now / 1000));
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'lomito_ga4_session_id') return sessionId;
        if (key === 'lomito_ga4_session_last_active') return String(now - 1000); // 1s ago — still valid
        return null;
      });

      trackEvent('restored_event');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      // Should NOT have session_start since session was restored
      const sessionStarts = events.filter((e) => e.name === 'session_start');
      expect(sessionStarts).toHaveLength(0);
      // session_id should match the stored one
      expect(events[0].params?.session_id).toBe(sessionId);
    });

    it('starts a new session when previous one timed out', () => {
      const now = Date.now();
      const oldSessionId = '1000000000';
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'lomito_ga4_session_id') return oldSessionId;
        if (key === 'lomito_ga4_session_last_active')
          return String(now - 31 * 60 * 1000); // 31 min ago — expired
        return null;
      });

      trackEvent('new_session_event');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      // Should have session_start since old session timed out
      expect(events[0].name).toBe('session_start');
      // session_id should be different from the expired one
      expect(events[0].params?.session_id).not.toBe(oldSessionId);
    });

    it('reuses the same session_id across multiple events', () => {
      trackEvent('event_a');
      trackEvent('event_b');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      const sessionIds = new Set(events.map((e) => e.params?.session_id));
      expect(sessionIds.size).toBe(1);
    });
  });

  describe('trackPageView', () => {
    it('sends page_view event with page_path param', () => {
      trackPageView('/home');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      const events = body.events as EventPayload[];
      const pageView = events.find((e) => e.name === 'page_view');
      expect(pageView).toBeDefined();
      expect(pageView!.params).toMatchObject({ page_path: '/home' });
    });
  });

  describe('user identification', () => {
    it('includes user_id in payload when identified', () => {
      identifyUser('user-123');
      trackEvent('id_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.user_id).toBe('user-123');
    });

    it('includes user_properties when set', () => {
      identifyUser('user-456');
      setUserProperties({ role: 'citizen', municipality: 'Tijuana' });
      trackEvent('props_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.user_properties).toEqual({
        role: { value: 'citizen' },
        municipality: { value: 'Tijuana' },
      });
    });

    it('clears user data after resetAnalytics', () => {
      identifyUser('user-789');
      setUserProperties({ role: 'admin' });
      resetAnalytics();
      trackEvent('reset_test');
      vi.advanceTimersByTime(2000);

      const body = getFetchBody();
      expect(body.user_id).toBeUndefined();
      expect(body.user_properties).toBeUndefined();
    });
  });

  describe('platform guard', () => {
    it('does not queue events on non-web platform', () => {
      const originalOS = Platform.OS;
      (Platform as { OS: string }).OS = 'ios';

      _resetForTesting(); // reset queue
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
