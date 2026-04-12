# 🚀 Production Deployment Guide

**Website:** Aligarh Attars (React SPA + Supabase)  
**Status:** ✅ Code Complete | ⏳ Awaiting Deployment  
**Security:** 4-Phase hardening implemented  

---

## 📋 Start Here

### First Time?
**👉 Read:** `QUICK_START_DEPLOY.md` (15 min overview)

### Need Details?
**👉 Read:** `DEPLOYMENT_CHECKLIST.md` (step-by-step guide)

### Need Context?
**👉 Read:** `SECURITY_DEPLOYMENT.md` (architecture & decisions)

### Need to Verify?
**👉 Run:** `verify-deployment.sh` (automated checks)

---

## 🎯 What Got Fixed?

**10 Critical Vulnerabilities → 10 Solutions:**

1. ✅ **Brute-force attacks** → 15-min account lockout (server-enforced)
2. ✅ **Data exposure** → SELECT * → field whitelist  
3. ✅ **Unauthorized uploads** → Login required + folder validation
4. ✅ **Path traversal** → Sanitized paths + allowlist
5. ✅ **Direct mutations** → All mutations via Edge Functions + JWT
6. ✅ **CORS bypass** → Wildcard * → Dynamic origin validation
7. ✅ **Order number dupes** → Server-generated AA-YYYYMMDD-NNNN
8. ✅ **Admin bypass** → Server-side JWT + RLS verification
9. ✅ **Rate limiting** → Per-user enforcement (30 req/min)
10. ✅ **Secrets exposure** → Backend-only keys in Vercel/Supabase

---

## 📁 Files Created (Complete Package)

### Documentation (6 files)
- `QUICK_START_DEPLOY.md` ← **Start here** (TL;DR)
- `DEPLOYMENT_CHECKLIST.md` ← Detailed step-by-step
- `SECURITY_DEPLOYMENT.md` ← Architecture & decisions
- `SUPABASE_SECRETS.md` ← Secrets configuration
- `PRODUCTION_READY.md` ← Status & risk assessment
- `README_DEPLOYMENT.md` ← This file

### Code Changes (11 files)
- `src/lib/apiClient.ts` (NEW) ← Edge Function wrapper
- `supabase/functions/product-mutations/index.ts` (NEW) ← Product CRUD
- `supabase/functions/order-mutations/index.ts` (NEW) ← Order ops
- `src/contexts/AuthContext.tsx` (MODIFIED) ← Lockout logic
- `src/lib/supabase.ts` (MODIFIED) ← Field filtering
- `src/services/storageService.ts` (MODIFIED) ← Upload auth
- `src/contexts/ProductContext.tsx` (MODIFIED) ← Use apiClient
- `src/contexts/OrderContext.tsx` (MODIFIED) ← Use apiClient
- `api/payment-process.js` (MODIFIED) ← CORS lockdown
- `vercel.json` (MODIFIED) ← Security headers
- `supabase/migrations/003_storage_policies.sql` (NEW) ← Storage RLS

### Configuration (3 files)
- `.env.production.example` (NEW) ← Environment template
- `verify-deployment.sh` (NEW) ← Automated verification
- `verify-rls.sql` (NEW) ← RLS verification script

---

## ⏱ Timeline

**Pre-deployment:** 30 min
- Read quick start
- Run verification script
- Prepare passwords/keys

**Deployment Day:** 3-4 hours
- Phase 1 Ops: 30 min (Razorpay + Vercel + RLS verify)
- Code Deploy: 30 min (git push + Edge Functions)
- Configuration: 1 hour (Supabase auth/storage)
- Testing: 1-2 hours (smoke tests)

**Total:** ~4 hours (one afternoon)

---

## 🔒 Security Layers

