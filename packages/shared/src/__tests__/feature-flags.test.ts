import { describe, it, expect } from 'vitest';
import { featureFlags, isFeatureEnabled } from '../feature-flags';

describe('feature flags', () => {
  it('should have expected flags defined', () => {
    expect(featureFlags).toHaveProperty('donations');
    expect(featureFlags).toHaveProperty('smsLogin');
    expect(featureFlags).toHaveProperty('pushNotifications');
  });

  it('isFeatureEnabled returns boolean for valid flags', () => {
    const result = isFeatureEnabled('donations');
    expect(typeof result).toBe('boolean');
  });

  it('all feature flags should be booleans', () => {
    const flags = Object.values(featureFlags);
    for (const flag of flags) {
      expect(typeof flag).toBe('boolean');
    }
  });

  it('should have donations enabled by default', () => {
    expect(isFeatureEnabled('donations')).toBe(true);
  });

  it('should have smsLogin disabled by default', () => {
    expect(isFeatureEnabled('smsLogin')).toBe(false);
  });

  it('should have pushNotifications disabled by default', () => {
    expect(isFeatureEnabled('pushNotifications')).toBe(false);
  });
});
