# Production Deployment Checklist

**Status:** Code Implementation ✅ | Deployment Pending ⏳

**Timeline:** ~2-3 hours for complete deployment

---

## Pre-Deployment (Before Day 1)

### A. Create Passwords & Keys

These should be done BEFORE any deployment.

- [ ] **Razorpay New Key Pair**
  - Go to: https://dashboard.razorpay.com/app/settings/api-keys
  - Click: "Generate Key Pair"
  - Save both Key ID and Secret securely
  - NOTE: You'll need both old (to delete) and new (to deploy)

- [ ] **Store secrets safely**
  - Write down: New Razorpay Key ID, Secret
  - Write down: Supabase URL, Anon Key
  - Write down: Current Frontend URL
  - Keep in a password manager (1Password, LastPass, etc.)

---

## Day 1: Phase 1 Ops — Credential Rotation

### B. Razorpay Dashboard — Delete Old Key ⚠️ CRITICAL

1. Go to: https://dashboard.razorpay.com/app/settings/api-keys
2. Find old key: `rzp_live_RpRRhOfaHwt3VF`
3. Click **Delete** button next to it
4. Confirm deletion
5. ✅ Verify: old key no longer appears in the list

**Why:** Compromised key in git history must be invalidated immediately.

### C. Vercel — Set Production Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select project: `aligarh-attars` (or whatever it's named)
3. Go to: Settings → Environment Variables
4. **For each variable below:**
   - Click "Add"
   - Name: (from list)
   - Value: (your value)
   - Environment: **Production** (this is important!)
   - Click "Save"

**Variables to add:**

| Name | Value | Source |
|------|-------|--------|
| `RAZORPAY_KEY_ID` | New key ID from Step B | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | New secret from Step B | Razorpay Dashboard |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Supabase Dashboard → Settings → API |
| `FRONTEND_URL` | `https://aah-teal.vercel.app` | (your deployed domain) |

5. ✅ Verify: All 5 variables appear with values set to "Production"

### D. Supabase — Verify RLS Policies

1. Go to: https://app.supabase.com
2. Select project
3. Go to: SQL Editor
4. Run this query:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

**Expected output:**
- 22 rows
- All have `rowsecurity = true`

**If any show `false`:**
- Run: `supabase/schema/006_rls_policies.sql` in SQL Editor
- Then run the verification query again

5. ✅ Verify: All 22 tables have `rowsecurity = true`

---

## Day 2: Deploy Code

### E. Push Code to Git & Deploy to Vercel

```bash
# Commit all changes
git add -A
git commit -m "chore: security hardening for production deployment

- Phase 2: Frontend security (lockout, field filtering, CORS)
- Phase 3: Backend authority layer (Edge Functions)
- Phase 4: Deployment hardening (security headers, rate limiting)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push to main (triggers Vercel auto-deploy)
git push origin main
```

**Track deployment:**
1. Go to: https://vercel.com/dashboard
2. Select project
3. Watch "Deployments" tab
4. Wait for green checkmark next to latest commit (2-5 minutes)
5. ✅ Verify: "Deployment Status: Ready"

### F. Deploy Edge Functions to Supabase

```bash
# Optional: preview locally first
supabase functions serve

# Deploy all 4 functions
supabase functions deploy product-mutations --no-verify-jwt
supabase functions deploy order-mutations --no-verify-jwt
supabase functions deploy admin-operations --no-verify-jwt
supabase functions deploy payment-process --no-verify-jwt

# Each should output: "Function deployed successfully"
```

✅ Verify: No error messages

### G. Set Supabase Edge Function Secrets

```bash
# Replace values with your actual keys
supabase secrets set FRONTEND_URL="https://aah-teal.vercel.app"
supabase secrets set SUPABASE_ANON_KEY="your-anon-key-from-dashboard"
supabase secrets set RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXXXX"
supabase secrets set RAZORPAY_KEY_SECRET="your-new-secret"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your-new-secret"
```

Verify secrets were set:
```bash
supabase secrets list
```

✅ Verify: All 5 secrets appear in the list

---

## Day 2-3: Manual Supabase Configuration

### H. Configure Supabase Authentication