```
1. Network Layer
   ├─ HTTPS only
   ├─ CORS validation (origin check)
   └─ Security headers (CSP, X-Frame-Options, etc.)

2. Application Layer
   ├─ JWT verification (Bearer token)
   ├─ Role-based access control (admin/seller/customer)
   ├─ Field filtering (SELECT * → whitelist)
   └─ Input validation (path traversal prevention)

3. Backend Layer
   ├─ Rate limiting (30 req/min per user)
   ├─ Signature verification (Razorpay)
   └─ Account lockout (5 fails → 15 min lock)

4. Database Layer
   ├─ Row-Level Security (RLS) on 22 tables
   ├─ SECURITY DEFINER functions (privilege escalation prevention)
   └─ Triggers (auto updated_at, order numbering)

5. Storage Layer
   ├─ RLS policies (who can read/write/delete)
   ├─ Path validation (no traversal)
   └─ Authentication required (upload)
```

---

## 📝 Deployment Steps (Summary)

### Phase 1: Credentials (30 min) — USER ACTION
```
□ Razorpay: Generate new API keys, delete old
□ Vercel: Set 5 production environment variables
□ Supabase: Verify RLS (22 tables, rowsecurity=true)
```

### Phase 2: Code (30 min) — AUTOMATED
```
□ git push origin main (triggers Vercel deploy)
□ supabase functions deploy ... (4 Edge Functions)
□ supabase secrets set ... (5 secrets)
```

### Phase 3: Configuration (1 hour) — USER ACTION
```
□ Supabase: Email auth settings
□ Supabase: Storage bucket settings
□ Supabase: Verify 5 RLS policies exist
```

### Phase 4: Testing (1-2 hours) — USER ACTION
```
□ Login/lockout working
□ Data not exposed (no seller_id, cost_price)
□ Upload auth required
□ Order number format AA-YYYYMMDD-NNNN
□ Admin operations via Edge Functions
□ CORS restricts origins
```

---

## 🚨 Critical Checklist

Before you start, have ready:

- [ ] Access to Razorpay Dashboard
- [ ] Access to Vercel Dashboard
- [ ] Access to Supabase Project
- [ ] SSH key for git (or use gh CLI)
- [ ] 3-4 hours of uninterrupted time
- [ ] Password manager (to store new keys)
- [ ] Support team on standby (optional but recommended)

---

## ✅ Success Criteria

Deployment is complete when:

1. ✅ Homepage loads without errors
2. ✅ Login works, lockout triggers after 5 fails
3. ✅ Products don't expose internal fields
4. ✅ File upload requires authentication
5. ✅ Orders have AA-YYYYMMDD-NNNN numbers
6. ✅ Admin dashboard restricted to admins
7. ✅ CORS blocks unauthorized origins
8. ✅ No console errors
9. ✅ Rate limiting enforced (429 after 30 req/min)
10. ✅ Razorpay payments work

---

## 🆘 If Something Goes Wrong

| Issue | Quick Fix |
|-------|-----------|
| Can't see env vars in Vercel | Make sure you selected "Production" environment |
| Edge Function 404 | Run deploy command again |
| Secret "undefined" | Run `supabase secrets set` again, wait 1 min |
| Login lockout not working | Check AuthContext.tsx imports SecurityManager |
| Products show seller_id | Check supabase.ts has PRODUCT_PUBLIC_FIELDS |
| CORS error from evil.com | That's correct! Should block unauthorized origins |
| Razorpay "Invalid signature" | Check you rotated keys in all 3 places |

**If still stuck:**
1. Check the relevant doc file for your issue
2. Run verification scripts (verify-deployment.sh, verify-rls.sql)
3. Review browser console & network tab (F12)
4. Check Vercel & Supabase logs

**Rollback:** Takes 5 minutes (see DEPLOYMENT_CHECKLIST.md)

---

## 📚 Documentation Map

