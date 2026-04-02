# PHASE 3: CONSOLIDATE UTILITIES & HOOKS - IMPLEMENTATION STRATEGY

**Objective:** Consolidate 46 utility/hook files into 25 files  
**Time Estimate:** 6-8 hours  
**Risk Level:** MEDIUM (careful refactoring required)  
**Approach:** INCREMENTAL WITH VERIFICATION AT EACH STEP

---

## LESSONS FROM PHASE 2 ERRORS

### ❌ What We Did Wrong
1. **Assumption Error:** Assumed interfaces were properly merged - they had conflicting properties
2. **Incomplete Sed:** Used simple sed commands that missed files with different path patterns
3. **No Verification:** Didn't verify ALL imports after bulk find/replace
4. **Premature Commit:** Committed without checking for remaining stragglers

### ✅ What We'll Do Right in Phase 3
1. **Verify First:** Audit ALL files before making changes
2. **Test Each Step:** Build after EVERY consolidation
3. **Comprehensive Replace:** Use multiple patterns to catch all variations
4. **Double-Check:** Verify 0 remaining old imports before committing
5. **Backward Compat:** Test that old imports still work

---

## PHASE 3 DETAILED STEP-BY-STEP PLAN

### STEP 1: Image Utilities Consolidation (1 hour)

**Files to Consolidate:**
- `src/utils/imageUrlUtils.ts` (170 lines)
- `src/utils/imageUtils.ts` (68 lines)
- `src/utils/productImageUtils.ts` (51 lines)
- **Total:** 289 lines → 1 file

**Step 1.1: Audit Current Usage**
```bash
# BEFORE making ANY changes
grep -r "imageUrlUtils\|imageUtils\|productImageUtils" src --include="*.tsx" --include="*.ts" | grep -v ".map:" | wc -l
# Expected: ~13 files importing these utilities
```

**Step 1.2: Document Current Imports**
```bash
grep -r "from.*imageUrlUtils\|from.*imageUtils\|from.*productImageUtils" src --include="*.tsx" --include="*.ts"
# Save this output - will need to verify all imports after consolidation
```

**Step 1.3: Create New Unified File**
```
src/utils/images/index.ts
```
- Copy all functions from imageUrlUtils.ts
- Copy all functions from imageUtils.ts
- Copy all functions from productImageUtils.ts
- Export unified API with clear names

**Step 1.4: Update Imports (Methodically)**
```bash
# Find all files with image imports
grep -l "imageUrlUtils\|imageUtils\|productImageUtils" src/**/*.tsx src/**/*.ts

# For EACH file:
# 1. Open file
# 2. Replace old import with: import { ... } from '../../utils/images'
# 3. Verify functions are available
# 4. Build to check for errors
```

**Step 1.5: Build & Verify**
```bash
npm run build
# Check: 0 errors, 0 warnings
# Check: bundle size unchanged
```

**Step 1.6: Verify ALL Imports Updated**
```bash
grep -r "from.*imageUrlUtils\|from.*imageUtils\|from.*productImageUtils" src
# Expected: 0 results
```

**Step 1.7: Delete Old Files**
```bash
rm src/utils/imageUrlUtils.ts
rm src/utils/imageUtils.ts
rm src/utils/productImageUtils.ts
```

**Step 1.8: Final Build & Test**
```bash
npm run build
# Verify: Still passing
```

**Step 1.9: Commit with Clear Message**
```bash
git add src/utils/images/index.ts
git rm src/utils/imageUrlUtils.ts src/utils/imageUtils.ts src/utils/productImageUtils.ts
git add -A
git commit -m "Phase 3.1: Consolidate image utilities

Merged 3 image utility files into unified module:
- imageUrlUtils.ts (170 lines)
- imageUtils.ts (68 lines)
- productImageUtils.ts (51 lines)

Created: src/utils/images/index.ts with unified API
Updated: 13 components importing from new location
Deleted: 3 old utility files

Verification:
- grep confirms: 0 old imports remaining
- Build passes ✅
- All components importing correctly
- No API changes (backward compatible)"
```

---

### STEP 2: Accessibility Consolidation (30 mins)