1. Go to: https://app.supabase.com → Project → Authentication → Providers
2. Click on **Email**
3. Configure:
   - [ ] "Confirm email" → Toggle **ON**
   - [ ] "Secure password hashing" → Already should be SHA256 or bcrypt
4. Go back to Authentication → URL Configuration
5. In "Site URL" field:
   - [ ] Set to: `https://aah-teal.vercel.app`
6. In "Redirect URLs" field:
   - [ ] Add: `https://aah-teal.vercel.app/**`
7. Click **Save**

8. Go to: Authentication → Policies
9. Set:
   - [ ] "Minimum password length": `8`
   - [ ] "JWT expiration": `3600` (1 hour)
   - [ ] "Refresh token expiration": `604800` (7 days)

✅ Verify: Settings saved without errors

### I. Configure Storage Bucket

1. Go to: https://app.supabase.com → Project → Storage
2. Find **images** bucket
3. Click on it → Settings
4. Set:
   - [ ] "Is public" → Toggle **ON**
   - [ ] "Max upload file size (MB)": `10`
5. Click **Save**

6. Go to: Storage → images → Policies
7. Verify 5 policies exist:
   - [ ] "images: public read"
   - [ ] "images: auth upload"
   - [ ] "images: users delete own"
   - [ ] "images: admin delete all"
   - [ ] "images: admin update"

**If policies are missing:**
- Go to: SQL Editor
- Paste: `supabase/migrations/003_storage_policies.sql`
- Run all statements
- Re-check Policies tab

✅ Verify: All 5 policies visible and enabled

---

## Day 3: Smoke Tests

### J. Test Frontend Basic Flow

1. Open: https://aah-teal.vercel.app
2. **Homepage loads:**
   - [ ] No console errors (F12)
   - [ ] Products load from database
   - [ ] No seller_id, cost_price fields exposed in Network tab

3. **Login flow:**
   - [ ] Sign up with email works
   - [ ] Email confirmation sent
   - [ ] Confirm email → account created
   - [ ] Login works with email/password
   - [ ] Session saved in localStorage

4. **Login lockout:**
   - [ ] Try wrong password 5 times
   - [ ] 6th attempt shows: "Account temporarily locked..."
   - [ ] Wait 5 seconds (or full 15 min in prod)
   - [ ] Try again → success

5. **Product browsing:**
   - [ ] Browse homepage products
   - [ ] Open product detail
   - [ ] No internal fields exposed

✅ Verify: All tests pass

### K. Test File Upload

1. Go to profile/avatar upload
2. **Upload image:**
   - [ ] Select a .jpg or .png (< 10MB)
   - [ ] Upload succeeds
   - [ ] Progress bar shows 0-100%
   - [ ] Image appears in profile
   - [ ] Network tab shows `/storage/v1/object/public/images/avatars/...`

3. **Try unauthorized upload (if possible):**
   - [ ] Logout
   - [ ] Try to upload via direct API call
   - [ ] Should fail: "Authentication required"

✅ Verify: Upload works when logged in, fails when logged out

### L. Test Order Creation

1. **Add products to cart:**
   - [ ] Browse products
   - [ ] Click "Add to Cart"
   - [ ] See cart count increase

2. **Start checkout:**
   - [ ] Click Cart icon
   - [ ] Click "Checkout"
   - [ ] Fill shipping address
   - [ ] Select payment method
   - [ ] Click "Place Order"

3. **Verify order creation:**
   - [ ] Order page shows (should redirect after payment)
   - [ ] Order number is format: `AA-YYYYMMDD-NNNN` (e.g., AA-20260412-0001)
   - [ ] Order status is "pending"
   - [ ] Items are listed

✅ Verify: Order number server-generated in correct format

### M. Test Admin Operations

1. **Login as admin** (if test admin exists)
2. **Go to admin dashboard**
   - [ ] Dashboard loads without 403 error
   - [ ] Stats visible

3. **Try creating product:**
   - [ ] Fill product form
   - [ ] Click "Create Product"
   - [ ] Should succeed and appear in products list

4. **Try updating product:**
   - [ ] Click product
   - [ ] Change price/name
   - [ ] Click "Save"
   - [ ] Should succeed without direct Supabase call

✅ Verify: Admin operations work via Edge Functions

### N. Test CORS Security

In browser console, try:

```javascript
// Should fail with CORS error
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' }
})
```

**Expected:** CORS error (if accessing from unauthorized origin)

```bash
# From curl (different origin):
curl -X POST "https://aah-teal.vercel.app/api/payment-process" \
  -H "Origin: https://evil.com" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
# Expected response header: Access-Control-Allow-Origin: https://aah-teal.vercel.app (NOT evil.com)
```

✅ Verify: CORS restricts to authorized origins

---

## Post-Deployment Monitoring

### O. Set Up Alerts (Optional but Recommended)

**Vercel alerts:**
1. Go to: https://vercel.com/dashboard → Project → Settings
2. Notifications → Email
3. Enable: "Failed deployments", "Critical metrics"

**Supabase alerts:**
1. Go to: https://app.supabase.com → Project → Logs
2. Set up real-time log streaming
3. Watch for errors in Edge Functions

**Monitoring weekly:**
- Check Vercel deployment history (any failures?)
- Check Supabase logs for 429 rate limit errors
- Check Supabase auth logs for brute-force attempts
- Monitor order creation success rate

### P. Database Backups

**Enable automatic backups:**
1. Go to: https://app.supabase.com → Project → Database → Backups
2. Click "Enable backups"
3. Select frequency: Daily
4. Set retention: 30 days

✅ Verify: Backups enabled and running

---

## Summary: What Gets Deployed

| Component | Type | Status |
|-----------|------|--------|
| Frontend (React + Vite) | Vercel | ✅ Auto-deployed |
| Edge Functions (Deno) | Supabase | ✅ Manually deployed |
| Database (PostgreSQL) | Supabase | ✅ Already running |
| Storage (S3) | Supabase | ✅ Already configured |
| Secrets (Keys) | Vercel + Supabase | ✅ Manually set |

---

## Rollback Plan

If deployment goes wrong:

**Quick revert (code):**
```bash
git revert <commit-hash>
git push origin main
# Wait for Vercel to auto-deploy previous commit
```

**Revert secrets:**
```bash
# If old Razorpay key still works:
supabase secrets set RAZORPAY_KEY_ID="old-key-id"
supabase secrets set RAZORPAY_KEY_SECRET="old-secret"
# Also update in Vercel Dashboard
```

**Disable Edge Functions (temporary):**
```bash
supabase functions disable product-mutations
supabase functions disable order-mutations
```

---

## Success Criteria ✅

After deployment, verify:

1. [ ] Homepage loads (public users can browse products)
2. [ ] Login works (5-fail lockout triggers)
3. [ ] Products list doesn't expose internal fields
4. [ ] File upload requires authentication
5. [ ] Order numbers are AA-YYYYMMDD-NNNN format
6. [ ] Admin operations work via Edge Functions
7. [ ] CORS restricts to authorized origins
8. [ ] No console errors from security headers
9. [ ] Rate limiting works (429 after 30 requests/min)
10. [ ] Razorpay payments work with new keys

---

## Support & Escalation

If you get stuck:

1. **Check Vercel logs:** https://vercel.com/dashboard → Deployments → Function Logs
2. **Check Supabase logs:** https://app.supabase.com → Logs
3. **Check browser console:** F12 → Console tab
4. **Check Network tab:** F12 → Network, look for failed requests

**Common errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/expired JWT | Login again |
| 403 Forbidden | Insufficient role | Login as admin |
| 429 Too Many Requests | Rate limit exceeded | Wait 1 minute |
| CORS error | Origin not whitelisted | Check FRONTEND_URL |
| "Deno.env.get() undefined" | Secret not set | Run `supabase secrets set` |
| "Invalid signature" | Razorpay key mismatch | Verify key rotation complete |

---

## Timeline Summary

**Pre-deployment:** 30 min (generate keys, write them down)
**Day 1 ops:** 1 hour (Razorpay, Vercel env vars, RLS verification)
**Day 2 code:** 30 min (git push, Edge Function deploy, secrets)
**Day 2-3 config:** 1 hour (Supabase auth, storage, policies)
**Day 3 testing:** 1-2 hours (smoke tests)

**Total: ~4-5 hours spread over 3 days**

---

**Status:** Ready for deployment ✅
**Last Updated:** 2026-04-12
