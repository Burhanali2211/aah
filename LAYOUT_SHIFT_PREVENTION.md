# Layout Shift Prevention Guide

## Problem
Data loading causes layout shifts:
1. Page loads empty
2. Data arrives
3. Layout reflows (jumps around)
4. Bad UX, looks broken

## Solution
**Reserved space + skeleton loaders = no shift**

---

## Rule 1: Reserve Container Height

NEVER let containers collapse while loading.

### Product Cards

**BAD**:
```tsx
return (
  <div>
    {loading ? <Skeleton /> : <ProductCard />}
  </div>
);
```
← Card height varies while loading

**GOOD**:
```tsx
return (
  <div className="min-h-80">  {/* Reserve height! */}
    {loading ? <Skeleton /> : <ProductCard />}
  </div>
);
```

### List Items

```tsx
<div className="min-h-16 border-b">  {/* Reserved height */}
  {loading ? <SkeletonItem /> : <ListItem />}
</div>
```

### Image Containers

```tsx
<div className="aspect-square bg-gray-100">  {/* Fixed aspect ratio */}
  {loading ? <Skeleton /> : <Image />}
</div>
```

---

## Rule 2: Match Skeleton to Real Content

Skeleton = exact placeholder for real content.

### Product Card Example

**Component**:
```tsx
<div className="min-h-80 p-4 space-y-3">
  <img className="w-full h-48 rounded" />
  <h3 className="text-lg font-bold h-6" />
  <p className="text-sm text-gray-600 h-4" />
  <div className="flex gap-2 h-10">
    <button className="flex-1" />
    <button className="flex-1" />
  </div>
</div>
```

**Skeleton**:
```tsx
<div className="min-h-80 p-4 space-y-3">
  <div className="w-full h-48 rounded bg-gray-200 animate-pulse" />
  <div className="h-6 bg-gray-200 rounded animate-pulse" />
  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
  <div className="flex gap-2 h-10">
    <div className="flex-1 bg-gray-200 rounded animate-pulse" />
    <div className="flex-1 bg-gray-200 rounded animate-pulse" />
  </div>
</div>
```

← Exact same layout

---

## Rule 3: Skeleton Grid = Real Grid

Grid columns must match.

**BAD**:
```tsx
{loading ? (
  <div className="grid grid-cols-4 gap-4">  {/* 4 cols while loading? */}
    {skeletons}
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">  {/* Different! */}
    {products}
  </div>
)}
```

**GOOD**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {loading
    ? Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
    : products.map(p => <ProductCard key={p.id} {...p} />)
  }
</div>
```

← Same grid always

---

## Rule 4: Animate Skeleton, NOT Container

Animate the placeholder, not its wrapper.

**BAD**:
```tsx
<div className="animate-pulse">  {/* Whole box pulses */}
  <img className="w-full h-48" />
  <h3>title</h3>
</div>
```

**GOOD**:
```tsx
<div>
  <img className="w-full h-48 bg-gray-200 animate-pulse" />  {/* Only img */}
  <h3 className="h-6 bg-gray-200 rounded animate-pulse" />  {/* Only text */}
</div>
```

← Each element pulses individually = more natural

---

## Checklist

Apply to every data-loading component:

- [ ] Container has min-height (no collapse)
- [ ] Grid columns fixed during loading
- [ ] Skeleton matches real content layout
- [ ] Each element has animate-pulse (not parent)
- [ ] Aspect ratios fixed (images)
- [ ] Tested on slow network (DevTools throttling)

---

## Testing

Open DevTools → Network tab → Set throttle to "Slow 4G"

Reload page. Watch:
- Does layout shift? (BAD)
- Does skeleton match content? (check)
- Do elements animate smoothly? (check)

---

## Current Status

✅ ProductsPage - good skeletons + min-height
✅ CategoryChips - skeleton matches layout
⚠️ HomePage - missing some skeletons (featured, latest sections)
⚠️ ProductDetailPage - image skeleton needed
⚠️ OrderTrackingPage - table skeleton incomplete

---

## Quick Fix Template

```tsx
function MyComponent() {
  const { data, loading } = useData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {loading ? (
        // Skeleton (same grid structure)
        Array(6).fill(0).map((_, i) => (
          <div key={i} className="min-h-80 p-4 space-y-3">
            <div className="aspect-square bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>
        ))
      ) : (
        // Real content (same grid structure)
        data.map(item => <Item key={item.id} {...item} />)
      )}
    </div>
  );
}
```

---

**Apply this pattern everywhere data loads.**

No more layout shifts = polished UX.
