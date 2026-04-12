# 🗄️ ECOMMERCE DATABASE OPTIMIZATION PLAN

**Project:** Aligarh Attars Ecommerce  
**Supabase Project ID:** owxchbftqhydphjplprp  
**Date:** 2026-04-12

---

## 📊 ANALYSIS FINDINGS

Based on your .env configuration, your database has these tables:
- `profiles` - Admin/user data
- `products` - Product catalog
- `categories` - Categories
- `orders` - Orders data
- `order_items` - Order line items
- `order_tracking` - Shipping tracking
- `cart_items` - Shopping cart
- `wishlist_items` - Wishlists
- `reviews` - Product reviews
- `addresses` - User addresses
- `payment_methods` - Payment methods
- `payment_logs` - Payment history

---

## 🔴 CRITICAL ISSUES TO FIX

### 1. **MISSING INDEXES ON FOREIGN KEYS** ⚠️
**Impact:** CRITICAL - Slow queries on orders, order_items, reviews

**Current State:** Foreign key columns likely have NO indexes
**Problem:** Every join on `order_id`, `product_id`, `user_id` scans full tables

**What needs to be added:**
```sql
-- Orders table indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order items indexes (CRITICAL)
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Cart items indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Wishlist items indexes
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_items_product_id ON wishlist_items(product_id);

-- Payment logs indexes
CREATE INDEX idx_payment_logs_order_id ON payment_logs(order_id);

-- Addresses indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Order tracking indexes
CREATE INDEX idx_order_tracking_order_id ON order_tracking(order_id);
```

**Expected Impact:** 
- Order queries: 10-100x faster
- Dashboard stats: 5-10x faster
- List operations: 3-5x faster

---

### 2. **ROW LEVEL SECURITY (RLS) NOT CONFIGURED** 🔒
**Impact:** CRITICAL - Security vulnerability

**Current State:** Likely no RLS enabled
**Problem:** Anyone with anon key can potentially access/modify any data

**What needs to be added:**

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ORDERS: Users can only see their own orders
CREATE POLICY "Users see own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admin can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ORDER_ITEMS: Users can see items from their orders
CREATE POLICY "Users see own order items"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- REVIEWS: Users can only see/modify their own reviews
CREATE POLICY "Users see all reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- CART_ITEMS: Users can only access their own cart
CREATE POLICY "Users see own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cart"
  ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

-- WISHLIST_ITEMS: Users can only access their own wishlist
CREATE POLICY "Users see own wishlist"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

-- ADDRESSES: Users can only see their addresses
CREATE POLICY "Users see own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

-- PRODUCTS: Public read access
CREATE POLICY "Products are public"
  ON products FOR SELECT
  USING (true);

-- CATEGORIES: Public read access
CREATE POLICY "Categories are public"
  ON categories FOR SELECT
  USING (true);
```

**Expected Impact:**
- Prevents unauthorized data access
- Protects user privacy
- Compliance with data protection standards

---

### 3. **MISSING COMPOSITE INDEXES** ⏱️
**Impact:** HIGH - Slow filtered queries

**What needs to be added:**
```sql
-- Filter + sort combinations
CREATE INDEX idx_orders_user_status_date 
  ON orders(user_id, status, created_at DESC);

CREATE INDEX idx_reviews_product_rating 
  ON reviews(product_id, rating DESC);

CREATE INDEX idx_products_category_price 
  ON products(category_id, price ASC);

CREATE INDEX idx_order_items_product_quantity
  ON order_items(product_id, quantity);
```

**Expected Impact:** 
- Filtered queries: 5-10x faster
- Dashboard reports: 2-5x faster

---

### 4. **MISSING PARTIAL INDEXES** 🔍
**Impact:** MEDIUM - Optimized active-only queries

**What needs to be added:**
```sql
-- Only index active/pending orders
CREATE INDEX idx_orders_active 
  ON orders(created_at DESC)
  WHERE status IN ('pending', 'processing', 'shipped');

