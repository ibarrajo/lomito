import { useMemo } from 'react';
import { trackEvent, trackPageView } from '../lib/analytics';

export function useAnalytics() {
  return useMemo(() => ({ trackEvent, trackPageView }), []);
}
