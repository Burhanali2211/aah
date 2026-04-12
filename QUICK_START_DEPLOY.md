# Quick Start: Production Deployment

**⏱ Estimated time: 3-4 hours | Complexity: Medium**

---

## TL;DR Steps

```bash
# 1. Verify everything is ready (5 min)
chmod +x verify-deployment.sh
./verify-deployment.sh

# 2. RAZORPAY DASHBOARD (30 min)
# - Generate new API keys
# - Delete old key
# - Save new keys

# 3. VERCEL (5 min)
# Go to Vercel Dashboard → Project → Settings → Environment Variables
# Set 5 production environment variables (use new Razorpay keys)

# 4. SUPABASE SQL (5 min)
# Go to SQL Editor → Copy & run verify-rls.sql
# Verify: All 22 tables show rowsecurity = true

# 5. GIT & CODE (5 min)
git add -A
git commit -m "chore: prod security hardening"
git push origin main
# Wait for Vercel to auto-deploy (~2 min)

# 6. EDGE FUNCTIONS (5 min)
supabase functions deploy product-mutations --no-verify-jwt
supabase functions deploy order-mutations --no-verify-jwt
supabase functions deploy admin-operations --no-verify-jwt
supabase functions deploy payment-process --no-verify-jwt

# 7. SUPABASE SECRETS (2 min)
supabase secrets set FRONTEND_URL="https://aah-teal.vercel.app"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key"
supabase secrets set RAZORPAY_KEY_ID="rzp_live_XXXXX"
supabase secrets set RAZORPAY_KEY_SECRET="secret"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="secret"

# 8. SUPABASE AUTH SETTINGS (10 min)
# Go to Supabase → Authentication → Email
# Enable email confirmation, set min password 8 chars
# Go to URL Configuration → Site URL: https://aah-teal.vercel.app

# 9. SUPABASE STORAGE (10 min)
# Go to Storage → images bucket → Settings
# Enable Public, Max 10MB
# Go to Policies → Verify 5 RLS policies exist

# 10. SMOKE TESTS (1-2 hours)
# Open https://aah-teal.vercel.app
# Test: Login, lockout, upload, order, admin, CORS
```

---

## Detailed Step-by-Step

### Step 1: Pre-Check (5 min)

```bash
./verify-deployment.sh
# Should show all ✓ green checks
```

If any ✗ red checks, fix them before continuing.

---

### Step 2: Razorpay Key Rotation (30 min)

**Reason:** Old key was committed to git, must rotate immediately.

1. **Go to:** https://dashboard.razorpay.com/app/settings/api-keys
2. **Click:** "Generate Key Pair"
3. **Save:** New Key ID and Secret (write down!)
4. **Delete:** Old key `rzp_live_RpRRhOfaHwt3VF`
   - Find it in the list
   - Click delete button
   - Confirm
5. **Verify:** Old key no longer in list

---

### Step 3: Vercel Environment Variables (5 min)

1. **Go to:** https://vercel.com/dashboard
2. **Select:** aligarh-attars project
3. **Go to:** Settings → Environment Variables
4. **For each variable below:**
   - Click "Add"
   - Enter Name
   - Enter Value
   - Select "Production" environment
   - Click "Save"

**Variables to add:**

```
RAZORPAY_KEY_ID = your-new-key-id
RAZORPAY_KEY_SECRET = your-new-secret
SUPABASE_URL = https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
FRONTEND_URL = https://aah-teal.vercel.app
```

5. **Verify:** All 5 show with "Production" environment

---

### Step 4: Verify RLS Policies (5 min)

1. **Go to:** https://app.supabase.com → Project → SQL Editor
2. **Paste:** Contents of `verify-rls.sql`
3. **Run** (keyboard: Ctrl+Enter)
4. **Check first result:**
   - Should show 22 tables
   - All with `rowsecurity = true`

**If any show false:**
- Go back to SQL Editor
- Run: `supabase/schema/006_rls_policies.sql`
- Re-run verify-rls.sql

---

### Step 5: Push Code to Git (5 min)

```bash
git add -A
git commit -m "chore: prod security hardening"
git push origin main
```

**Track deployment:**
1. Go to: https://vercel.com/dashboard
2. Watch "Deployments" tab
3. Wait for green ✓ next to your commit

---

### Step 6: Deploy Edge Functions (5 min)

```bash
supabase functions deploy product-mutations --no-verify-jwt
supabase functions deploy order-mutations --no-verify-jwt
supabase functions deploy admin-operations --no-verify-jwt
supabase functions deploy payment-process --no-verify-jwt
```

Each should output: `✓ Function deployed successfully`

---

### Step 7: Set Supabase Secrets (2 min)

Get values from:
- FRONTEND_URL: your deployed domain
- SUPABASE_ANON_KEY: Supabase Dashboard → Settings → API → anon key
- RAZORPAY keys: New keys you generated in Step 2

