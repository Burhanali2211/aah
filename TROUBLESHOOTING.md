# Troubleshooting Guide

## Common Issues

### Build Fails
**Error**: `Cannot find module 'path'` or missing dependencies
```bash
npm install
npm run build
```

### Dev Server Won't Start
**Error**: Port 5173 already in use
```bash
# Kill process on port 5173, or use different port:
npm run dev -- --port 5174
```

### Supabase Connection Failed
**Check**:
1. .env has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Browser DevTools → Network → supabase.co requests (check 401/403)
3. Supabase dashboard → Auth → Settings → Redirect URLs includes `http://localhost:5173`

**Fix**:
```bash
# On deployment, ensure Vercel env vars are set (not .env)
# See Vercel → Settings → Environment Variables
```

### 404 on Direct Navigation / Refresh
**Root cause**: SPA routing not configured
**Fix**: Already configured in vercel.json (index.html fallback). If broken:
1. Verify Vercel build succeeded (Vercel Dashboard → Deployments)
2. Check vercel.json has:
   ```json
   {
     "trailingSlash": false,
     "cleanUrls": false
   }
   ```
3. Redeploy: push to main or trigger manual deploy in Vercel

### Razorpay Payment Fails
**Error**: "Order creation failed" or "Payment verification failed"
**Check**:
1. Razorpay test/live mode key in Vercel env vars
2. api/payment-process.js deployed (Vercel → Functions → api/payment-process)
3. Browser DevTools → Console for error details

**Common cause**: Mismatched key (test key used in production, or vice versa)

### Cart/Wishlist Lost on Refresh
**Root cause**: localStorage or auth state issue
**Check**:
1. DevTools → Application → LocalStorage → Check for `cart_*` and `wishlist_*` keys
2. If missing: browser cache cleared (Ctrl+Shift+Delete)
3. AuthContext initialization might be clearing storage (see src/main.tsx recovery logic)

**Temp fix**: Disable recovery logic in main.tsx (nuclear storage wipe):
```typescript
// Comment out lines 1-25 in src/main.tsx if causing issues
```

### Admin Dashboard Blank / No Data
**Check**:
1. Logged in as admin user? (role='admin' in Supabase)
2. No data in database? Run seed script:
   ```bash
   node scripts/seedSupabaseData.js
   ```
3. TypeScript errors? Run:
   ```bash
   npm run type-check
   ```

### Images Not Loading
**Check**:
1. Image path correct? (should be in `src/assets/images/` or public/)
2. Vercel cache issue? Hard refresh (Ctrl+Shift+R) or clear browser cache
3. Image file exists? Check Vercel deployment logs

**Optimization**: Run (but don't auto-commit):
```bash
node scripts/optimize-images.js
```

### Sentry Errors Not Showing
**Check**:
1. `VITE_APP_ENV=production` set? (Sentry only active in prod)
2. Error occurs in production only? Check Vercel logs
3. Sentry dashboard credentials correct in src/services/errorTracking.ts

### TypeScript Errors
```bash
npm run type-check
# Fix all errors before committing
```

### ESLint Warnings
```bash
npm run lint
npm run lint:fix  # Auto-fix common issues
```

---

## Debugging Tips

### Enable Debug Logs
```typescript
// In any component:
console.log('[DEBUG] message', data);  // Remove before commit
```

### Supabase Query Debugging
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*');
if (error) console.error('DB error:', error);  // See exact error
```

### Network Tab in DevTools
- Filter by `supabase.co` to see all DB calls
- Filter by `api.razorpay.com` to debug payments
- Check response tabs for error details

### Performance Profiling
```bash
node scripts/performance-profile.js  # Profile build time
```

### Git Issues
```bash
# See what changed:
git status
git diff [file]

# Revert changes:
git checkout [file]

# Undo last commit (if not pushed):
git reset --soft HEAD~1
```

---

## Emergency Fixes

### Force Deploy to Vercel
```bash
git push origin main  # Vercel auto-deploys on push
```

### Force Clear Cache
1. Vercel Dashboard → Deployments → [latest] → Redeploy
2. Or: Vercel → Settings → Deployment Protection → trigger redeploy

### Rollback to Previous Commit
```bash
git revert HEAD  # Safe: creates new commit that undoes changes
# Or if not deployed:
git reset --hard [commit-hash]
```

---

**Last Updated**: 2026-04-08
