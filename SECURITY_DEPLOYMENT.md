# Security Hardening & Production Deployment Checklist

**Status:** Phase 2-4 Implementation Complete | Awaiting Deployment & Phase 1 Ops

---

## Phase 1 — Emergency Ops (Pre-Deployment)

**These MUST be completed before deploying to production.**

### 1.1 Rotate Live Razorpay Keys ⚠️ CRITICAL

- [ ] Go to Razorpay Dashboard → Settings → API Keys
- [ ] Generate new Key ID and Key Secret pair
- [ ] **Delete old key immediately:** `rzp_live_RpRRhOfaHwt3VF`
- [ ] Update Vercel Production environment variables:
  - `RAZORPAY_KEY_ID` = new key ID
  - `RAZORPAY_KEY_SECRET` = new secret key
- [ ] Update Supabase Edge Function secrets:
  ```bash
  supabase secrets set RAZORPAY_KEY_ID=<new_key_id>
  supabase secrets set RAZORPAY_KEY_SECRET=<new_secret>
  supabase secrets set RAZORPAY_WEBHOOK_SECRET=<new_secret>
  ```

### 1.2 Verify RLS Policies Deployed ✅ or ❌

Run in Supabase SQL Editor:
```sql
SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' ORDER BY tablename;
```

**Expected output:** All 22 tables show `rowsecurity = true`

If missing, run in this order:
1. `supabase/schema/004_functions.sql` (defines `is_admin()`, `is_admin_or_seller()`)
2. `supabase/schema/006_rls_policies.sql` (table-level RLS)
3. `supabase/migrations/003_storage_policies.sql` (storage bucket RLS)

### 1.3 Verify Environment Variables in Vercel & Supabase

**Vercel Production:**
- [ ] `RAZORPAY_KEY_ID` = set
- [ ] `RAZORPAY_KEY_SECRET` = set (Production only!)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = set (Production only!)
- [ ] `FRONTEND_URL` = `https://aah-teal.vercel.app`

**Supabase Edge Function Secrets:**
```bash
supabase secrets list
```

Should show:
- `FRONTEND_URL=https://aah-teal.vercel.app`
- `SUPABASE_ANON_KEY=<your_anon_key>`
- `RAZORPAY_KEY_ID=<new_key>`
- `RAZORPAY_KEY_SECRET=<new_secret>`
- `RAZORPAY_WEBHOOK_SECRET=<new_secret>`

---

## Phase 2 — Frontend Security Hardening ✅ COMPLETE

| Task | File | Status |
|------|------|--------|
| 2.1 Login Lockout (SecurityManager) | `src/contexts/AuthContext.tsx` | ✅ |
| 2.2 Field Filtering (SELECT * → field list) | `src/lib/supabase.ts` | ✅ |
| 2.3 Storage Auth + Folder Validation | `src/services/storageService.ts` | ✅ |
| 2.4 Storage Bucket RLS Policies | `supabase/migrations/003_storage_policies.sql` | ✅ |
| 2.5 CORS Lockdown | Multiple files | ✅ |

---

## Phase 3 — Backend Authority Layer ✅ COMPLETE

### 3.1 Edge Function Client Wrapper ✅
- File: `src/lib/apiClient.ts`
- Auto-attaches Bearer token from current session
- Two namespaces: `productApi`, `orderApi`

### 3.2 Product Mutations Edge Function ✅
- File: `supabase/functions/product-mutations/index.ts`
- Actions: `create-product`, `update-product`, `delete-product`, `bulk-update`
- Auth: Bearer token → verify → check role (admin/seller)
- Field whitelist: prevents mass-assignment of `seller_id`, `created_at`, etc.
- Sellers can only manage their own products
- Rate limit: 30 req/min per user

### 3.3 Order Mutations Edge Function ✅
- File: `supabase/functions/order-mutations/index.ts`
- Actions: `create-order`, `update-status`
- Server-side order number generation: `AA-YYYYMMDD-NNNN`
- Create: any authenticated user
- Update status: admin/seller only, status validated against allowlist
- Rate limit: 30 req/min per user

### 3.4 ProductContext Refactored ✅
- Mutations now use `productApi` from `apiClient.ts`
- `addProduct()`, `updateProduct()`, `deleteProduct()` call Edge Function instead of direct Supabase

### 3.5 OrderContext Refactored ✅
- `createOrder()` now uses `orderApi.createOrder()` (server generates order number)
- `updateOrderStatus()` now uses `orderApi.updateStatus()` (server validates)
- Order items still created client-side (not security-critical)

---

## Phase 4 — Production Deployment ✅ COMPLETE

### 4.1 Security Headers ✅
- File: `vercel.json`
- Applied to `/((?!api/|assets/).*)` routes (main app):
  - `X-Frame-Options: DENY` → prevent clickjacking
  - `X-Content-Type-Options: nosniff` → prevent MIME sniffing
  - `Referrer-Policy: strict-origin-when-cross-origin` → control referrer exposure
  - `Content-Security-Policy` → restrict resource loading

### 4.2 Rate Limiting ✅
- Edge Functions: in-memory rate limiter, 30 req/min per user
- Vercel API: 20 req/min per IP (payment-process.js)

### 4.3 Supabase Auth Settings (Manual) ⚠️

In Supabase Dashboard → Authentication → Providers → Email:
- [ ] Email confirmation required: ON
- [ ] Minimum password length: 8 characters
- [ ] Allowed redirect URLs: `https://aah-teal.vercel.app/**`
- [ ] JWT expiry: 3600 seconds (1 hour)

### 4.4 Storage Bucket Settings (Manual) ⚠️