```bash
supabase secrets set FRONTEND_URL="https://aah-teal.vercel.app"
supabase secrets set SUPABASE_ANON_KEY="eyJhbGc..."
supabase secrets set RAZORPAY_KEY_ID="rzp_live_XXXXX"
supabase secrets set RAZORPAY_KEY_SECRET="your-new-secret"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your-new-secret"

# Verify:
supabase secrets list
```

---

### Step 8: Configure Supabase Auth (10 min)

1. **Go to:** https://app.supabase.com → Project → Authentication
2. **Click:** Email provider
3. **Enable:**
   - Confirm email: **ON**
   - Min password length: **8**
4. **Go to:** Authentication → URL Configuration
5. **Set:**
   - Site URL: `https://aah-teal.vercel.app`
6. **Go to:** Authentication → Policies
7. **Set:**
   - Min password length: `8`
   - JWT expiration: `3600`
8. **Click:** Save

---

### Step 9: Configure Storage Bucket (10 min)

1. **Go to:** https://app.supabase.com → Project → Storage
2. **Click:** images bucket
3. **Click:** Settings
4. **Set:**
   - Is public: **ON**
   - Max file size: **10** MB
5. **Click:** Save

6. **Click:** Policies tab
7. **Verify 5 policies exist:**
   - images: public read
   - images: auth upload
   - images: users delete own
   - images: admin delete all
   - images: admin update

**If missing:**
- Go to SQL Editor
- Run: `supabase/migrations/003_storage_policies.sql`

---

### Step 10: Smoke Tests (1-2 hours)

Open https://aah-teal.vercel.app and test:

#### A. Homepage
- [ ] Loads without errors (check F12 Console)
- [ ] Products visible
- [ ] No seller_id, cost_price in Network tab

#### B. Login
- [ ] Sign up works
- [ ] Confirm email works
- [ ] Login with correct password works
- [ ] Wrong password 5 times → lockout message
- [ ] Wait 5 sec → can try again

#### C. Profile
- [ ] Upload avatar works (shows progress)
- [ ] Avatar saved and displayed

#### D. Shopping
- [ ] Add to cart works
- [ ] View cart works
- [ ] Checkout form works

#### E. Order
- [ ] Fill shipping address
- [ ] Place order (before payment is OK)
- [ ] Order page shows order number: `AA-YYYYMMDD-NNNN`
- [ ] Order status is "pending"

#### F. Admin (if you have admin account)
- [ ] Admin dashboard loads
- [ ] Can create product
- [ ] Product appears in list
- [ ] Can update price

#### G. CORS
In browser console:
```javascript
// Test cross-origin (should fail)
fetch('https://aah-teal.vercel.app/api/whatever', {
  headers: { 'Origin': 'https://evil.com' }
})
```
Expected: CORS error (good!)

---

## Success = All Tests Pass ✅

If all smoke tests pass, deployment is **COMPLETE**.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Vercel says "Environment variable not found" | Add variable to Production environment (not Preview) |
| Edge Function 404 error | Run `supabase functions deploy` again |
| "Undefined secret in Deno" | Run `supabase secrets set` again |
| Login lockout not working | Check SecurityManager in AuthContext.tsx (should import and wire) |
| Products still showing seller_id | Check PRODUCT_PUBLIC_FIELDS in supabase.ts (should filter) |
| Upload succeeds without login | Check StorageService.ts (should check session first) |
| CORS error from evil.com | Check getCorsHeaders in Edge Functions (should validate origin) |
| "Invalid signature" from Razorpay | Check you rotated keys and updated all 3 places (Vercel, Supabase, Razorpay) |

---

## Rollback (If Needed)

```bash
# Revert code
git revert <commit-hash>
git push origin main
# Wait 2-5 min for Vercel to redeploy

# Revert secrets (if Razorpay issue)
supabase secrets set RAZORPAY_KEY_ID="old-key"
supabase secrets set RAZORPAY_KEY_SECRET="old-secret"

# Also update in Vercel Production env vars
```

---

## Next Steps (After Deployment)

1. **Monitor** error logs daily for 1 week
2. **Celebrate** 🎉 (security hardening complete!)
3. **Update team** on new security practices
4. **Schedule** quarterly penetration testing

---

## Quick Reference

**File Locations:**
- Deployment guide: `DEPLOYMENT_CHECKLIST.md`
- Security details: `SECURITY_DEPLOYMENT.md`
- Secrets setup: `SUPABASE_SECRETS.md`
- RLS check: `verify-rls.sql`
- Auto verify: `verify-deployment.sh`

**URLs:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://app.supabase.com
- Razorpay Dashboard: https://dashboard.razorpay.com
- Live Site: https://aah-teal.vercel.app

---

**Status: Ready to Deploy! 🚀**

Time to deployment: 3-4 hours  
Risk level: Low  
Rollback time: 5 minutes
