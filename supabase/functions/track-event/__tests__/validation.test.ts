import { describe, it, expect } from 'vitest';
import { corsHeaders, isValidPayload, ALLOWED_ORIGINS, MAX_EVENTS_PER_REQUEST } from '../validation';

describe('corsHeaders', () => {
  it('returns CORS headers for allowed origin lomito.org', () => {
    const headers = corsHeaders('https://lomito.org');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://lomito.org');
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
  });

  it('returns CORS headers for www.lomito.org', () => {
    const headers = corsHeaders('https://www.lomito.org');
    expect(headers['Access-Control-Allow-Origin']).toBe('https://www.lomito.org');
  });

  it('returns CORS headers for localhost:8081', () => {
    const headers = corsHeaders('http://localhost:8081');
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:8081');
  });

  it('returns CORS headers for localhost:19006', () => {
    const headers = corsHeaders('http://localhost:19006');
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:19006');
  });

  it('returns empty headers for disallowed origin', () => {
    const headers = corsHeaders('https://evil.com');
    expect(headers).toEqual({});
    expect(headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('returns empty headers for empty origin', () => {
    const headers = corsHeaders('');
    expect(headers).toEqual({});
  });

  it('does not allow http lomito.org (must be https)', () => {
    const headers = corsHeaders('http://lomito.org');
    expect(headers).toEqual({});
  });

  it('has correct allowed origins list', () => {
    expect(ALLOWED_ORIGINS).toContain('https://lomito.org');
    expect(ALLOWED_ORIGINS).toContain('https://www.lomito.org');
    expect(ALLOWED_ORIGINS).toContain('http://localhost:8081');
    expect(ALLOWED_ORIGINS).toContain('http://localhost:19006');
  });
});

describe('isValidPayload', () => {
  it('accepts a valid payload with one event', () => {
    const payload = {
      client_id: 'abc-123',
      events: [{ name: 'page_view' }],
    };
    expect(isValidPayload(payload)).toBe(true);
  });

  it('accepts a valid payload with events that have params', () => {
    const payload = {
      client_id: 'abc-123',
      events: [
        { name: 'cta_click', params: { label: 'report_now' } },
        { name: 'page_view', params: { page_path: '/home' } },
      ],
    };
    expect(isValidPayload(payload)).toBe(true);
  });

  it('accepts payload at max events limit', () => {
    const events = Array.from({ length: MAX_EVENTS_PER_REQUEST }, (_, i) => ({
      name: `event_${i}`,
    }));
    expect(isValidPayload({ client_id: 'test', events })).toBe(true);
  });

  // Rejection cases

  it('rejects null', () => {
    expect(isValidPayload(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidPayload(undefined)).toBe(false);
  });

  it('rejects string', () => {
    expect(isValidPayload('hello')).toBe(false);
  });

  it('rejects number', () => {
    expect(isValidPayload(42)).toBe(false);
  });

  it('rejects empty object', () => {
    expect(isValidPayload({})).toBe(false);
  });

  it('rejects missing client_id', () => {
    expect(isValidPayload({ events: [{ name: 'test' }] })).toBe(false);
  });

  it('rejects empty client_id', () => {
    expect(isValidPayload({ client_id: '', events: [{ name: 'test' }] })).toBe(false);
  });

  it('rejects numeric client_id', () => {
    expect(isValidPayload({ client_id: 123, events: [{ name: 'test' }] })).toBe(false);
  });

  it('rejects missing events', () => {
    expect(isValidPayload({ client_id: 'abc' })).toBe(false);
  });

  it('rejects empty events array', () => {
    expect(isValidPayload({ client_id: 'abc', events: [] })).toBe(false);
  });

  it('rejects events that is not an array', () => {
    expect(isValidPayload({ client_id: 'abc', events: 'not-array' })).toBe(false);
  });

  it('rejects events exceeding max limit', () => {
    const events = Array.from({ length: MAX_EVENTS_PER_REQUEST + 1 }, (_, i) => ({
      name: `event_${i}`,
    }));
    expect(isValidPayload({ client_id: 'test', events })).toBe(false);
  });

  it('rejects event with missing name', () => {
    expect(isValidPayload({ client_id: 'abc', events: [{}] })).toBe(false);
  });

  it('rejects event with empty name', () => {
    expect(isValidPayload({ client_id: 'abc', events: [{ name: '' }] })).toBe(false);
  });

  it('rejects event with numeric name', () => {
    expect(isValidPayload({ client_id: 'abc', events: [{ name: 123 }] })).toBe(false);
  });

  it('rejects if any event in array is invalid', () => {
    const payload = {
      client_id: 'abc',
      events: [
        { name: 'valid_event' },
        { name: '' }, // invalid
      ],
    };
    expect(isValidPayload(payload)).toBe(false);
  });

  it('rejects null event in array', () => {
    expect(isValidPayload({ client_id: 'abc', events: [null] })).toBe(false);
  });

  it('rejects string event in array', () => {
    expect(isValidPayload({ client_id: 'abc', events: ['not-an-object'] })).toBe(false);
  });
});
