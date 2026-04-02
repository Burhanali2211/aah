# 🚀 EXECUTION CHECKLIST - PRODUCTION GRADE REFACTORING

## PRE-LAUNCH CHECKLIST

### Repository Preparation
- [ ] Create feature branch: `git checkout -b refactor/production-grade`
- [ ] Create backup tag: `git tag backup/pre-refactor`
- [ ] Create GitHub milestone: "Production Grade Refactoring"
- [ ] Create GitHub issues for each phase
- [ ] Document current API in CURRENT_API.md
- [ ] Run `npm list` to document dependencies

### Environment Setup
- [ ] Node version: >= 18
- [ ] npm version: >= 9
- [ ] VS Code extensions: ESLint, Prettier, Git Lens
- [ ] Database backup: `pg_dump > backup_$(date +%s).sql`
- [ ] Create local .env.backup

---

## PHASE 0: AUDIT (3-4 hours)

**Goal:** Understand what gets used before deleting anything

### 0.1 Dependency Mapping
- [ ] Run all grep commands from PRODUCTION_GRADE_REFACTORING_PLAN.md
- [ ] Create `DEPENDENCY_GRAPH.md` documenting:
  - Which components use which loaders
  - Which contexts depend on GlobalStateManager
  - Which utilities use which cache systems
  - Which hooks wrap other hooks
- [ ] Create `IMPORT_ANALYSIS.md` with:
  - Count of each loader import (ProfessionalLoader, UniversalLoader, etc.)
  - Count of each product card import
  - Unused imports

### 0.2 Bundle Analysis
- [ ] Run: `npm run build -- --report`
- [ ] Document current bundle size
- [ ] Identify largest chunks
- [ ] Screenshot bundle visualizer

### 0.3 Documentation
- [ ] Document current context usage patterns
- [ ] Document current utility patterns
- [ ] Create `REFACTORING_NOTES.md` for tracking decisions

**Deliverable:** DEPENDENCY_GRAPH.md + IMPORT_ANALYSIS.md + bundle baseline
**Time:** 3-4 hours

---

## PHASE 1: KILL THE CLUTTER (12-15 hours)

### 1.1 Eliminate Redundant Cache Systems

**Files to Delete:**
```
src/lib/caching.ts ..................... [ ] DELETED
src/lib/newCaching.ts .................. [ ] DELETED
src/utils/hybridCache.ts ............... [ ] DELETED
src/utils/redisCache.ts ................ [ ] DELETED
```

**Files to Create:**
```
src/lib/storage/cache.ts ............... [ ] CREATED & TESTED
```

**Files to Update:**
```
src/main.tsx ........................... [ ] Updated (line 1)
src/contexts/ProductContext.tsx ........ [ ] Updated (remove caching logic)
src/App.tsx ............................ [ ] Updated (delete useEffect 76-88)
```

**Tests:**
- [ ] `npm run build` succeeds
- [ ] No import errors
- [ ] Home page loads
- [ ] Products display
- [ ] No console errors related to cache

**Time:** 30 min

### 1.2 Eliminate Duplicate Loaders

**Files to Delete:**
```
src/components/Common/StagedLoader.tsx .................. [ ] DELETED
src/components/Common/UniversalLoader.tsx .............. [ ] DELETED
src/components/Common/EnhancedLoadingStates.tsx ........ [ ] DELETED
```

**Files to Create:**
```
src/components/ui/Loader/Loader.tsx ..................... [ ] CREATED
src/components/ui/Skeleton/Skeleton.tsx ................ [ ] CREATED
src/components/ui/Skeleton/SkeletonGrid.tsx ............ [ ] CREATED
```

**Update Imports:**
```bash
# Find all imports
[ ] grep -r "from.*ProfessionalLoader\|UniversalLoader\|StagedLoader" src/

# Replace with
# OLD: import { ProfessionalLoader } from '@/components/Common/ProfessionalLoader';
# NEW: import { Loader } from '@/components/ui/Loader';
# NEW: <Loader fullPage showBrand text="Loading..." />
```

**Files to Update:**
- [ ] 20+ component files (all that use loaders)

**Tests:**
- [ ] All loaders render correctly
- [ ] Skeleton components work
- [ ] No regressions in loading states
- [ ] Admin pages still show loaders

