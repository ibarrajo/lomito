/**
 * Feature flags for MVP.
 * Toggle features on/off without code changes.
 * In the future, these can be driven by remote config.
 */
export const featureFlags = {
  /** Enable the donations page and donate nav links */
  donations: false,
  /** Enable SMS/phone login tab on auth screens */
  smsLogin: false,
  /** Enable push notifications settings */
  pushNotifications: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