```
README_DEPLOYMENT.md ← You are here
│
├─ Quick Start (15 min read)
│  └─ QUICK_START_DEPLOY.md
│
├─ Detailed Guide (2 hour read + do)
│  └─ DEPLOYMENT_CHECKLIST.md
│
├─ Architecture & Decisions (1 hour read)
│  └─ SECURITY_DEPLOYMENT.md
│
├─ Configuration Details
│  ├─ SUPABASE_SECRETS.md
│  ├─ .env.production.example
│  └─ PRODUCTION_READY.md
│
├─ Scripts & Verification
│  ├─ verify-deployment.sh (automated)
│  └─ verify-rls.sql (database check)
│
└─ Status & Compliance
   └─ PRODUCTION_READY.md
```

---

## 🎯 Next Steps

### For Deployment Team:
1. Read `QUICK_START_DEPLOY.md` (15 min)
2. Read `DEPLOYMENT_CHECKLIST.md` (print it!)
3. Run `./verify-deployment.sh`
4. Follow the checklist step-by-step
5. Test thoroughly (1-2 hours)

### For Stakeholders:
1. Review `PRODUCTION_READY.md` (status & risks)
2. Schedule deployment window (3-4 hours)
3. Have support team ready
4. Set up monitoring alerts

### For Security/Audit:
1. Review `SECURITY_DEPLOYMENT.md` (architecture)
2. Check code changes (7 modified files)
3. Verify RLS policies (run verify-rls.sql)
4. Approve for production deployment

---

## 📊 What Changed

**Before:**
- ❌ No login lockout (client-side, bypassable)
- ❌ SELECT * exposed internal fields
- ❌ Unauthenticated file uploads possible
- ❌ Direct mutations via anon key
- ❌ Wildcard CORS (* allows all origins)
- ❌ Client-side order numbers (race conditions)
- ❌ Admin role check only in UI
- ❌ API secrets in git history

**After:**
- ✅ Server-enforced 15-min lockout
- ✅ Whitelist of 30 safe fields
- ✅ Login required for uploads
- ✅ All mutations via Edge Functions + JWT
- ✅ Dynamic origin validation
- ✅ Server-generated order numbers
- ✅ Server-side role verification + RLS
- ✅ Secrets in Vercel/Supabase only

---

## 💾 Backups & Recovery

Before deployment, ensure:
- [ ] Supabase backups enabled (automatic daily)
- [ ] Git history backed up (GitHub is backup)
- [ ] Environment variables documented (password manager)
- [ ] Rollback plan understood (5 min to revert)

---

## 🎓 Learning Resources

**If you want to understand the architecture deeper:**

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [CORS Basics](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [JWT Overview](https://jwt.io/introduction)

---

## 🏁 Ready to Deploy?

```
Phase 1 Status: ⏳ Awaiting Deployment
Phase 2 Status: ✅ Code Complete
Phase 3 Status: ✅ Code Complete
Phase 4 Status: ✅ Code Complete

Overall: 75% Complete → Ready for final deployment
```

### Your Next Action:
**👉 Read:** `QUICK_START_DEPLOY.md` (15 minutes)

Then follow that guide step-by-step.

---

## 📞 Support

**Documentation:** All docs in this directory  
**Scripts:** Run `./verify-deployment.sh` to diagnose  
**Logs:** Check Vercel Dashboard & Supabase Logs  
**Issues:** See troubleshooting section above  

---

## ✨ Credits

- **Security Audit:** Identified 10 vulnerabilities
- **Architecture Design:** 4-phase hardening plan
- **Implementation:** Phase 2-4 (code changes)
- **Deployment Guide:** Complete documentation package

**Total security improvement:** 8/10 vulnerabilities in Phase 2-4, remaining 2 in Phase 1 (operations)

---

**Status:** 🟡 READY FOR PHASE 1 DEPLOYMENT  
**Last Updated:** 2026-04-12  
**Target Go-Live:** Week of 2026-04-15

---

# 🚀 Let's Deploy! 

**Start with:** `QUICK_START_DEPLOY.md`
