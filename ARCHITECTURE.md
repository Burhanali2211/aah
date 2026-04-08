# Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (CDN + SPA)                     │
│  - index.html fallback for all routes                    │
│  - Static asset caching (1 year)                         │
│  - API proxy headers for CORS                            │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       v               v               v
   React App       API Routes      Assets
   (Vite)          (Serverless)    (Images)
   │               │               │
   └──────────┬────┴────┬──────────┘
              │         │
              v         v
        Supabase    Razorpay
         (Auth &      (Payments)
         Database)
```

## Frontend (React)

### Directory Layout
```
src/
├── pages/                    # Route pages (lazy-loaded)
│   ├── HomePage             # Landing + hero section
│   ├── ProductsPage         # Product grid + filters
│   ├── ProductDetailPage    # Single product view
│   ├── DashboardPage        # Admin panel
│   ├── CheckoutPage         # Cart → Order flow
│   ├── AuthPage             # Login/Register
│   └── [Other pages]        # Contact, About, Legal, etc
│
├── components/              # Reusable UI components
│   ├── Layout/              # Header, Footer, Navigation
│   ├── Products/            # Product cards, filters, grid
│   ├── Cart/                # Cart drawer, item list
│   ├── Payment/             # Razorpay integration
│   ├── Admin/               # Dashboard, Orders, Analytics
│   ├── Common/              # ProtectedRoute, ErrorBoundary, etc
│   └── [Feature areas]      # Address, Wishlist, Compare, etc
│
├── contexts/                # State management (React Context)
│   ├── AuthContext          # User auth state + Supabase session
│   ├── CartContext          # Shopping cart
│   ├── WishlistContext      # Saved items
│   └── CombinedProvider     # Wraps all contexts
│
├── hooks/                   # Custom React hooks
│   ├── useAuth              # Auth state + login/logout
│   ├── useCart              # Cart add/remove/update
│   ├── usePageTracking      # Analytics tracking
│   ├── useNavigation        # URL query params
│   └── [Feature hooks]      # Domain-specific
│
├── services/                # External integrations
│   ├── supabaseClient       # Supabase SDK setup
│   ├── analytics            # Google Analytics 4 init
│   ├── errorTracking        # Sentry error reporting
│   └── health               # App health checks
│
├── styles/                  # CSS
│   ├── globals.css          # Tailwind base + utilities
│   ├── pwa-responsive.css   # PWA + mobile optimizations
│   └── admin.css            # Admin dashboard theme
│
├── api/                     # API client
│   └── health.ts            # Health check endpoint
│
├── utils/                   # Helper functions
│   ├── serviceWorker        # PWA service worker
│   ├── adminDashboardStyles # Admin theme cache
│   └── [Other utilities]    # Format, validate, transform
│
└── assets/                  # Images
    ├── images/products/     # Product photos
    ├── images/categories/   # Category banners
    ├── images/hero/         # Homepage hero backgrounds
    └── images/banners/      # Promotional banners
```

### Key Technologies
- **React 19**: UI library
- **Vite 8**: Build tool + dev server
- **TypeScript**: Type safety
- **React Router 7.13**: Routing + lazy loading
- **Tailwind 4.2**: Styling + responsive design
- **Supabase**: Auth + Database
- **Framer Motion**: Animations
- **Sentry 10.10**: Error tracking
- **Google Analytics 4**: User analytics

## Backend (Minimal / Serverless)

### API Structure
```
api/
└── payment-process.js       # Vercel serverless function
    ├── POST /api/payment-process?action=create-order
    │   └── Creates Razorpay order → returns ID
    └── POST /api/payment-process?action=verify-payment
        └── Validates payment signature → updates DB
```

### Supabase Integration
- **Auth**: Email/password via Supabase Auth
- **Database**: PostgreSQL tables (via Supabase)
  - `auth.users` — User accounts (managed by Supabase)
  - `public.products` — Product catalog
  - `public.orders` — Order records
  - `public.cart_items` — Transient cart data
  - `public.wishlist_items` — Saved products
  - (See supabase/schema/ for full schema)

### Database Client
Uses **Supabase JS SDK** directly (not ORM):
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'attars');
```

## Deployment (Vercel)

### Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": false,
  "trailingSlash": false,
  "headers": [
    // SPA fallback: all 404s → index.html
    // Assets (1 year cache): /assets/*
    // API proxy: CORS headers for /api/*
  ]
}
```

### Build & Deploy
1. Push to `main` branch
2. Vercel triggers `npm run build`
3. Vite bundles React app → `dist/`
4. Vercel uploads to CDN
5. On request: `/assets/*` cached (1 year), everything else checks `index.html`

### Environment Variables (Vercel Dashboard)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...  (used by payment-process.js)
VITE_GA_MEASUREMENT_ID=...
VITE_SITE_URL=...
```

**Never** commit `.env` — use Vercel's env var dashboard only.

## Authentication Flow

```
User → Login Form
       ↓
    Supabase Auth
       ↓
    JWT Token in localStorage
       ↓
    AuthContext validates on app init
       ↓
    ProtectedRoute checks user role
       ↓
    Admin routes require role='admin'
    Other routes require any user
```

## Payment Flow (Razorpay)

```
User → Checkout Page
       ↓
       Create Razorpay Order (api/payment-process)
       ↓
       Razorpay Payment Modal
       ↓
       User enters card/UPI details
       ↓
       Razorpay → Webhook → Verify Payment (api/payment-process)
       ↓
       Update DB: create order record
       ↓
       Redirect to Order Confirmation Page
```

## Code Splitting (Vite)

Auto-chunks large libraries to reduce initial JS:
- `vendor-react.js` — React, ReactDOM, React Router, Scheduler
- `vendor-motion.js` — Framer Motion (heavy, only used in hero/animations)
- `vendor-icons.js` — Lucide React (large icon library)
- `vendor-supabase.js` — Supabase client (async loaded)
- `vendor-charts.js` — Recharts (admin dashboard only)
- `[route-name].js` — Route-specific bundles (lazy loaded)

## State Management

**No Redux/Zustand** — uses React Context + hooks:
- **AuthContext**: User login state + Supabase session (global)
- **CartContext**: Shopping cart items (in localStorage + state)
- **WishlistContext**: Saved products (in localStorage + state)
- Component-level state for UI (modals, filters, loading)

Trade-off: Simpler mental model, but Context re-renders can be noticeable at scale. Add useMemo/useCallback if needed.

## Error Handling

1. **Global**: Sentry captures unhandled errors
2. **Route-level**: ErrorBoundary wraps app
3. **Component-level**: Try/catch in async operations
4. **User-facing**: Toast notifications for failed actions
5. **Silent suppression**: Browser extension errors (known non-critical)

## Performance Optimizations

✓ Code splitting by route (lazy loading)
✓ Asset caching (1 year for /assets/*)
✓ Image compression (scripts/optimize-images.js available)
✓ Service Workers (PWA setup, can be disabled)
✓ CSS-in-JS (Tailwind) with dev sourcemaps

⚠️ **Not yet**:
- Image lazy loading
- Database query optimization
- API response caching
- Compression (gzip via Vercel)

---

**For detailed code, see PROJECT_STATUS.md**
