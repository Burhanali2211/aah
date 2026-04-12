/**
 * Advanced Theme System
 * Refactored into modular parts for better maintainability.
 */

export * from './theme/types';
export * from './theme/constants';
export * from './theme/utils';
export * from './theme/useAdvancedTheme';

// Re-export for potential default usage
import { useAdvancedTheme } from './theme/useAdvancedTheme';
export default useAdvancedTheme;