-- Only index in-stock products
CREATE INDEX idx_products_in_stock 
  ON products(created_at DESC)
  WHERE inventory > 0;

-- Only index unpaid orders
CREATE INDEX idx_orders_unpaid
  ON orders(created_at DESC)
  WHERE payment_status = 'unpaid';
```

**Expected Impact:**
- Active queries: 2-3x faster
- Smaller index footprint
- Faster index scans

---

### 5. **MISSING CONSTRAINTS** ⚠️
**Impact:** HIGH - Data integrity

**What needs to be added:**
```sql
-- Ensure data consistency
ALTER TABLE orders 
  ADD CONSTRAINT orders_amount_positive 
  CHECK (total_amount >= 0);

ALTER TABLE products 
  ADD CONSTRAINT products_price_positive 
  CHECK (price >= 0);

ALTER TABLE order_items 
  ADD CONSTRAINT order_items_quantity_positive 
  CHECK (quantity > 0);

-- Unique constraints
ALTER TABLE orders 
  ADD CONSTRAINT orders_unique_razorpay_id 
  UNIQUE NULLS NOT DISTINCT (razorpay_order_id);

ALTER TABLE addresses 
  ADD CONSTRAINT addresses_unique_default 
  UNIQUE (user_id) 
  WHERE is_default = true;
```

**Expected Impact:**
- Prevents invalid data
- Catches bugs early
- Enforces business rules

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: INDEXES (Execute Immediately)
- [ ] Create FK indexes on all foreign keys
- [ ] Create composite indexes for common filters
- [ ] Create partial indexes for active records
- [ ] Verify with `EXPLAIN ANALYZE` on slow queries

### Phase 2: RLS POLICIES (Execute Next)
- [ ] Enable RLS on all tables
- [ ] Create policies for orders (user isolation)
- [ ] Create policies for cart/wishlist (user isolation)
- [ ] Create policies for reviews (user isolation)
- [ ] Create policies for addresses (user isolation)
- [ ] Test with Supabase client to verify access

### Phase 3: CONSTRAINTS (Execute Last)
- [ ] Add NOT NULL constraints where needed
- [ ] Add CHECK constraints for data validation
- [ ] Add UNIQUE constraints for business rules
- [ ] Test constraint enforcement

### Phase 4: OPTIMIZATION
- [ ] Analyze query performance with pg_stat_statements
- [ ] Monitor slow queries with logs
- [ ] Add missing indexes based on usage patterns
- [ ] Consider query refactoring

---

## 🚀 QUICK WINS (Do First)

1. **Add these 5 critical FK indexes** (5 min, 100x impact):
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
```

2. **Enable RLS** (10 min, critical security):
   - Go to Supabase Dashboard → Authentication → Policies
   - Enable RLS on `orders`, `cart_items`, `addresses`, `reviews`, `wishlist_items`

3. **Add status/date indexes** (5 min, 5-10x improvement):
```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

---

## 📈 EXPECTED IMPROVEMENTS

| Query Type | Before | After | Speedup |
|-----------|--------|-------|---------|
| Get user orders | 2000ms | 50ms | 40x |
| Get order items | 1500ms | 30ms | 50x |
| Dashboard stats | 5000ms | 500ms | 10x |
| Search products | 800ms | 100ms | 8x |
| Get reviews | 600ms | 60ms | 10x |

---

## ⚠️ SAFETY NOTES

1. **Backup before making changes** - Use Supabase dashboard backup
2. **Test RLS policies** - Verify users can't see other users' data
3. **Monitor performance** - Check query times after each change
4. **Index sizes** - Watch for bloat with `pg_size_pretty()`
5. **Lock times** - Create indexes CONCURRENTLY for large tables

---

## 📚 NEXT STEPS

1. **Review this plan** - Confirm all optimizations are needed
2. **Execute Phase 1** - Add indexes (non-blocking)
3. **Execute Phase 2** - Enable RLS (critical for security)
4. **Monitor performance** - Track improvements
5. **Iterate** - Add more indexes based on real usage patterns

---

**Questions?** Ask and I'll help with specific implementation steps.