In Supabase Dashboard → Storage → Buckets → images:
- [ ] Bucket visibility: Public (CDN delivery)
- [ ] Max file size: 10 MB
- [ ] Verify 5 RLS policies exist:
  1. "images: public read"
  2. "images: auth upload"
  3. "images: users delete own"
  4. "images: admin delete all"
  5. "images: admin update"

---

## Pre-Deployment Verification

### Bundle Security Check
```bash
# Verify no secrets in production bundle
grep -r "KEY_SECRET\|SERVICE_ROLE" dist/ 2>/dev/null | wc -l  # must be 0

# Verify no SELECT * in products queries
grep -o "select.*'\*'" dist/assets/*.js 2>/dev/null | wc -l  # must be 0

# Verify .env not tracked
git ls-files .env .env.* | wc -l  # must be 0
```

### Database Sanity Checks

**Test anonymous read (should work):**
```bash
curl "https://your-supabase-url/rest/v1/products?limit=1" \
  -H "apikey: your-anon-key"
# Expected: returns 1 product

curl "https://your-supabase-url/rest/v1/profiles" \
  -H "apikey: your-anon-key"
# Expected: returns 0 rows (RLS blocks read)
```

**Test unauthenticated upload (should fail):**
```bash
curl -X POST "https://your-supabase-url/storage/v1/object/images/uploads/test.jpg" \
  -H "apikey: your-anon-key" \
  -d "binary-data"
# Expected: 401 Unauthorized
```

**Test login lockout (should trigger after 5 fails):**
- Try signing in with wrong password 5 times
- 6th attempt should show: "Account temporarily locked due to too many failed attempts"

### CORS Verification

**Cross-origin should be rejected:**
```bash
curl -X OPTIONS "https://aah-teal.vercel.app/api/payment-process?action=create-order" \
  -H "Origin: https://evil.com"
# Expected: Access-Control-Allow-Origin = https://aah-teal.vercel.app (NOT evil.com)
```

---

## Production Deployment Steps

### Step 1: Deploy to Vercel
```bash
git push origin main
# Vercel auto-deploys on push
```

### Step 2: Deploy Edge Functions to Supabase
```bash
supabase functions deploy product-mutations --no-verify-jwt
supabase functions deploy order-mutations --no-verify-jwt
supabase functions deploy admin-operations --no-verify-jwt
supabase functions deploy payment-process --no-verify-jwt
```

### Step 3: Set Supabase Secrets (if not done in Phase 1)
```bash
supabase secrets set FRONTEND_URL=https://aah-teal.vercel.app
supabase secrets set SUPABASE_ANON_KEY=<your-key>
supabase secrets set RAZORPAY_KEY_ID=<new-key>
supabase secrets set RAZORPAY_KEY_SECRET=<new-secret>
supabase secrets set RAZORPAY_WEBHOOK_SECRET=<new-secret>
```

### Step 4: Manual Supabase Configuration
1. Dashboard → Authentication → Providers → Email
   - Enable confirmation, set password length, redirect URLs
2. Dashboard → Storage → images bucket
   - Set visibility to Public
   - Set max file size to 10MB

### Step 5: Smoke Tests (Post-Deployment)
- [ ] Homepage loads without errors (network tab)
- [ ] Login works, lockout triggers after 5 fails
- [ ] Can browse products (no seller_id, cost_price exposed)
- [ ] Can upload avatar to profile
- [ ] Can create order (order number is AA-YYYYMMDD-NNNN format)
- [ ] Payment gateway accepts Razorpay orders
- [ ] Admin dashboard shows "Forbidden" if not logged in as admin
- [ ] Product update triggers Edge Function (check browser Network tab)

---

## Rollback Plan

If deployment fails:

1. **Revert code:** `git revert <commit-hash>`
2. **Wait for Vercel auto-deploy** (2-5 min)
3. **Disable Edge Functions (temporary):**
   ```bash
   supabase functions disable product-mutations
   supabase functions disable order-mutations
   ```
4. **Restore old Razorpay keys:**
   - Update Vercel: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - Razorpay Dashboard: activate old key, deactivate new one

---

## Post-Deployment Monitoring

**Monitor these metrics weekly:**

1. **Auth failures:** Dashboard → Authentication → API Requests (spike = attack)
2. **Rate limit hits:** Supabase Logs → Look for 429 responses
3. **CORS errors:** Browser console on customer devices
4. **Order creation fails:** Database → orders table, check for null order_number
5. **Product mutations errors:** Supabase Edge Functions → Logs

---

## Summary of Security Improvements

| Vulnerability | Before | After | Impact |
|---|---|---|---|
| **Client-side login lockout** | Bypassable (in-memory only) | Server-enforced (15-min account lock) | Brute-force attack blocked |
| **SELECT * exposure** | All fields visible (seller_id, cost_price) | Whitelist only public fields | Internal data protected |
| **Unauthenticated uploads** | Allowed (anyone can upload) | Requires login | File storage DoS prevented |
| **Path traversal uploads** | `folder='../../etc'` possible | Sanitized, allowlist checked | RCE/data access blocked |
| **Direct DB mutations** | Anon key can `.insert()` products | Only Edge Function can mutate | Authorization enforcement |
| **Wildcard CORS** | Any origin can call APIs | Only https://aah-teal.vercel.app | Cross-origin attacks blocked |
| **Client-side order numbers** | Race conditions, duplicates possible | Server generates AA-YYYYMMDD-NNNN | Audit trail consistency |
| **Admin mutations unprotected** | Role check only at display layer | Server-side role verification + RLS | Privilege escalation blocked |

---

## Contacts & References

- **Razorpay Support:** https://razorpay.com/support/
- **Supabase Docs:** https://supabase.io/docs/
- **Vercel Docs:** https://vercel.com/docs/

---

**Last Updated:** 2026-04-12  
**Deployment Status:** Ready for Phase 1 completion → Production
