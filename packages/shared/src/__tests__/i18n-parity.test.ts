import { describe, it, expect } from 'vitest';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return getKeys(value as Record<string, unknown>, fullKey);
    }
    return [fullKey];
  });
}

describe('i18n parity', () => {
  it('en.json and es.json should have identical keys', () => {
    const enKeys = getKeys(en).sort();
    const esKeys = getKeys(es).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('no empty translation values in en.json', () => {
    const enKeys = getKeys(en);
    for (const key of enKeys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = key.split('.').reduce((obj: any, k) => obj[k], en);
      expect(value, `en.json key "${key}" is empty`).not.toBe('');
    }
  });

  it('no empty translation values in es.json', () => {
    const esKeys = getKeys(es);
    for (const key of esKeys) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = key.split('.').reduce((obj: any, k) => obj[k], es);
      expect(value, `es.json key "${key}" is empty`).not.toBe('');
    }
  });
});
