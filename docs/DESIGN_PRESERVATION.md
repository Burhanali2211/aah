# 🎨 DESIGN PRESERVATION GUIDE

## Current Design Standards (DO NOT CHANGE)

### Homepage Layout & Components

**Hero Section:**
- Carousel with multiple background images
- Navigation arrows (hidden on mobile/tablet)
- Full viewport height
- Smooth transitions

**Featured Products Section:**
- Grid layout (2 col mobile, 2 col tablet, 4 col desktop)
- Compact product cards
- Quick add to cart
- Wishlist button overlay

**Best Sellers Section:**
- Horizontal card layout
- Left: Product image (40-42% width)
- Right: Product info + actions
- Green accent bar at top
- Discount badge with percentage
- Badges: "#1 Best Seller", category
- Rating stars with review count
- Trust/savings messaging
- Premium feel with gradient background

**Latest Arrivals Section:**
- Horizontal scrolling carousel
- Compact product cards
- "New" badge

**Category Section:**
- Chip/tag style categories
- Grid layout on desktop
- Horizontal scroll on mobile
- Click to filter products

**Deal Tiles:**
- Bento grid layout
- 2x3 grid on desktop
- Responsive on mobile
- Image with overlay text
- Gradient overlays

### Product Card Variants (PRESERVE THESE)

**Grid Variant** (Used on: Homepage featured, Products page)
```
┌─────────────┐
│   Image     │ ← Square aspect ratio
│   (hover)   │   Hover: Scale up
└─────────────┘
│ Product     │
│ Name        │
│ ⭐⭐⭐⭐⭐ (5) │
│ ₹499        │
│ Add to Cart │
└─────────────┘
```

**Best Seller Variant** (Used on: Best Sellers section)
```
┌──────────┐ ┌─────────────────────┐
│          │ │ #1 Best Seller      │
│          │ │ Product Name        │
│  Image   │ │ ⭐⭐⭐⭐⭐ (123)      │
│          │ │                     │
│          │ │ Save ₹299           │
└──────────┘ │ ₹999 → ₹700        │
             │ Add to Cart Button  │
             └─────────────────────┘
```

**Compact Variant** (Used on: Carousels, Latest Arrivals)
```
┌─────────┐
│ Image   │ ← Portrait aspect ratio
└─────────┘
│ Name    │
│ ⭐ (4.5)│
│ ₹299    │
└─────────┘
```

**List Variant** (Used on: Admin, Search results)
```
┌──────┐ ┌──────────────────────┐
│      │ │ Product Name         │
│ Img  │ │ Category • ⭐ (4.5) │
│      │ │ ₹499 ₹699 (Save 30%)│
└──────┘ └──────────────────────┘
```

### Color Palette (PRESERVE)
```
Primary: Amber/Gold (#F59E0B, #FBBF24)
Secondary: Green (#10B981, #059669)
Accent: Red (Discounts #EF4444)
Neutral: Stone/Gray (#6B7280, #9CA3AF)
Background: White (#FFFFFF), Stone-50 (#F5F3F0)
```

### Typography (PRESERVE)
```
Headings: Bold, serif/system font
Body: Regular, readable
Sizes: Responsive (sm/md/lg)
Line heights: Loose for readability
```

### Spacing & Gaps (PRESERVE)
```
Card gaps: 2-4 (8px-16px)
Section padding: 4-8 (16px-32px) responsive
Grid gaps: 2-6 (8px-24px) responsive
```

### Responsive Breakpoints (PRESERVE)
```
Mobile: < 640px (sm)
Tablet: 640px - 1024px (md)
Desktop: > 1024px (lg)

Mobile: 2 columns
Tablet: 2-3 columns
Desktop: 3-4 columns
```

### Icons Used (PRESERVE)
```
Heart: Wishlist
ShoppingCart: Add to cart
Star: Rating
TrendingUp: Best sellers
Flame: Hot/Trending
Tag: Savings/Discount
ArrowRight: View more
ShoppingBag: No image fallback
```

### Buttons (PRESERVE STYLE)
```
Primary: Amber/Gold background, white text
Secondary: Gray background
Ghost: Transparent with border
Sizes: sm, md, lg
States: Default, Hover, Active, Disabled
```

### Modal/Overlay (PRESERVE)
```
Auth Modal: Centered, white background
Backdrop: Semi-transparent black
Animation: Fade in/out
```

---

## Implementation Rules

### ✅ ALLOWED CHANGES
- Delete duplicate components
- Merge similar components
- Consolidate CSS/styling
- Improve performance
- Add new utilities
- Refactor internals
- Optimize bundle
- Change file structure
- Consolidate logic

### ❌ DO NOT CHANGE
- Visual appearance
- Layout structure
- Color palette
- Typography sizes
- Spacing/gaps
- Hover effects
- Icon usage
- Component behavior
- User interactions

### 🎯 GOAL
**Same beautiful design, cleaner code underneath.**

---

## Design Reference Files

**Keep these unchanged (reference only):**
```
src/components/Home/Hero.tsx ..................... Preserve carousel
src/components/Home/BestSellers.tsx ............. Preserve card design
src/components/Home/FeaturedProducts.tsx ........ Preserve grid
src/components/Home/LatestArrivals.tsx .......... Preserve carousel
src/pages/ProductsPage.tsx ....................... Preserve layout
```

**These will be refactored (design stays same):**
```
src/components/Product/HomepageProductCard.tsx ... → ProductCard variant
src/components/Product/BestSellerProductCard.tsx . → ProductCard variant
src/components/Product/ProductListCard.tsx ....... → ProductCard variant
```

---

## Visual Design Specifications

### Shadows (PRESERVE)
```
sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)
md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
```

### Border Radius (PRESERVE)
```
Small cards: rounded-lg (0.5rem)
Large cards: rounded-2xl (1rem)
Buttons: rounded-lg (0.5rem)
Full round: rounded-full
```

### Transitions (PRESERVE)
```
Duration: 300-500ms
Image hover: scale-105 over 300ms
Text hover: color change over 200ms
Button: background color over 200ms
```

### Animations (PRESERVE)
```
Loading: Spinner rotation
Fade in/out: 300ms
Slide: 300-500ms
Bounce: For interactive elements
```

---

## Checklist for Refactoring

After each phase, verify:
- [ ] Homepage looks identical
- [ ] Product cards display same
- [ ] Colors unchanged
- [ ] Spacing same
- [ ] Hover effects work
- [ ] Mobile responsive same
- [ ] Tablet view same
- [ ] Desktop view same
- [ ] All icons display
- [ ] Badges position correct
- [ ] Prices formatted same
- [ ] Buttons look same

---

## If Design Accidentally Changes

1. **Check git diff:**
   ```bash
   git diff src/components/Home/
   git diff src/components/Product/
   ```

2. **Revert CSS/Tailwind changes:**
   ```bash
   git checkout -- src/components/Home/*.tsx
   git checkout -- src/styles/
   ```

3. **Keep code refactoring, reapply styling:**
   - Refactor logic only
   - Preserve className strings
   - Preserve inline styles

---

**Status: LOCKED FOR PRESERVATION**
**Updated: 2026-04-02**
**Review Before Each Phase: YES**