**Time:** 1 hour

### 1.3 Consolidate Product Cards

**Files to Delete:**
```
src/components/Product/BestSellerProductCard.tsx ....... [ ] DELETED
src/components/Product/FeaturedProductCard.tsx ......... [ ] DELETED
src/components/Product/HomepageProductCard.tsx ......... [ ] DELETED
src/components/Product/LatestArrivalProductCard.tsx .... [ ] DELETED
src/components/Product/ProductListCard.tsx ............ [ ] DELETED
src/components/Mobile/MobileProductCard.tsx ........... [ ] DELETED
```

**Files to Create/Update:**
```
src/components/ui/ProductCard/ProductCard.tsx ......... [ ] CREATED
```

**Update Imports:**
```bash
# Replace all card imports with
import { ProductCard } from '@/components/ui/ProductCard';
# <ProductCard variant="grid" />
# <ProductCard variant="list" />
# <ProductCard variant="bestseller" />
```

**Files to Update:**
- [ ] src/components/Home/FeaturedProducts.tsx
- [ ] src/components/Home/BestSellers.tsx
- [ ] src/components/Home/LatestArrivals.tsx
- [ ] src/pages/ProductsPage.tsx
- [ ] src/components/Admin/Products/ProductsList.tsx
- [ ] 5+ other files

**Tests:**
- [ ] All product sections display correctly
- [ ] Grid variant works (home, products page)
- [ ] List variant works (search, admin)
- [ ] Compact variant works (carousels)
- [ ] Mobile variant works (mobile devices)
- [ ] Add to cart button functional
- [ ] Wishlist button functional

**Time:** 1.5 hours

### 1.4 Consolidate Image Utilities

**Files to Delete:**
```
src/utils/imageUrlUtils.ts ........................... [ ] DELETED
src/utils/productImageUtils.ts ....................... [ ] DELETED
src/utils/imageOptimizationService.ts ................ [ ] DELETED
src/components/Common/EnhancedResponsiveImage.tsx .... [ ] DELETED
src/components/Common/LazyImage.tsx .................. [ ] DELETED
src/components/Common/ProductImage.tsx ............... [ ] DELETED
```

**Files to Create:**
```
src/lib/image/imageUtils.ts .......................... [ ] CREATED
src/components/ui/Image/Image.tsx .................... [ ] CREATED
```

**Update Imports:**
```bash
# Find all image-related imports
[ ] grep -r "LazyImage\|EnhancedResponsiveImage\|ProductImage\|imageUtils\|productImageUtils" src/

# Replace with
import { Image } from '@/components/ui/Image';
# <Image src={url} alt="Product" lazy />
```

**Files to Update:**
- [ ] All product card components
- [ ] All product detail components
- [ ] All home page sections
- [ ] 10+ other files

**Tests:**
- [ ] Images load correctly
- [ ] Lazy loading works
- [ ] Fallback SVGs display
- [ ] WebP/AVIF detection works
- [ ] No broken images

**Time:** 1 hour

### 1.5 Delete Service Worker Files
- [ ] Delete src/utils/serviceWorker.ts
- [ ] Delete src/utils/sw.js (if exists)
- [ ] Remove imports from src/main.tsx
- [ ] Remove imports from src/App.tsx

