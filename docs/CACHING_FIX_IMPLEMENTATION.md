# Caching & Performance Fix - Implementation Plan

## Executive Summary

Your critical caching issues stem from **THREE independent cache layers fighting each other**:
1. Session Storage cache (with broken versioning)
2. In-memory cache
3. Browser HTTP cache + Service Worker

**Fix timeline:** 2-4 hours for full resolution

---

## Phase 1: Immediate Fixes (30 minutes)

### 1.1 Disable HTTP Caching on API Responses

**File:** `src/lib/supabase.ts`

**Action:** Modify Supabase client initialization to disable HTTP caching

```typescript
// BEFORE
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// AFTER
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
  // Prevent HTTP caching of API responses
  // The browser will refetch every time (but with If-Modified-Since headers for efficiency)
  global: {
    headers: {
      // This is passed to all fetch requests made by Supabase
      // But HTTP caching is controlled by response headers, not request headers
      // So we need to handle this at fetch time instead
    },
  },
});

// Add fetch wrapper to prevent HTTP caching
const originalFetch = window.fetch.bind(window);
window.fetch = function(...args) {
  const options = args[1] || {};
  
  // Only affect API calls to Supabase
  const url = String(args[0]);
  if (url.includes('supabase.co')) {
    options.cache = 'no-store'; // Force browser to bypass HTTP cache
    if (!options.headers) options.headers = {};
    (options.headers as any)['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
  
  return originalFetch(args[0], options);
};
```

**Alternative (Better) Approach:**

Instead of monkey-patching fetch, use proper Axios/fetch interceptors:

