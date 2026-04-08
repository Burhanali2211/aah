# Aligarh Attars — Project Status (2026-04-08)

## Overview
E-commerce frontend for Islamic perfumes/attars + accessories. Deployed on Vercel.

## Tech Stack
- **Frontend**: React 19 + Vite 8 + TypeScript + Tailwind
- **Backend**: Supabase (PostgreSQL)
- **Payments**: Razorpay
- **Deployment**: Vercel (SPA with fallback routing)
- **Auth**: Supabase Auth
- **Analytics**: Google Analytics 4 + Sentry

## Current Status: FUNCTIONAL ✓

### Completed
- [x] Core e-commerce UI (products, cart, checkout)
- [x] Authentication (email/password)
- [x] Admin dashboard (incomplete but functional)
- [x] Product categories + filtering
- [x] Order management + tracking
- [x] Wishlist + comparison features
- [x] Responsive design + PWA setup
- [x] Vercel SPA routing configured
- [x] Performance optimization (code splitting, lazy loading)

### Known Issues / Debt

#### SECURITY ISSUES (HIGH PRIORITY)
1. **Exposed secrets in .env** 
   - File contains: Razorpay keys, Supabase URL/keys, DB password
   - Mitigation: NOT committed to git (good), but live on disk (risky)
   - Action: Rotate all keys immediately. Use Vercel env vars only.

2. **localStorage overuse** (86 instances)
   - User state, auth tokens, preferences stored without validation
   - Risk: XSS could exfiltrate data
   - Action: Review storage usage, validate on retrieval, use HttpOnly cookies where possible

3. **Dynamic error suppression** (main.tsx)
   - Catches and silences all ServiceWorker errors
   - Could mask real issues
   - Action: More granular error handling

#### Code Quality
- **254 TypeScript files** but no strict type coverage metrics
- **No test suite** (0 tests)
- **Heavy documentation debt**: Was 111 markdown docs (now cleaned to stub)
- **Duplicated code** in db/ directory (incomplete/empty db implementations)

#### Deployment & Performance
- ✓ Vercel config properly set up (index.html rewrites, cache headers)
- ✓ Code splitting working (vendor chunks separate)
- ⚠️ dist/ built assets not cleaned (may have stale builds)

#### Missing/Unfinished
- [ ] Database migration system (scripts present, not integrated)
- [ ] Email service (configured in old code, not wired)
- [ ] Image optimization (scripts exist, not automated)
- [ ] Admin dashboard incomplete (basic CRUD only, no analytics)
- [ ] API documentation (old docs purged)

## File Structure

```
.
├── src/                          # React frontend (254 .ts/.tsx files)
│   ├── components/               # UI components (Layout, Products, Admin, etc)
│   ├── pages/                    # Route pages (lazy-loaded)
│   ├── contexts/                 # Auth, Cart, Wishlist state
│   ├── hooks/                    # Custom hooks (navigation, tracking, etc)
│   ├── services/                 # Analytics, error tracking, health checks
│   ├── styles/                   # Tailwind + responsive CSS
│   ├── api/                      # API client (health.ts only)
│   └── assets/                   # Product images, hero banners
├── db/                           # Stub database code (index.ts, schema.ts only)
├── scripts/                      # Utility scripts (seed data, export, optimize images)
├── supabase/                     # Supabase config (migrations, functions stubs)
├── public/                       # Static assets (.htaccess, images)
├── dist/                         # Built output (Vite)
├── node_modules/                 # Dependencies
├── api/                          # Legacy payment-process.js
├── logs/                         # Runtime logs
├── memory/                       # Claude Code memory files
├── package.json                  # 47 dependencies (React, Supabase, Tailwind, etc)
├── vite.config.ts                # Build config + code splitting rules
├── tsconfig.json                 # TypeScript config (strict: true)
├── vercel.json                   # Vercel deployment config
├── .env                          # ⚠️ SECRETS (not in git, but unsafe)
├── .gitignore                    # Properly configured
└── .claude/                      # Claude Code settings

```

## Recent Activity (Last 5 Commits)

1. `d87b355` - fix(vercel): resolve 404 errors on direct navigation
2. `0c13034` - chore: update source domain to aah-teal.vercel.app
3. `2fbd78d` - fix: comprehensive vercel config for SPA stability
4. `ef78b26` - fix: remove custom auth lock
5. `5d3a366` - fix: disable supabase auth lock

**Pattern**: Recent work focused on Vercel routing/SPA stability fixes.

## Next Actions (Priority Order)

### 1. SECURITY (Do First)
- [ ] Rotate all Razorpay keys (exposed in .env)
- [ ] Rotate Supabase credentials
- [ ] Use Vercel Environment Variables dashboard only
- [ ] Delete .env from disk once rotated
- [ ] Add secret scanning to CI (git-secrets, Snyk)

### 2. CLEANUP & CLARITY
- [x] Remove 105+ archived doc files (DONE)
- [ ] Remove empty db/, api/ directories (code not integrated)
- [ ] Remove dist/ cache before next build
- [ ] Clean logs/ directory

### 3. STABILIZATION
- [ ] Add test suite (unit + integration)
- [ ] Fix admin dashboard (incomplete CRUD)
- [ ] Audit all localStorage usage
- [ ] Tighten error handling (don't suppress ServiceWorker errors)

### 4. FEATURES
- [ ] Complete email service intecgration
- [ ] Image optimization automation
- [ ] Analytics dashboard (currently no metrics collected)
- [ ] Order export/reporting

## Dependencies (Summary)
- **React**: 19.1.0 + React Router 7.13.0
- **Styling**: Tailwind 4.2.0 + Framer Motion 12.38.0
- **Data**: Supabase 2.90.1 + Axios 1.9.0
- **Auth**: Supabase built-in + bcryptjs 3.0.3
- **Monitoring**: Sentry 10.10.0 + GA4
- **UI**: Lucide React 0.577.0 + Recharts 3.1.0 (admin only)

## Deployment
- **Live**: https://aah-teal.vercel.app
- **Config**: vercel.json (SPA routing, cache headers, CORS)
- **Build**: `npm run build` → `dist/` → auto-deployed on push to main

---

**Last Updated**: 2026-04-08  
**Status**: Functional but needs security hardening + test coverage
