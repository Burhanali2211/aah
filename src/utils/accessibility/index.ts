/**
 * Unified Accessibility Utilities Module
 * Refactored into modular parts for better maintainability.
 */

export * from './parts/constants';
export * from './parts/hooks';
export * from './parts/utils';

// Default export for backward compatibility
import { ARIA_ROLES, ARIA_STATES, ARIA_PROPERTIES, CONTRAST_RATIOS } from './parts/constants';
import { useAccessibilityPreferences, useFocusManagement, useScreenReaderAnnouncements, useKeyboardNavigationHook, useKeyboardNavigation } from './parts/hooks';
import { colorContrast, ariaUtils, skipLinks, accessibilityTest } from './parts/utils';

export default {
  ARIA_ROLES,
  ARIA_STATES,
  ARIA_PROPERTIES,
  CONTRAST_RATIOS,
  useAccessibilityPreferences,
  useFocusManagement,
  useScreenReaderAnnouncements,
  useKeyboardNavigationHook,
  useKeyboardNavigation,
  colorContrast,
  ariaUtils,
  skipLinks,
  accessibilityTest,
};
