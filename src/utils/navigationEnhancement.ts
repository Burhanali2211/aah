/**
 * Navigation Enhancement Utilities (Deprecated)
 *
 * For backward compatibility, this file now re-exports from the unified navigation module.
 * New code should import directly from '../hooks/useNavigation'
 */

export type {
  NavigationItem,
  RouteGuard,
  NavigationState,
  BreadcrumbItem,
  NavigationAnalytics
} from '../hooks/useNavigation';
