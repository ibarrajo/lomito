import { useMemo } from 'react';
import { trackEvent, trackPageView, setUserProperties } from '../lib/analytics';

export function useAnalytics() {
  return useMemo(() => ({ trackEvent, trackPageView, setUserProperties }), []);
}
