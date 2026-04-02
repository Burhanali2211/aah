/**
 * Google Analytics 4 Service (Deprecated)
 *
 * For backward compatibility, this file now re-exports from the unified tracking module.
 * New code should import directly from '../utils/tracking'
 */

export {
  initGA,
  trackPageView,
  trackEvent,
  trackEcommerce,
  trackUserEngagement,
  setUserProperties,
  trackTiming
} from '../utils/tracking';