**Files to Consolidate:**
- `src/utils/accessibilityEnhancements.tsx` (68 lines)
- `src/utils/accessibilityUtils.ts` (45 lines)
- **Total:** 113 lines → 1 file

**REPEAT STEP 1 PATTERN:**
1. Audit current usage
2. Document current imports
3. Create new file: `src/utils/accessibility/index.ts`
4. Update ALL imports (verify file by file)
5. Build & verify
6. Verify 0 old imports remain
7. Delete old files
8. Final build & test
9. Commit with clear message

---

### STEP 3: Performance Monitoring Consolidation (1.5 hours)

**Files to Consolidate:**
- `src/utils/performanceMonitor.ts` (120 lines)
- `src/hooks/usePerformanceMonitoring.ts` (45 lines)
- `src/hooks/usePerformanceOptimization.ts` (38 lines)
- `src/utils/metricsTracker.ts` (65 lines)
- **Total:** 268 lines → create `src/utils/monitoring/index.ts` + update hooks

**IMPORTANT DIFFERENCE:** This one has hooks, so:
1. Create `src/utils/monitoring/index.ts` with utilities
2. Create `src/hooks/usePerformance.ts` (unified hook)
3. Update ALL imports of these 4 files
4. Verify all hooks still work
5. Build & test
6. Commit

---

### STEP 4: Analytics Consolidation (45 mins)

**Files to Consolidate:**
- `src/utils/analytics.ts` (65 lines)
- `src/hooks/useDataLayer.ts` (38 lines)
- `src/hooks/usePageTracking.ts` (38 lines)
- **Total:** 141 lines → tracking utilities + hook

**REPEAT PATTERN:**
1. Create `src/utils/tracking/index.ts`
2. Create `src/hooks/useAnalytics.ts`
3. Update ALL imports
4. Build & verify
5. Commit

---

### STEP 5: Navigation Consolidation (45 mins)

**Files to Consolidate:**
- `src/hooks/useEnhancedNavigation.ts` (42 lines)
- `src/utils/navigationEnhancement.ts` (38 lines)
- **Total:** 80 lines → 1 hook

**REPEAT PATTERN:**
1. Merge into `src/hooks/useNavigation.ts`
2. Update ALL imports
3. Build & verify
4. Delete old files
5. Commit

---

### STEP 6: Cart UI Consolidation (1 hour)

**Files to Consolidate:**
- `src/hooks/useCartButtonState.ts` (35 lines)
- `src/hooks/useCartButtonStyles.ts` (45 lines)
- **Total:** 80 lines → 1 hook

**REPEAT PATTERN:**
1. Merge into `src/hooks/useCartButton.ts`
2. Update ALL imports
3. Build & verify
4. Delete old files
5. Commit

---

### STEP 7: Mobile Features Consolidation (1 hour)

**Files to Consolidate:**
- `src/hooks/useMobileAuth.ts` (28 lines)
- `src/hooks/useMobileGestures.ts` (120 lines)
- **Total:** 148 lines → 1 hook

**REPEAT PATTERN:**
1. Merge into `src/hooks/useMobile.ts`
2. Update ALL imports
3. Build & verify
4. Delete old files
5. Commit

---

### STEP 8: Split Validation.ts (1.5 hours)

**Current:** `src/utils/validation.ts` (280 lines) - TOO LARGE

**Action:** SPLIT into domain-specific files:
- `src/utils/validation/form.ts` - Form validation rules
- `src/utils/validation/email.ts` - Email validation
- `src/utils/validation/payment.ts` - Payment validation
- `src/utils/validation/index.ts` - Unified exports

**Process:**
1. Create folder structure
2. Analyze validation.ts to identify domains
3. Split carefully (keep exports same for backward compat)
4. Update imports
5. Build & verify
6. Delete old file
7. Commit

---

### STEP 9: Audit & Cleanup (1 hour)

**Files to Investigate:**
- `src/utils/resourceManager.tsx` - Used?
- `src/utils/stateManagement.ts` - Overlaps with contexts?
- `src/utils/dataExport.ts` - Used where?
- `src/utils/serviceWorker.ts` - Purpose?