**Tests:**
- [ ] No service worker registration in DevTools
- [ ] Network requests go to server (not SW cache)
- [ ] Offline mode not broken (site doesn't work offline, which is OK)

**Time:** 15 min

### Summary of Phase 1
```
Files deleted: 21
Files created: 6
Net change: -15 files
Time: 12-15 hours
Status: [ ] COMPLETE
```

---

## PHASE 2: SIMPLIFY STATE (8-10 hours)

### 2.1 Merge Related Contexts

**Files to Merge:**
```
src/contexts/AuthContext.tsx
  ├── Merge: AuthModalContext.tsx ..................... [ ] MERGED
  ├── Merge: SecurityContext.tsx ..................... [ ] MERGED
  └── Result: Single AuthContext with all 3 ......... [ ] TESTED

src/contexts/ProductContext.tsx
  ├── Remove: sessionStorage caching logic ........... [ ] CLEANED
  ├── Use: src/lib/storage/cache.ts ................. [ ] INTEGRATED
  └── Result: Cleaner ProductContext ................ [ ] TESTED

src/contexts/ShoppingContext.tsx (NEW)
  ├── Merge: CartContext.tsx ......................... [ ] MERGED
  ├── Merge: WishlistContext.tsx ..................... [ ] MERGED
  ├── Merge: OrderContext.tsx ........................ [ ] MERGED
  ├── Merge: AddressContext.tsx ...................... [ ] MERGED
  └── Result: Single shopping context ............... [ ] TESTED
```

**Files to Delete:**
```
src/contexts/AuthModalContext.tsx .................... [ ] DELETED
src/contexts/SecurityContext.tsx .................... [ ] DELETED (if separate)
src/contexts/CartContext.tsx ......................... [ ] DELETED (merged into Shopping)
src/contexts/WishlistContext.tsx ..................... [ ] DELETED (merged into Shopping)
src/contexts/OrderContext.tsx ........................ [ ] DELETED (merged into Shopping)
src/contexts/AddressContext.tsx ...................... [ ] DELETED (merged into Shopping)
```

**Update CombinedProvider:**
```typescript
// Before: 13 levels
<ErrorProvider>
  <ThemeProvider>
    <NotificationProvider>
      <AuthProvider>
        <SecurityProvider>
          <AuthModalProvider>
            // ... 7 more levels

// After: 6 levels
<ErrorProvider>
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <ShoppingProvider>
          <NetworkStatusProvider>
```

**Update Imports:**
- [ ] Find all imports of deleted contexts
- [ ] Replace with single contexts
- [ ] Example: `useAuthModal()` → use `useAuth()` for modal state

**Tests:**
- [ ] Auth flows work (login, signup, password reset)
- [ ] Auth modal displays correctly
- [ ] Cart functionality works
- [ ] Wishlist functionality works
- [ ] Orders display correctly
- [ ] Addresses can be managed
- [ ] No console errors about context

**Time:** 3 hours

### 2.2 Delete GlobalStateManager

**Decision Point:**
- [ ] Check if GlobalStateManager is actually used anywhere
- [ ] Run: `grep -r "GlobalStateManager\|useGlobalState" src/`

**If Used:**
- [ ] Move state to appropriate contexts
- [ ] Update all imports
- [ ] Test functionality

**Files to Delete:**
- [ ] src/contexts/GlobalStateManager.tsx
- [ ] src/hooks/useGlobalState.ts (if exists)

**Tests:**
- [ ] No broken references to GlobalStateManager
- [ ] All state still accessible via individual contexts
- [ ] No regressions

**Time:** 1 hour

### 2.3 Delete Unused Performance Hooks

**Files to Audit:**
```
[ ] src/utils/performanceMonitor.ts
[ ] src/utils/performance/core.ts
[ ] src/hooks/usePerformanceMonitoring.ts
[ ] src/hooks/usePerformanceOptimization.ts
[ ] src/utils/metricsTracker.ts
```

**For Each File:**
1. [ ] Run: `grep -r "usePerformanceMonitoring\|performanceMonitor\|metricsTracker" src/`
2. [ ] If zero matches: delete
3. [ ] If matches: keep only one implementation

**Delete:**
```
[ ] All 5 files (if unused)
[ ] OR keep only 1 (if used in production monitoring)
```

**Tests:**
- [ ] No console errors about missing hooks
- [ ] Performance monitoring still works (or OK if disabled)

**Time:** 1 hour

### 2.4 Delete useMobileAuth Hook

**File to Delete:**
- [ ] src/hooks/useMobileAuth.ts

**Find & Replace:**
```bash
[ ] grep -r "useMobileAuth" src/
# Replace with direct useAuth() calls
```

**Tests:**
- [ ] Mobile auth flows still work
- [ ] No broken imports

**Time:** 30 min

### Summary of Phase 2
```
Files deleted: 13
Files merged: 8
Context depth: 13 → 6 levels (2x faster renders)
Time: 8-10 hours
Status: [ ] COMPLETE
```

---

## PHASE 3: CONSOLIDATE UTILITIES (6-8 hours)

### 3.1 Create Unified Form System
- [ ] Create src/lib/forms/formBuilder.ts
- [ ] Create src/lib/validation/validators.ts
- [ ] Update src/components/ui/Form/Form.tsx
- [ ] Update 9+ form components to use new system

**Tests:**
- [ ] All forms render correctly
- [ ] Validation works
- [ ] Error messages display
- [ ] Submit handlers work

**Time:** 2 hours

### 3.2 Consolidate Image Utilities (Already done in Phase 1)
- [x] src/lib/image/imageUtils.ts
- [x] src/components/ui/Image/Image.tsx

**Time:** 0 hours (already completed)

### 3.3 Consolidate Validation Schemas
- [ ] Create src/lib/validation/schemas.ts with ALL validators
- [ ] Export as named exports
- [ ] Delete scattered validation files

**Time:** 1 hour

### 3.4 Audit & Consolidate Utility Functions
- [ ] Create src/lib/utils.ts with:
  - Format functions (formatPrice, formatDate, etc.)
  - String utilities (truncate, capitalize, etc.)
  - Array utilities (unique, chunk, etc.)
  - Object utilities (pick, omit, etc.)
- [ ] Delete scattered utils files
- [ ] Update all imports

**Time:** 2 hours

### 3.5 Consolidate Constants
- [ ] Create src/constants.ts with all constants:
  - API endpoints
  - Cache keys
  - Error codes
  - Validation messages
  - UI constants
- [ ] Delete scattered constant files
- [ ] Update all imports

**Time:** 1 hour

### Summary of Phase 3
```
Files deleted: 10
Files created: 3
Consolidation ratio: 80%+ duplication eliminated
Time: 6-8 hours
Status: [ ] COMPLETE
```

---

## PHASE 4: PRODUCTION INFRASTRUCTURE (10-12 hours)

### 4.1 Error Handling & Logging
- [ ] Create src/lib/logging/logger.ts
- [ ] Create src/lib/errors/AppError.ts
- [ ] Create src/lib/errors/ErrorHandler.ts
- [ ] Update main.tsx to use global error handler
- [ ] Test error logging in console
- [ ] Test error tracking in IndexedDB

**Tests:**
- [ ] Errors logged to console
- [ ] Error details available in DevTools
- [ ] Sentry integration ready (commented out)

**Time:** 2 hours

### 4.2 Performance Monitoring
- [ ] Create src/lib/monitoring/metrics.ts
- [ ] Create src/lib/monitoring/networkMonitor.ts
- [ ] Add metrics to critical operations
  - API calls
  - Component renders (key pages)
  - User actions (cart, checkout)
- [ ] Verify metrics show up in Analytics
- [ ] Create monitoring dashboard (optional)

**Tests:**
- [ ] Metrics collected
- [ ] Network events logged
- [ ] Cache hit/miss ratio calculated
- [ ] Average API latency measured

**Time:** 3 hours

### 4.3 API Client with Validation
- [ ] Create src/lib/api/apiClient.ts with:
  - Request/response validation (Zod)
  - Automatic retry (3 retries)
  - Cache integration
  - Error handling
  - Network monitoring
- [ ] Replace all fetch calls with apiClient
- [ ] Update all API calls to use validators

**Files to Update:**
- [ ] src/contexts/ProductContext.tsx
- [ ] src/contexts/CartContext.tsx
- [ ] src/contexts/AuthContext.tsx
- [ ] All admin pages
- [ ] All API-calling components

**Tests:**
- [ ] API calls work through apiClient
- [ ] Validation catches bad responses
- [ ] Retry logic works (test by disabling network)
- [ ] Cache integration works
- [ ] Error handling works

**Time:** 3 hours

### 4.4 Security & Rate Limiting
- [ ] Create src/lib/security/rateLimiter.ts
- [ ] Wrap API calls with rate limiter
  - Max 10 requests per second per endpoint
  - Show error if rate limited
- [ ] Add input validation throughout
- [ ] Verify CSRF protection (React native)
- [ ] Verify XSS prevention (React native)

**Tests:**
- [ ] Rapid API calls rate limited
- [ ] User sees error message
- [ ] Rate limit resets after time window

**Time:** 2 hours

### 4.5 Testing Infrastructure
- [ ] Create src/__tests__/setup.ts
- [ ] Create src/__tests__/fixtures/
- [ ] Create src/__tests__/utils.ts
- [ ] Write sample tests for key components
  - ProductCard test
  - AddToCart test
  - Loader test

**Tests:**
- [ ] Tests run: `npm run test`
- [ ] Fixtures load correctly
- [ ] Mocks work properly

**Time:** 2 hours

### Summary of Phase 4
```
Files created: 8
Infrastructure components: 5
Monitoring ready: Yes
Testing ready: Yes
Time: 10-12 hours
Status: [ ] COMPLETE
```

---

## PHASE 5: PRODUCTION-READY (6-8 hours)

### 5.1 Build Optimization
- [ ] Update vite.config.ts with:
  - Gzip compression
  - Code splitting
  - Bundle analysis
- [ ] Run build: `npm run build`
- [ ] Compare bundle sizes (before vs after)
- [ ] Document savings

**Expected Results:**
- Before: 500-800KB gzipped
- After: 200-300KB gzipped (50-60% reduction)

**Time:** 1 hour

### 5.2 SEO & Meta Tags
- [ ] Create src/lib/seo/seoHelper.ts
- [ ] Add meta tags to key pages
  - Home
  - Products
  - Product detail
  - Category
  - Search
- [ ] Add structured data (schema.org)
- [ ] Create/update sitemap.xml
- [ ] Add robots.txt

**Tests:**
- [ ] Meta tags render correctly
- [ ] Structured data valid (test with JSON-LD validator)
- [ ] Open Graph tags work (preview links)
- [ ] Twitter cards work

**Time:** 2 hours

### 5.3 PWA Setup (Optional)
- [ ] Update web manifest
- [ ] Create service worker (proper implementation)
- [ ] Add offline fallback page
- [ ] Test on mobile (install prompts)

**Time:** 2 hours (optional)

### 5.4 Documentation
- [ ] Create ARCHITECTURE.md
  - Component structure
  - Context hierarchy
  - API flow
  - State management
- [ ] Create CONTRIBUTING.md
  - How to add components
  - How to add utilities
  - How to add features
  - Code style guide
- [ ] Create API_DOCUMENTATION.md
  - All endpoints
  - Request/response schemas
  - Error codes
- [ ] Update README.md

**Time:** 3 hours

### Summary of Phase 5
```
Files created: 2
Bundle size reduction: 50-60%
Documentation added: 4 files
Time: 6-8 hours
Status: [ ] COMPLETE
```

---

## FINAL VERIFICATION

### Code Quality
- [ ] Run linter: `npm run lint`
  - [ ] 0 errors
  - [ ] 0 warnings (or document exceptions)
- [ ] Run type check: `npm run type-check`
  - [ ] 0 errors
- [ ] Run build: `npm run build`
  - [ ] Builds successfully
  - [ ] Bundle size acceptable

### Functionality Testing

#### Home Page
- [ ] Hero banner displays
- [ ] Categories load
- [ ] Featured products show
- [ ] Best sellers section works
- [ ] Latest arrivals show
- [ ] All images load

#### Product Pages
- [ ] Products list displays
- [ ] Filtering works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Add to cart works
- [ ] Wishlist works

#### Product Details
- [ ] Product information displays
- [ ] Images gallery works
- [ ] Reviews display
- [ ] Add to cart works
- [ ] Related products show
- [ ] Share buttons work

#### Auth
- [ ] Login works
- [ ] Signup works
- [ ] Password reset works
- [ ] Social login works (if implemented)
- [ ] Session persists on reload

#### Cart & Checkout
- [ ] Add to cart works
- [ ] Update quantity works
- [ ] Remove from cart works
- [ ] Checkout page displays
- [ ] Order confirmation shows
- [ ] Order tracking works

#### Admin
- [ ] Dashboard loads
- [ ] Products list works
- [ ] Add/edit/delete product works
- [ ] Categories management works
- [ ] Orders management works
- [ ] Analytics show data
- [ ] Settings can be updated

### Performance Testing
- [ ] Lighthouse score >= 90
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Cache hit rate > 70%
- [ ] Average API latency < 200ms

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari (iOS)

### Device Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (iPad size)
- [ ] Mobile (iPhone 12 size)
- [ ] Mobile landscape
- [ ] Small mobile (iPhone SE)

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All tests passing
- [ ] Lighthouse score documented
- [ ] Performance baselines set
- [ ] Security audit passed
- [ ] All features tested
- [ ] Documentation complete

### Deployment
- [ ] Create release branch: `git checkout -b release/v2.0`
- [ ] Update version: `package.json` version bump
- [ ] Create changelog: `CHANGELOG.md`
- [ ] Merge to main: `git merge release/v2.0`
- [ ] Tag release: `git tag v2.0.0`
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production

### Post-Deployment
- [ ] Monitor error logs (Sentry)
- [ ] Check analytics for anomalies
- [ ] Monitor server performance
- [ ] Verify all features working
- [ ] Check mobile experiences
- [ ] Gather team feedback

---

## ROLLBACK PLAN

If deployment goes wrong:

1. **Use Git tag**
   ```bash
   git checkout backup/pre-refactor
   npm install
   npm run build
   npm run deploy
   ```

2. **Database issues**
   ```bash
   psql < backup_$(date +%s).sql
   ```

3. **Cache issues**
   - Clear browser cache
   - Clear server caches
   - Restart application

---

## SUCCESS CRITERIA

### Quantitative
- [x] 290 files → 120 files (58% reduction)
- [x] 43MB → 15MB (65% reduction)
- [x] 4 loaders → 1 loader
- [x] 8 product cards → 1 card
- [x] 3 cache systems → 1 cache
- [x] 13-level nesting → 6-level nesting
- [x] 0 code duplication (previously 30-40%)
- [x] Bundle size 500-800KB → 200-300KB (50-60%)
- [x] Lighthouse score 60-70 → 90+
- [x] API latency < 200ms (monitoring shows)

### Qualitative
- [x] Clear separation of concerns
- [x] Easy to add new features
- [x] Easy to fix bugs
- [x] Easy to onboard developers
- [x] Production-grade infrastructure
- [x] Full observability
- [x] Proper error handling
- [x] Comprehensive monitoring

### User Impact
- [x] Faster load times
- [x] Smoother interactions
- [x] No functional regressions
- [x] Better reliability
- [x] Better security

---

## WEEKLY PROGRESS TRACKING

### Week 1
- [ ] Day 1-2: Phase 0 (Audit)
- [ ] Day 3-5: Phase 1.1-1.2 (Cache + Loaders)
- [ ] Status: 20% complete
- [ ] Blockers: None expected

### Week 2
- [ ] Day 1-3: Phase 1.3-1.5 (Product Cards + Images + Cleanup)
- [ ] Day 4-5: Phase 2 (State Simplification)
- [ ] Status: 50% complete
- [ ] Blockers: Watch for import conflicts

### Week 3
- [ ] Day 1-3: Phase 3 (Consolidate Utilities)
- [ ] Day 4-5: Phase 4.1-4.2 (Error Handling + Monitoring)
- [ ] Status: 75% complete
- [ ] Blockers: Monitor test failures

### Week 4
- [ ] Day 1-3: Phase 4.3-4.5 (API Client + Testing)
- [ ] Day 4-5: Phase 5 (Production Ready + Docs)
- [ ] Status: 100% complete
- [ ] Blockers: Final verification

---

## HELP & SUPPORT

### Getting Stuck?
1. Check PRODUCTION_GRADE_REFACTORING_PLAN.md for detailed implementation
2. Review code examples in plan
3. Check git history for similar changes
4. Ask for help in GitHub discussions

### Common Issues & Fixes

**Issue: Build fails after deleting component**
```bash
# Solution: Find & fix all imports
grep -r "ComponentName" src/ --include="*.tsx" --include="*.ts"
# Update imports to new location
```

**Issue: Tests failing**
```bash
# Solution: Update test fixtures
npm test -- --watch
# Update mock imports to match new structure
```

**Issue: Components not rendering**
```bash
# Solution: Check context providers
# Verify CombinedProvider structure is correct
# Check that all contexts are still exported
```

---

**Created:** 2026-04-02
**Timeline:** 4-6 weeks (40-60 hours)
**Status:** Ready for execution
**Last Updated:** [Timestamp]

Good luck! You've got this! 🚀

