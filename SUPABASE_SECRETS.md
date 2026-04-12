# Supabase Edge Function Secrets Setup

All Edge Functions require these secrets to be set in Supabase.

## How to Set Secrets

```bash
cd supabase/functions  # if you're not already there
supabase secrets set KEY_NAME="value"
```

To list all secrets:
```bash
supabase secrets list
```

---

## Required Secrets

### 1. FRONTEND_URL
**Used by:** All Edge Functions (for CORS origin validation)

```bash
supabase secrets set FRONTEND_URL="https://aah-teal.vercel.app"
```

### 2. SUPABASE_ANON_KEY
**Used by:** product-mutations, order-mutations, admin-operations (for token verification)

Get from: Supabase Dashboard → Settings → API → anon public key

```bash
supabase secrets set SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. RAZORPAY_KEY_ID
**Used by:** payment-process Edge Function

Get from: Razorpay Dashboard → Settings → API Keys (PRODUCTION KEY)

```bash
supabase secrets set RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXXXX"
```

### 4. RAZORPAY_KEY_SECRET
**Used by:** payment-process Edge Function

Get from: Razorpay Dashboard → Settings → API Keys (PRODUCTION KEY)

⚠️ **CRITICAL:** This is a SECRET. Rotate it per Phase 1 before deploying.

```bash
supabase secrets set RAZORPAY_KEY_SECRET="your-secret-here"
```

### 5. RAZORPAY_WEBHOOK_SECRET
**Used by:** payment-process Edge Function (webhook signature verification)

Get from: Razorpay Dashboard → Settings → API Keys (or use RAZORPAY_KEY_SECRET as fallback)

```bash
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your-webhook-secret-here"
```

---

## Complete Setup Command

Replace placeholders and run:

```bash
supabase secrets set FRONTEND_URL="https://aah-teal.vercel.app"
supabase secrets set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
supabase secrets set RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXXXXXX"
supabase secrets set RAZORPAY_KEY_SECRET="your-secret-key"
supabase secrets set RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
```

---

## Verification

After setting secrets, deploy Edge Functions:

```bash
supabase functions deploy product-mutations --no-verify-jwt
supabase functions deploy order-mutations --no-verify-jwt
supabase functions deploy admin-operations --no-verify-jwt
supabase functions deploy payment-process --no-verify-jwt
```

Check logs for any undefined secret errors:

```bash
supabase functions logs product-mutations
```

If you see "Deno.env.get() returned undefined for X", re-run the secrets set command.

---

## Rotation Schedule

- **RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET:** Rotate quarterly or immediately if compromised
- **SUPABASE_ANON_KEY:** Rotate if accidentally exposed (usually stable)
- **FRONTEND_URL:** Update only if domain changes

---

## Security Notes

1. **Never commit secrets to git**
   - `.env` is in `.gitignore` ✓
   - `supabase/.env.local` should be in `.gitignore` ✓

2. **Use Vercel environment variables for backend services**
   - SUPABASE_SERVICE_ROLE_KEY: Vercel only, never in frontend
   - RAZORPAY_KEY_SECRET: Vercel only, never in frontend

3. **SUPABASE_ANON_KEY is safe in frontend**
   - Only has INSERT/SELECT/UPDATE/DELETE restricted by RLS
   - Can be exposed in browser (it's in VITE_SUPABASE_ANON_KEY)

4. **Edge Function secrets are not exposed to frontend**
   - Only accessible inside Deno runtime
   - Vercel env vars are not passed to Edge Functions

---

## Troubleshooting

**"Deno.env.get() returned undefined"**
- Secret wasn't set properly
- Function was deployed before secret was set
- Solution: `supabase secrets set KEY=value` then `supabase functions deploy NAME --no-verify-jwt`

**"Permission denied" on Razorpay API**
- Key is wrong or expired
- Key is test mode (rzp_test_*) instead of live mode (rzp_live_*)
- Solution: Verify Razorpay Dashboard, rotate if needed

**CORS errors on Edge Function calls**
- FRONTEND_URL doesn't match request origin
- Solution: Check FRONTEND_URL secret and browser's Origin header

---

## Related Documentation

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase Secrets Docs](https://supabase.com/docs/guides/functions/secrets)
- [Razorpay API Keys Docs](https://razorpay.com/docs/api/keys/)