**For EACH file:**
```bash
# Check if file is imported anywhere
grep -r "resourceManager\|stateManagement\|dataExport\|serviceWorker" src --include="*.tsx" --include="*.ts"

# If imported:
#   - Keep and document purpose
# If NOT imported:
#   - Delete and note in commit
```

---

## ERROR PREVENTION CHECKLIST

Before making ANY changes to a step:
- [ ] Verified current imports with grep
- [ ] Documented all affected files
- [ ] Created backup branch (implicit via git)

During consolidation:
- [ ] Changed only the files I planned to change
- [ ] Verified new files have correct exports
- [ ] Updated ALL import paths (not just some)
- [ ] Used comprehensive sed patterns (all relative paths)
- [ ] Didn't assume interface compatibility

After consolidation:
- [ ] Ran `npm run build` successfully
- [ ] Verified 0 errors, 0 warnings
- [ ] Checked with grep: 0 old imports remain
- [ ] Tested that imports actually work
- [ ] Committed with clear message

---

## CRITICAL RULES FOR PHASE 3

### Rule 1: ALWAYS VERIFY BEFORE & AFTER
```bash
# Before: Count files
ls src/utils/*.ts src/utils/*.tsx src/hooks/*.ts | wc -l

# After: Count files (should be less)
ls src/utils/*.ts src/utils/*.tsx src/hooks/*.ts | wc -l

# Before: Check imports
grep -r "oldFile" src | wc -l

# After: Check imports (should be 0)
grep -r "oldFile" src | wc -l
```

### Rule 2: BUILD AFTER EVERY STEP
```bash
npm run build
# If error: STOP, fix before continuing
# If success: Continue to next file
```

### Rule 3: TEST IMPORTS COMPREHENSIVELY
```bash
# Not just: grep -r "CartContext"
# But also: grep -r "CartContext\|from.*CartContext\|import.*CartContext"

# Not just: Check main paths
# But also: Check ../../, ../../../, ../../../.. relative paths
```

### Rule 4: NEVER ASSUME - ALWAYS VERIFY
- Don't assume interface properties are correct - verify structure
- Don't assume all imports updated - grep and verify 0 remain
- Don't assume build works - actually run build
- Don't assume no breaking changes - test imports

### Rule 5: COMMIT INCREMENTALLY
- Each step = 1 commit
- Each commit should be atomic (one logical change)
- Never combine unrelated changes
- Write clear commit messages

---

## SUCCESS CRITERIA FOR PHASE 3

✅ **Files Consolidated:**
- 46 utility/hook files → 25 files (-46%)
- 8 duplicate utilities → 0
- Organized into logical folders

✅ **Code Quality:**
- 0 TypeScript errors
- 0 runtime errors
- 0 console errors
- All imports resolved

✅ **Backward Compatibility:**
- Old imports still work (via exports)
- No breaking changes
- Gradual migration possible

✅ **Build Status:**
- Build passes
- Bundle size maintained
- No performance regression

✅ **Documentation:**
- Clear commit messages
- Each step documented
- File organization explained

---

## CURRENT STATE BASELINE

```
Before Phase 3:
- Utility files: 27
- Hook files: 19
- Total: 46 files
- Total lines: ~3,250

After Phase 3 (Target):
- Utility files: 14 + organized folders
- Hook files: 12
- Total: 25 files (rounded)
- Total lines: ~3,100 (reorganized, not necessarily reduced)
```

---

## ESTIMATED TIMELINE

```
Step 1: Image utilities        1 hour    ✓ Detailed plan ready
Step 2: Accessibility          30 mins
Step 3: Performance monitoring 1.5 hours
Step 4: Analytics              45 mins
Step 5: Navigation             45 mins
Step 6: Cart UI               1 hour
Step 7: Mobile features       1 hour
Step 8: Validation split      1.5 hours
Step 9: Audit & cleanup       1 hour
         ─────────────────────────
TOTAL:  9 hours (allowing 1-2 hours buffer)
```

---

## READY TO START

✅ Phase 2 is solid (verified clean build)
✅ Detailed plan written
✅ Error prevention rules defined
✅ Success criteria clear
✅ Ready to execute carefully

**RECOMMENDATION:** Start with Step 1 (Image Utilities) using the exact pattern described above. Will verify each step thoroughly before moving to next.