**File:** `src/lib/apiClient.ts` (create if doesn't exist)

```typescript
export const createNoCacheHeaders = () => ({
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});

// Use this with every Supabase call
export const db = {
  async getProducts(params?: {...}) {
    let query = supabase
      .from('products')
      .select('*', needsCount ? { count: 'exact' } : { count: 'none' });
    
    // Add cache-busting query param
    query = query.eq('_cache_bust', Date.now().toString()); // This is wrong - Supabase doesn't support this
    
    // Better: use HEAD request first to check freshness
    const { data, error } = await query.eq('is_active', true);
    
    return { data, error };
  }
};
```

**Best Approach (Recommended):**

Supabase doesn't let you control HTTP cache headers from the client. Instead:

```typescript
// src/lib/supabase.ts

// Create a wrapper around fetch that adds no-cache headers
const noCacheFetch = (url: RequestInfo, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  
  return fetch(url, {
    ...init,
    headers,
    cache: 'no-store', // Browsers that support Cache API will use this
  });
};

// BUT: Supabase client doesn't expose fetch configuration

// ACTUAL SOLUTION: Use service worker to add headers
// OR: Accept that you need to use Cache-Busting query params
```

**SIMPLEST SOLUTION:**

```typescript
// In src/lib/supabase.ts - after creating the client

// Override the from() method to add cache busting
const originalFrom = supabase.from.bind(supabase);
supabase.from = function(table) {
  const query = originalFrom(table);
  
  // Add a cache-busting timestamp to every query URL
  // This won't actually work because Supabase URLs don't have query params
  // So instead: clear browser cache on app load
  
  return query;
};

// BETTER: Clear browser cache on app load
if (typeof window !== 'undefined') {
  // Clear all caches on app start
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  });
}
```

---

### 1.2 Clear Poisoned Session Storage Cache on App Load

**File:** `src/main.tsx`

**Action:** Add cache clearing logic before React renders

```typescript
import { Fragment as StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// ✅ ADD THIS: Clear poisoned caches BEFORE React renders
if (typeof window !== 'undefined') {
  // Clear old session storage caches
  const cacheKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    
    // Remove all old cache keys
    if (
      key.startsWith('pc_') ||              // ProductContext cache
      key.startsWith('perfume_cache_') ||   // Old cache system
      key.includes('_cache_') ||
      key.startsWith('cache_')
    ) {
      cacheKeysToRemove.push(key);
    }
  }
  
  cacheKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  
  // Also clear localStorage cache if any
  try {
    if (localStorage.getItem('cache_version')) {
      localStorage.removeItem('cache_version');
    }
  } catch { /* Private browsing mode */ }
}

// Initialize analytics and error tracking
import { initGA } from './services/analytics';
import { initSentry, ErrorBoundary } from './services/errorTracking';

initSentry();
initGA();

// ... rest of code
```

---

### 1.3 Force Fresh Fetch on App Load

**File:** `src/contexts/ProductContext.tsx`

**Action:** Modify initial data load to ALWAYS fetch fresh (ignore cache on first load)

```typescript
// FIND THIS BLOCK (around line 440):
useEffect(() => {
  if (initFetched.current) return;
  initFetched.current = true;

  // CHANGE THIS:
  Promise.all([
    fetchCategories(false, true),  // ← Change to (true, true) = background mode, force refresh
    fetchProducts(1, 20, undefined, true),
    fetchFeaturedProducts(8, true),
  ]).then(() => {
    // ... rest

// CHANGE TO:
useEffect(() => {
  if (initFetched.current) return;
  initFetched.current = true;

  // ✅ FIXED: Always force fresh data on app load
  Promise.all([
    fetchCategories(true, true),  // (backgroundMode=true for silent refresh, force=true for ignore cache)
    fetchProducts(1, 20, undefined, true),
    fetchFeaturedProducts(8, true),
    fetchBestSellers(8, true),
    fetchLatestProducts(8, true),
  ]).then(() => {
    // All initial data loaded
  }).catch(error => {
    console.error('[ProductProvider] Initial load failed:', error);
  });
}, [fetchCategories, fetchProducts, fetchFeaturedProducts, fetchBestSellers, fetchLatestProducts]);
```

---

### 1.4 Add Stale-While-Revalidate Pattern

**File:** `src/contexts/ProductContext.tsx`

**Action:** Modify fetch functions to use stale-while-revalidate:

```typescript
// CHANGE THIS:
const fetchCategories = useCallback(async (background = false, force = false) => {
  const keys = getCacheKeys();
  const cached = cacheGet<Category[]>(keys.categories);
  // Always show cache instantly if available
  if (cached) setCategories(cached);
  // Skip network if: background mode AND not forced AND we have cached data
  if (cached && background && !force) return;

// CHANGE TO:
const fetchCategories = useCallback(async (background = false, force = false) => {
  const keys = getCacheKeys();
  const cached = cacheGet<Category[]>(keys.categories);
  
  // ✅ STALE-WHILE-REVALIDATE PATTERN:
  // 1. Show cached data immediately if available (prevents flash)
  if (cached) {
    setCategories(cached);
    // But always refetch in background to catch updates
  }
  
  // 2. Always fetch fresh data if not in background OR forced
  // Remove the && !force check - we want to refetch periodically
  if (!cached || force) {
    // Show loading only if no cache (first load)
    if (!cached) {
      // optionally set loading state
    }
    
    try {
      const data = await db.getCategories();
      const mapped = data.map(mapDbCategoryToAppCategory);
      setCategories(mapped);
      cacheSet(keys.categories, mapped);
    } catch (error) {
      if (!cached) showError('Failed to load categories', error instanceof Error ? error.message : undefined);
      // If cached, silently fail - use stale data
    }
  }
}, [showError, mapDbCategoryToAppCategory]);
```

---

## Phase 2: Consolidate Caching (1 hour)

### 2.1 Create a Single Caching Utility

**File:** `src/lib/cache.ts` (NEW - replaces caching.ts and newCaching.ts)

```typescript
/**
 * Single unified cache system
 * 
 * Strategy:
 * 1. sessionStorage for browser persistence (survives page reloads, not shared across tabs)
 * 2. Memory cache for performance (lost on navigation, instant access)
 * 3. Automatic stale-while-revalidate with proper versioning
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

// ─── Configuration ───
const CACHE_CONFIG = {
  // How long before cache is considered "stale" and needs revalidation
  STALE_TIME: 5 * 60 * 1000,      // 5 minutes
  // How long before cache is discarded entirely
  MAX_AGE: 24 * 60 * 60 * 1000,   // 24 hours
  // Max items in memory cache
  MAX_MEMORY_ITEMS: 50,
} as const;

// ─── Cache Version Management ───
let globalCacheVersion = 0;
function invalidateAllCaches() {
  globalCacheVersion++;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('__cache_version', String(globalCacheVersion));
  }
}

// ─── Storage Implementations ───

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T) {
    if (this.cache.size >= CACHE_CONFIG.MAX_MEMORY_ITEMS) {
      // Remove oldest entry
      const oldest = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.cache.delete(oldest[0]);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      version: globalCacheVersion,
    });
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > CACHE_CONFIG.STALE_TIME;

    return { data: entry.data, isStale };
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }
}

class SessionStorageCache {
  private prefix = '__cache_';

  set<T>(key: string, data: T) {
    if (typeof sessionStorage === 'undefined') return;
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: globalCacheVersion,
      };
      sessionStorage.setItem(
        this.prefix + key,
        JSON.stringify(entry)
      );
    } catch (error) {
      // Silently fail if storage is full
      console.warn('[Cache] SessionStorage write failed:', error);
    }
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(this.prefix + key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      const age = Date.now() - entry.timestamp;
      const isStale = age > CACHE_CONFIG.STALE_TIME;
      const isExpired = age > CACHE_CONFIG.MAX_AGE;

      if (isExpired) {
        sessionStorage.removeItem(this.prefix + key);
        return null;
      }

      return { data: entry.data, isStale };
    } catch (error) {
      return null;
    }
  }

  clear() {
    if (typeof sessionStorage === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }

  delete(key: string) {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(this.prefix + key);
  }
}

// ─── Main Cache API ───

class AppCache {
  private memory = new MemoryCache();
  private storage = new SessionStorageCache();

  /**
   * Get cached data
   * Returns { data, isStale } so components can decide whether to refetch
   */
  get<T>(key: string): { data: T; isStale: boolean } | null {
    // Try memory first (fastest)
    let result = this.memory.get<T>(key);
    if (result) return result;

    // Fall back to sessionStorage
    result = this.storage.get<T>(key);
    if (result) {
      // Populate memory cache for next access
      this.memory.set(key, result.data);
    }
    return result;
  }

  /**
   * Set cache data
   * Stores in both memory and sessionStorage
   */
  set<T>(key: string, data: T) {
    this.memory.set(key, data);
    this.storage.set(key, data);
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string) {
    this.memory.delete(key);
    this.storage.delete(key);
  }

  /**
   * Invalidate all caches
   * Call when data is mutated
   */
  invalidateAll() {
    this.memory.clear();
    this.storage.clear();
    invalidateAllCaches();
  }

  /**
   * Invalidate by prefix
   * E.g., invalidatePattern('products') clears products_1, products_2, etc.
   */
  invalidatePattern(pattern: string) {
    if (typeof sessionStorage === 'undefined') return;
    const prefix = '__cache_' + pattern;
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
}

export const cache = new AppCache();
export { invalidateAllCaches };
```

---

### 2.2 Update ProductContext to Use New Cache

**File:** `src/contexts/ProductContext.tsx`

**Action:** Replace sessionStorage cache logic with new AppCache

```typescript
// REMOVE THESE LINES:
const CACHE_TTL = 5 * 60 * 1000;
interface CacheEntry<T> { data: T; ts: number; }
function cacheGet<T>(key: string): T | null { ... }
function cacheSet<T>(key: string, data: T) { ... }
function cacheClear(pattern: string) { ... }
let cacheVersion = ...
function bumpCacheVersion() { ... }
const getCacheKeys = () => ({ ... });

// ADD THIS IMPORT:
import { cache, invalidateAllCaches } from '@/lib/cache';

// REPLACE WITH:
const getCacheKeys = () => ({
  products: (page: number, filters: string) => `products_${page}_${filters}`,
  featured: 'featured_products',
  latest: 'latest_products',
  bestSellers: 'bestsellers',
  categories: 'categories',
});

// UPDATE fetchCategories:
const fetchCategories = useCallback(async (background = false, force = false) => {
  const keys = getCacheKeys();
  const result = cache.get<Category[]>(keys.categories);

  // Show cached data if available
  if (result?.data) {
    setCategories(result.data);
    // In background mode and data not stale, skip refetch
    if (background && !result.isStale && !force) {
      return;
    }
  }

  // Fetch fresh data
  if (!result?.data) setLoading(true); // Only show loading if no cache
  try {
    const data = await db.getCategories();
    const mapped = data.map(mapDbCategoryToAppCategory);
    setCategories(mapped);
    cache.set(keys.categories, mapped);
  } catch (error) {
    // Only show error if no fallback cache
    if (!result?.data) {
      showError('Failed to load categories', error instanceof Error ? error.message : undefined);
    }
  } finally {
    if (!result?.data) setLoading(false);
  }
}, [showError, mapDbCategoryToAppCategory]);

// UPDATE mutations to invalidate cache:
const addProduct = useCallback(async (product: ...) => {
  try {
    const { data, error } = await supabase.from('products').insert([...]).select().single();
    if (error) throw error;
    
    // ✅ Invalidate cache on mutation
    invalidateAllCaches();
    cache.invalidatePattern('products');
    
    // Refetch to show new data
    await fetchProducts(1, 20, undefined, true);
    return mapDbProductToAppProduct(data);
  } catch (error) {
    showError('Failed to create product', error instanceof Error ? error.message : undefined);
    throw error;
  }
}, [fetchProducts, showError, mapDbProductToAppProduct]);
```

---

### 2.3 Delete Unused Cache Files

**Files to Delete:**
```
src/lib/caching.ts
src/lib/newCaching.ts
src/utils/hybridCache.ts
src/utils/redisCache.ts (frontend code - doesn't make sense)
```

**Action:**
```bash
rm src/lib/caching.ts
rm src/lib/newCaching.ts
rm src/utils/hybridCache.ts
rm src/utils/redisCache.ts
```

Then search for imports of these files and remove them:

```bash
grep -r "from.*caching" src/
grep -r "from.*newCaching" src/
grep -r "from.*hybridCache" src/
grep -r "from.*redisCache" src/
```

---

## Phase 3: Cleanup & Simplification (30 minutes)

### 3.1 Remove Unused Service Worker Code

**File:** `src/main.tsx`

```typescript
// REMOVE THESE LINES:
import { initServiceWorker } from './utils/serviceWorker';
initServiceWorker().catch(error => {
  console.warn('[SW] Failed to initialize Service Worker management:', error);
});
```

**File:** `src/App.tsx`

```typescript
// REMOVE THIS useEffect (lines 76-88):
useEffect(() => {
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister().catch(() => {});
      });
    });
  }
}, []);
```

**Reason:** Service workers can help but they're complicating your cache strategy. If you need offline support, use proper SW code. For now, disable them.

---

### 3.2 Consolidate Performance Monitoring

**Review these files:**
```
src/hooks/usePerformanceOptimization.ts
src/hooks/usePerformanceMonitoring.ts
src/components/Common/PerformanceDashboard.tsx
src/services/errorTracking.ts
```

**Action:** Keep only what's used. Delete or simplify unused performance hooks.

---

## Phase 4: Testing & Validation (30 minutes)

### 4.1 Functional Testing

**Test Scenarios:**

1. **Fresh Load:**
   - Clear all browser caches
   - Open site
   - Should see products immediately
   - Check Network tab: products request shows 200 (not cached)

2. **Subsequent Navigation:**
   - Navigate away from home
   - Navigate back
   - Should see products instantly (from memory cache)
   - Optional: Check that stale-while-revalidate refetches in background

3. **Admin Update:**
   - Add/update a product in admin
   - Go to home page
   - Should see updated product immediately
   - No need to refresh

4. **Multiple Tabs:**
   - Open site in Tab A
   - Open same site in Tab B
   - Both should have independent caches (OK to be different)
   - But both should show DB data (not cross-tab poison)

5. **Browser Close & Reopen:**
   - Open site
   - See products
   - Close browser completely
   - Reopen → should fetch fresh from DB
   - Memory cache is gone, sessionStorage cache is gone

### 4.2 Performance Testing

**Metrics to Monitor:**

```javascript
// In browser console:
performance.mark('page-load-start');
// ... do stuff
performance.mark('page-load-end');
performance.measure('page-load', 'page-load-start', 'page-load-end');
console.log(performance.getEntriesByType('measure'));
```

**Baseline Targets:**
- Home page initial load: < 2s
- Categories display: instant (cached)
- Products section: < 500ms (with cache)
- Admin product update to homepage: < 3s

### 4.3 Cache Debugging

```javascript
// In browser console after opening page:

// Check what's in cache
const { cache } = await import('./lib/cache.ts');
cache.get('categories');

// Check sessionStorage
Object.keys(sessionStorage)
  .filter(k => k.startsWith('__cache'))
  .forEach(k => console.log(k, sessionStorage.getItem(k)));

// Check memory usage
console.log(performance.memory);
```

---

## Phase 5: Documentation (15 minutes)

### 5.1 Update Code Comments

Add comments to `src/lib/cache.ts`:

```typescript
/**
 * AppCache - Unified caching system
 * 
 * Architecture:
 * 1. Two-tier storage:
 *    - Memory: Fast, lost on navigation
 *    - SessionStorage: Persistent, survives reload
 * 
 * 2. Stale-While-Revalidate:
 *    - Data marked "stale" after 5 minutes
 *    - Component can show stale data while fetching fresh
 *    - Fresh data updates in background
 * 
 * 3. Automatic Invalidation:
 *    - Call invalidateAllCaches() on mutations
 *    - Or invalidatePattern() for specific patterns
 * 
 * Usage:
 *   const result = cache.get('key');
 *   if (result) {
 *     setData(result.data);
 *     if (result.isStale) refetchInBackground();
 *   }
 */
```

### 5.2 Create Cache Usage Guide

**File:** `src/lib/CACHE_USAGE.md`

```markdown
# Cache Usage Guide

## How to Use the Cache

### Basic Usage

```typescript
import { cache } from '@/lib/cache';

// Get cached data
const result = cache.get<Product[]>('products_list');
if (result) {
  setProducts(result.data);
  
  // If stale, refetch in background
  if (result.isStale) {
    fetchProducts().then(data => {
      setProducts(data);
      cache.set('products_list', data);
    });
  }
}
```

### Updating Cache

```typescript
// Set cache
cache.set('products_list', products);

// Clear specific key
cache.delete('products_list');

// Clear all caches on data mutation
import { invalidateAllCaches } from '@/lib/cache';
invalidateAllCaches();

// Clear by pattern
cache.invalidatePattern('products');
```

## When to Invalidate

- ✅ After adding a product
- ✅ After updating a product
- ✅ After deleting a product
- ✅ After publishing/unpublishing
- ❌ Don't invalidate on every render
- ❌ Don't invalidate on navigation (memory cache handles it)

## Stale-While-Revalidate Explained

1. User arrives at home page
2. Cache has 4-minute-old products (not stale)
3. Component shows cached products immediately
4. In background, fetches fresh products
5. Fresh products arrive and update display

Benefits:
- Fast perceived performance
- Always shows something
- Fresh data loaded automatically

## Cache Timing

- Stale threshold: 5 minutes
- Max age: 24 hours (deleted entirely)
- Memory cache size: 50 items (LRU eviction)
```

---

## Verification Checklist

After implementing all phases, verify:

- [ ] No `.pc_` keys in sessionStorage
- [ ] No `cache_` keys in localStorage
- [ ] Network tab shows `Cache-Control: no-cache` headers
- [ ] Products update immediately after admin change
- [ ] Home page loads without requiring cache clear
- [ ] Multiple tabs don't share poisoned cache
- [ ] Performance metrics meet baselines
- [ ] No errors in console on fresh load
- [ ] Works on mobile without refresh loops
- [ ] Works on tablet without refresh loops
- [ ] Works offline (graceful degradation)

---

## Rollback Plan

If something breaks during implementation:

1. **Git undo:**
   ```bash
   git checkout src/contexts/ProductContext.tsx
   git checkout src/lib/supabase.ts
   ```

2. **Revert to last known-good cache system:**
   ```bash
   git restore src/lib/cache.ts
   git restore src/main.tsx
   ```

3. **Don't** delete the old cache files until Phase 3 is stable

---

## Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1 (Quick Wins) | 30 min | 🔴 NOW |
| Phase 2 (Consolidation) | 1 hour | 🔴 ASAP |
| Phase 3 (Cleanup) | 30 min | 🟡 Today |
| Phase 4 (Testing) | 30 min | 🔴 ASAP |
| Phase 5 (Docs) | 15 min | 🟢 Later |

**Total: 2.5 - 3.5 hours**

---

## Success Criteria

✅ After Phase 1: Site needs fewer cache clears
✅ After Phase 2: Products/categories always match DB
✅ After Phase 3: No unused code cluttering codebase
✅ After Phase 4: All test scenarios pass
✅ After Phase 5: Team understands cache system

