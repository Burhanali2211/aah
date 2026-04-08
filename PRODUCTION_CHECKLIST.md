# Production Deployment Checklist

## Pre-Deployment (You Must Do)

### 1. Security — CRITICAL
- [ ] Rotate Razorpay keys
  - Old key: `rzp_live_RpRRhOfaHwt3VF`
  - Action: https://dashboard.razorpay.com → Settings → Keys
  - Copy new key to Vercel dashboard (VITE_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)

- [ ] Rotate Supabase credentials
  - Old anon key exposed in .env
  - Action: Supabase → Settings → API → Regenerate anon key
  - Copy to Vercel dashboard (VITE_SUPABASE_ANON_KEY)
  - DO NOT use service role key in frontend

- [ ] Delete .env from disk
  - ```bash
    rm .env
    ```

- [ ] Verify no other secret files exist
  - ```bash
    find . -name ".env*" -o -name "*secret*" -o -name "*key*" | grep -v node_modules
    ```

### 2. Vercel Configuration
- [ ] Set environment variables in Vercel Dashboard
  - Project → Settings → Environment Variables
  - Required:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY (rotated)
    - VITE_RAZORPAY_KEY_ID (rotated)
    - VITE_SITE_URL=https://aah-teal.vercel.app
    - VITE_APP_ENV=production
  - Optional:
    - VITE_GA_MEASUREMENT_ID (if using analytics)

- [ ] Verify vercel.json is correct
  - SPA routing configured (index.html fallback)
  - Cache headers set for /assets/
  - CORS headers for /api/

### 3. Code Review
- [ ] npm run lint (0 errors)
- [ ] npm run type-check (0 errors)
- [ ] npm run build (successful)
- [ ] Test critical flows locally:
  - Homepage loads
  - Product pages load
  - Login/signup works
  - Cart add/remove works
  - Checkout starts (don't complete payment)
  - Admin dashboard accessible (if admin user created)

### 4. Testing
- [ ] npm test (baseline tests passing)
- [ ] Manual smoke test on Vercel preview

---

## After Deployment (You Should Verify)

- [ ] https://aah-teal.vercel.app loads
- [ ] Direct navigation to /products works (SPA routing)
- [ ] Page refresh on /products works (no 404)
- [ ] Login modal appears
- [ ] Product add to cart works
- [ ] Cart persists on page reload
- [ ] No console errors (DevTools → Console)
- [ ] No Vercel deployment errors (Vercel → Deployments → Logs)

---

## Monitoring (Ongoing)

Check weekly:
- [ ] Vercel deployment status (no failed builds)
- [ ] Error rate in Vercel logs (should be low)
- [ ] User feedback in Support/Contact form
- [ ] Database growth in Supabase dashboard

---

## Rollback Plan

If deployment breaks:
1. **Quick rollback**: Go to Vercel → Deployments → [previous stable] → "Redeploy"
2. **Full rollback**: `git revert HEAD && git push` (creates new commit undoing changes)
3. **Emergency**: Contact Vercel support if database is corrupted

---

## What I Fixed (Automatically)

✅ Removed PWA (Service Worker disabled)
✅ Removed Sentry (error tracking)
✅ Removed Google Analytics
✅ Removed unused dependencies (@anthropic-ai/sdk, bcryptjs, motion-utils)
✅ Removed unused contexts (GlobalStateManager, NetworkStatusContext)
✅ Added environment validation (src/utils/envValidation.ts)
✅ Added localStorage validation (src/utils/storageValidation.ts)
✅ Added test suite (vitest configuration)
✅ Created .env.example
✅ Cleaned main.tsx (removed analytics init, service worker)

---

## Next Phase (After Deployment)

1. Implement automated tests (CI/CD pipeline)
2. Add rate limiting on payment API
3. Set up database backups in Supabase
4. Add email verification flow
5. Implement analytics properly (if needed)
6. Add request logging for debugging

---

**Status**: Ready for deployment. Keys need rotation first.
