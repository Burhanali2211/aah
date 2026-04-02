/**
 * Unified Mobile Features Hook
 *
 * Consolidated from:
 * - useMobileAuth.ts (mobile authentication management)
 * - useMobileGestures.ts (touch gestures and mobile detection)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMemoryCleanup } from './useMemoryCleanup';
import { performanceMonitor } from '../utils/performance';

// ==================== MOBILE AUTH ====================

/**
 * Hook for managing mobile authentication UI
 */
export const useMobileAuth = () => {
  const {
    isMobileAuthOpen,
    mobileAuthMode,
    openMobileAuth,
    closeMobileAuth
  } = useAuth();

  return {
    isOpen: isMobileAuthOpen,
    mode: mobileAuthMode,
    open: openMobileAuth,
    close: closeMobileAuth
  };
};

// ==================== TOUCH GESTURE DETECTION ====================

// Touch gesture configuration
interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
  preventDefaultTouchmove?: boolean;
  throttleMs?: number;
}

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

// Performance-optimized throttle for touch events
const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Hook for swipe gesture detection with performance optimizations
export const useSwipeGesture = (
  handlers: SwipeHandlers,
  config: SwipeConfig = {}
) => {
  const {
    minSwipeDistance = 50,
    maxSwipeTime = 300,
    preventDefaultTouchmove = true,
    throttleMs = 16, // ~60fps
  } = config;

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const { registerEventListener } = useMemoryCleanup();
  const gestureRef = useRef<HTMLElement | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    performanceMonitor.startMeasure('touch-gesture-start');
    const touch = e.targetTouches[0];
    setTouchEnd(null);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    });
    performanceMonitor.endMeasure('touch-gesture-start');
  }, []);

  const onTouchMove = useCallback(throttle((e: React.TouchEvent) => {
    if (preventDefaultTouchmove) {
      e.preventDefault();
    }
    const touch = e.targetTouches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    });
  }, throttleMs), [preventDefaultTouchmove, throttleMs]);

  const onTouchEnd = useCallback(() => {
    performanceMonitor.startMeasure('touch-gesture-end');

    if (!touchStart || !touchEnd) {
      performanceMonitor.endMeasure('touch-gesture-end');
      return;
    }

    const distance = {
      x: touchEnd.x - touchStart.x,
      y: touchEnd.y - touchStart.y,
    };

    const isLeftSwipe = distance.x < -minSwipeDistance && Math.abs(distance.y) < minSwipeDistance;
    const isRightSwipe = distance.x > minSwipeDistance && Math.abs(distance.y) < minSwipeDistance;
    const isUpSwipe = distance.y < -minSwipeDistance && Math.abs(distance.x) < minSwipeDistance;
    const isDownSwipe = distance.y > minSwipeDistance && Math.abs(distance.x) < minSwipeDistance;
    const time = touchEnd.time - touchStart.time;
    const isValidSwipe = time < maxSwipeTime;

    if (isValidSwipe) {
      if (isLeftSwipe) handlers.onSwipeLeft?.();
      if (isRightSwipe) handlers.onSwipeRight?.();
      if (isUpSwipe) handlers.onSwipeUp?.();
      if (isDownSwipe) handlers.onSwipeDown?.();
    }

    setTouchStart(null);
    setTouchEnd(null);
    performanceMonitor.endMeasure('touch-gesture-end');
  }, [touchStart, touchEnd, minSwipeDistance, maxSwipeTime, handlers]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    gestureRef,
    touchStart,
    touchEnd
  };
};

// ==================== MOBILE DETECTION ====================

/**
 * Hook for detecting mobile device and screen characteristics
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(
      navigator.userAgent
    );
  });

  const [screenWidth, setScreenWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 0;
  });

  const [screenHeight, setScreenHeight] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerHeight : 0;
  });

  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  });

  useEffect(() => {
    const handleResize = throttle(() => {
      setScreenWidth(window.innerWidth);
      setScreenHeight(window.innerHeight);
      setIsPortrait(window.innerHeight > window.innerWidth);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    screenWidth,
    screenHeight,
    isPortrait,
    isLandscape: !isPortrait,
    isSmallScreen: screenWidth < 640,
    isMediumScreen: screenWidth >= 640 && screenWidth < 1024,
    isLargeScreen: screenWidth >= 1024
  };
};

// ==================== UNIFIED MOBILE HOOK ====================

/**
 * Combined hook for all mobile functionality
 */
export const useMobileFeatures = (handlers?: SwipeHandlers, config?: SwipeConfig) => {
  const auth = useMobileAuth();
  const detection = useMobileDetection();
  const swipe = useSwipeGesture(handlers || {}, config);

  return {
    auth,
    detection,
    swipe,
    ...detection,
    ...auth
  };
};

export default useMobileFeatures;
