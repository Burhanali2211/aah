/**
 * Unified Navigation Hook
 *
 * Consolidated from:
 * - useEnhancedNavigation.ts (navigation analytics & performance)
 * - navigationEnhancement.ts (types and utilities)
 */

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ==================== NAVIGATION TYPES ====================

// Navigation item interface
export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: React.ReactNode;
  component?: React.ComponentType;
  children?: NavigationItem[];
  permissions?: string[];
  roles?: string[];
  preload?: boolean;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    breadcrumbLabel?: string;
    hideFromNav?: boolean;
    requiresAuth?: boolean;
    requiresRole?: string[];
    cacheStrategy?: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  };
}

// Route guard configuration
export interface RouteGuard {
  id: string;
  name: string;
  check: (route: NavigationItem, user?: any) => Promise<boolean> | boolean;
  redirectTo?: string;
  message?: string;
  priority: number; // Higher priority guards run first
}

// Navigation state
export interface NavigationState {
  currentRoute: NavigationItem | null;
  breadcrumbs: BreadcrumbItem[];
  history: NavigationItem[];
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  error: string | null;
}

// Breadcrumb item
export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

// Navigation analytics
export interface NavigationAnalytics {
  routeVisits: Record<string, number>;
  averageLoadTime: Record<string, number>;
  bounceRate: Record<string, number>;
  userFlow: Array<{ from: string; to: string; timestamp: number }>;
}

// ==================== NAVIGATION HOOKS ====================

/**
 * Hook for managing navigation analytics
 */
export const useNavigationAnalytics = () => {
  const location = useLocation();

  const analytics = useMemo(() => {
    // Get analytics from localStorage or return empty object
    try {
      const stored = localStorage.getItem('nav_analytics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load navigation analytics:', error);
    }
    return {
      routeVisits: {},
      averageLoadTime: {},
      bounceRate: {},
      userFlow: []
    };
  }, []);

  const getPopularRoutes = useCallback((limit: number = 5): NavigationItem[] => {
    // Return empty array for now - can be enhanced later
    return [];
  }, []);

  const getRouteMetrics = useCallback((path: string) => {
    const visits = analytics.routeVisits[path] || 0;
    const avgLoadTime = analytics.averageLoadTime[path] || 0;

    return {
      visits,
      averageLoadTime: avgLoadTime
    };
  }, [analytics]);

  return {
    analytics,
    getPopularRoutes,
    getRouteMetrics
  };
};

/**
 * Hook for navigation performance optimization
 */
export const useNavigationPerformance = () => {
  const preloadRoute = useCallback(async (path: string) => {
    // Stub implementation - can be enhanced later
    // This could preload route components, fetch data, etc.
    return Promise.resolve();
  }, []);

  return {
    preloadRoute
  };
};

/**
 * Main hook that combines navigation analytics and performance
 */
export const useEnhancedNavigation = () => {
  const analytics = useNavigationAnalytics();
  const performance = useNavigationPerformance();

  return {
    ...analytics,
    ...performance
  };
};

// Alias for backward compatibility
export const useNavigation = useEnhancedNavigation;

export default useNavigation;
