import { WCAGLevel, CONTRAST_RATIOS } from './constants';

export const colorContrast = {
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  },
  getLuminance: (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },
  getContrastRatio: (c1: string, c2: string) => {
    const rgb1 = colorContrast.hexToRgb(c1); const rgb2 = colorContrast.hexToRgb(c2);
    if (!rgb1 || !rgb2) return 0;
    const l1 = colorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b); const l2 = colorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  },
  checkWCAGCompliance: (fg: string, bg: string, level: WCAGLevel = 'AA', isLarge = false) => {
    const ratio = colorContrast.getContrastRatio(fg, bg);
    return ratio >= CONTRAST_RATIOS[level][isLarge ? 'large' : 'normal'];
  }
};

export const ariaUtils = {
  generateId: (p = 'aria') => `${p}-${Math.random().toString(36).substr(2, 9)}`,
  createDescribedBy: (elements: HTMLElement[]) => elements.map(el => el.id || (el.id = ariaUtils.generateId())).join(' '),
  setExpanded: (el: HTMLElement, exp: boolean) => el.setAttribute('aria-expanded', exp.toString()),
  setSelected: (el: HTMLElement, sel: boolean) => el.setAttribute('aria-selected', sel.toString()),
  setPressed: (el: HTMLElement, pre: boolean) => el.setAttribute('aria-pressed', pre.toString()),
  setChecked: (el: HTMLElement, chk: boolean | 'mixed') => el.setAttribute('aria-checked', chk.toString())
};

export const skipLinks = {
  create: (target: string, text = 'Skip to main content') => {
    const link = document.createElement('a'); link.href = target; link.textContent = text;
    link.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
    return link;
  },
  install: (links: Array<{ target: string; text: string }>) => {
    const container = document.createElement('div'); container.className = 'skip-links';
    links.forEach(l => container.appendChild(skipLinks.create(l.target, l.text)));
    document.body.insertBefore(container, document.body.firstChild);
  }
};

export const accessibilityTest = {
  checkAltText: (container: HTMLElement = document.body) => Array.from(container.querySelectorAll('img')).filter(img => !img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby') && img.getAttribute('role') !== 'presentation'),
  checkFormLabels: (container: HTMLElement = document.body) => Array.from(container.querySelectorAll('input, select, textarea')).filter(input => {
    const el = input as any; return !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && el.type !== 'hidden';
  }) as HTMLElement[],
  checkHeadingHierarchy: (container: HTMLElement = document.body) => {
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const issues: Array<{ element: HTMLElement; issue: string }> = [];
    let prev = 0; headings.forEach(h => {
      const level = parseInt(h.tagName.charAt(1));
      if (level > prev + 1) issues.push({ element: h as HTMLElement, issue: `Heading level ${level} follows level ${prev}, skipping levels` });
      prev = level;
    }); return issues;
  },
  generateReport: (container: HTMLElement = document.body) => ({ missingAltText: accessibilityTest.checkAltText(container), missingFormLabels: accessibilityTest.checkFormLabels(container), headingIssues: accessibilityTest.checkHeadingHierarchy(container), timestamp: new Date().toISOString() })
};
