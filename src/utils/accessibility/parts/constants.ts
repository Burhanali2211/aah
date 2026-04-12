// Accessibility Constants
export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  menu: 'menu',
  menuitem: 'menuitem',
  tab: 'tab',
  tabpanel: 'tabpanel',
  dialog: 'dialog',
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
  grid: 'grid',
  gridcell: 'gridcell',
  columnheader: 'columnheader',
  rowheader: 'rowheader'
} as const;

export const ARIA_STATES = {
  expanded: 'aria-expanded',
  selected: 'aria-selected',
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  hidden: 'aria-hidden',
  pressed: 'aria-pressed',
  current: 'aria-current'
} as const;

export const ARIA_PROPERTIES = {
  label: 'aria-label',
  labelledby: 'aria-labelledby',
  describedby: 'aria-describedby',
  controls: 'aria-controls',
  owns: 'aria-owns',
  live: 'aria-live',
  atomic: 'aria-atomic',
  relevant: 'aria-relevant'
} as const;

// WCAG compliance levels
export type WCAGLevel = 'A' | 'AA' | 'AAA';

// Color contrast ratios for different WCAG levels
export const CONTRAST_RATIOS = {
  A: { normal: 3, large: 3 },
  AA: { normal: 4.5, large: 3 },
  AAA: { normal: 7, large: 4.5 }
} as const;

// Accessibility preferences
export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

// Focus management
export interface FocusManager {
  trapFocus: (container: HTMLElement) => () => void;
  restoreFocus: (element?: HTMLElement) => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => void;
  getFocusableElements: (container: HTMLElement) => HTMLElement[];
}

// Announcement types for screen readers
export type AnnouncementPriority = 'polite' | 'assertive' | 'off';
