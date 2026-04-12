import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AccessibilityPreferences, FocusManager, AnnouncementPriority } from './constants';

/**
 * Detect accessibility preferences from system and user settings
 */
function detectAccessibilityPreferences(): AccessibilityPreferences {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: false, highContrast: false, largeText: false, screenReader: false,
      keyboardNavigation: false, focusVisible: false, colorBlindness: 'none'
    };
  }
  const preferences: AccessibilityPreferences = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: high)').matches,
    largeText: false, screenReader: false, keyboardNavigation: false, focusVisible: false, colorBlindness: 'none'
  };
  preferences.screenReader = !!(window.navigator.userAgent.match(/NVDA|JAWS|VoiceOver|ORCA|Dragon/i) || window.speechSynthesis);
  try {
    const saved = JSON.parse(localStorage.getItem('accessibility_preferences') || '{}');
    Object.assign(preferences, saved);
  } catch (error) { console.warn('Failed to load accessibility preferences:', error); }
  return preferences;
}

export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(detectAccessibilityPreferences);

  useEffect(() => {
    const updatePreferences = () => { try { setPreferences(detectAccessibilityPreferences()); } catch (error) { console.warn('Failed to update preferences:', error); } };
    const mqs = [window.matchMedia('(prefers-reduced-motion: reduce)'), window.matchMedia('(prefers-contrast: high)'), window.matchMedia('(prefers-color-scheme: dark)')];
    mqs.forEach(mq => mq.addEventListener('change', updatePreferences));
    const handleStorageChange = (e: StorageEvent | null) => { if (e && (e.key === 'accessibility_preferences' || e.key === null)) updatePreferences(); };
    window.addEventListener('storage', handleStorageChange);
    return () => { mqs.forEach(mq => mq.removeEventListener('change', updatePreferences)); window.removeEventListener('storage', handleStorageChange); };
  }, []);

  const updatePreference = useCallback(<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    try {
      const saved = JSON.parse(localStorage.getItem('accessibility_preferences') || '{}');
      localStorage.setItem('accessibility_preferences', JSON.stringify({ ...saved, [key]: value }));
    } catch (error) { console.warn('Failed to save preference:', error); }
  }, []);

  return { preferences, updatePreference };
};

export const useFocusManagement = (): FocusManager => {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = ['a[href]', 'button:not([disabled])', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])', '[contenteditable="true"]'].join(', ');
    return Array.from(container.querySelectorAll(focusableSelectors)).filter(el => {
      const element = el as HTMLElement;
      return element.offsetWidth > 0 && element.offsetHeight > 0 && !element.hidden && window.getComputedStyle(element).visibility !== 'hidden';
    }) as HTMLElement[];
  }, []);

  const trapFocus = useCallback((container: HTMLElement) => {
    const elements = getFocusableElements(container);
    const first = elements[0];
    const last = elements[elements.length - 1];
    previousFocusRef.current = document.activeElement as HTMLElement;
    if (first) first.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first?.focus(); } }
    };
    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [getFocusableElements]);

  const restoreFocus = useCallback((el?: HTMLElement) => {
    const target = el || previousFocusRef.current;
    if (target && document.contains(target)) target.focus();
    previousFocusRef.current = null;
  }, []);

  const moveFocus = useCallback((dir: 'next' | 'previous' | 'first' | 'last') => {
    const elements = getFocusableElements(document.body);
    const currentIdx = elements.indexOf(document.activeElement as HTMLElement);
    let targetIdx: number;
    switch (dir) {
      case 'next': targetIdx = (currentIdx + 1) % elements.length; break;
      case 'previous': targetIdx = currentIdx <= 0 ? elements.length - 1 : currentIdx - 1; break;
      case 'first': targetIdx = 0; break;
      case 'last': targetIdx = elements.length - 1; break;
    }
    elements[targetIdx]?.focus();
  }, [getFocusableElements]);

  return { trapFocus, restoreFocus, moveFocus, getFocusableElements };
};

export const useScreenReaderAnnouncements = () => {
  const announcementRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!announcementRef.current) {
      const container = document.createElement('div');
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      container.className = 'sr-only';
      container.style.cssText = 'position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important;';
      document.body.appendChild(container);
      announcementRef.current = container;
    }
    return () => { if (announcementRef.current && document.body.contains(announcementRef.current)) document.body.removeChild(announcementRef.current); };
  }, []);

  const announce = useCallback((message: string, priority: AnnouncementPriority = 'polite') => {
    if (!announcementRef.current) return;
    announcementRef.current.setAttribute('aria-live', priority);
    announcementRef.current.textContent = '';
    setTimeout(() => { if (announcementRef.current) announcementRef.current.textContent = message; }, 100);
  }, []);
  return { announce };
};

export const useKeyboardNavigationHook = (items: Array<{ id: string; disabled?: boolean }>, options: { loop?: boolean; orientation?: 'horizontal' | 'vertical'; onSelect?: (id: string) => void; } = {}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { loop = true, orientation = 'vertical', onSelect } = options;
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const { key } = e;
    const enabled = items.filter(i => !i.disabled);
    const currentEnabledIdx = enabled.findIndex(i => i.id === items[focusedIndex]?.id);
    let nextIdx = currentEnabledIdx;
    switch (key) {
      case 'ArrowDown': if (orientation === 'vertical') { e.preventDefault(); nextIdx = (currentEnabledIdx + 1) % enabled.length; if (!loop && currentEnabledIdx + 1 >= enabled.length) nextIdx = enabled.length-1; } break;
      case 'ArrowUp': if (orientation === 'vertical') { e.preventDefault(); nextIdx = currentEnabledIdx <= 0 ? (loop ? enabled.length - 1 : 0) : currentEnabledIdx - 1; } break;
      case 'ArrowRight': if (orientation === 'horizontal') { e.preventDefault(); nextIdx = (currentEnabledIdx + 1) % enabled.length; if (!loop && currentEnabledIdx + 1 >= enabled.length) nextIdx = enabled.length-1; } break;
      case 'ArrowLeft': if (orientation === 'horizontal') { e.preventDefault(); nextIdx = currentEnabledIdx <= 0 ? (loop ? enabled.length - 1 : 0) : currentEnabledIdx - 1; } break;
      case 'Home': e.preventDefault(); nextIdx = 0; break;
      case 'End': e.preventDefault(); nextIdx = enabled.length - 1; break;
      case 'Enter': case ' ': e.preventDefault(); onSelect?.(enabled[currentEnabledIdx]?.id); return;
      default: return;
    }
    const nextItem = enabled[nextIdx];
    const finalIdx = items.findIndex(i => i.id === nextItem?.id);
    setFocusedIndex(finalIdx);
    onSelect?.(nextItem?.id);
  };
  return { focusedIndex, handleKeyDown };
};

export const useKeyboardNavigation = (handlers: Record<string, (e: KeyboardEvent) => void>) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mods = [];
      if (e.ctrlKey) mods.push('ctrl'); if (e.altKey) mods.push('alt'); if (e.shiftKey) mods.push('shift'); if (e.metaKey) mods.push('meta');
      const combo = mods.length > 0 ? `${mods.join('+')}+${key}` : key;
      if (handlers[combo]) handlers[combo](e);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
};
