import React, { Suspense, lazy, memo, useMemo } from 'react';
import { Hero } from '@/components/Home/Hero';
import { CategoryChips } from '@/components/Home/CategoryChips';
import { FlashSale } from '@/components/Home/FlashSale';
import { BestSellers } from '@/components/Home/BestSellers';
import { useProducts } from '@/contexts/ProductContext';
import { ProfessionalLoader } from '@/components/Common/ProfessionalLoader';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

const FeaturedProducts = lazy(() => import('@/components/Home/FeaturedProducts'));
const LatestArrivals = lazy(() => import('@/components/Home/LatestArrivals'));

const SectionLoader = memo(() => (
  <div className="py-6 bg-white w-full">
    <div className="w-full px-4 sm:px-6 lg:px-8"><ProfessionalLoader fullPage={false} /></div>
  </div>
));
SectionLoader.displayName = 'SectionLoader';

/* ─── Deal Tiles: Bento layout ─── */
const BENTO_TILES = [
  {
    to: '/products?category=woven-bags',
    img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=75',
    overlay: 'bg-gradient-to-r from-black/70 via-black/30 to-transparent',
    tag: 'Trending Now',
    title: 'Artisan Woven Bags',
    sub: 'Sustainable jute & cotton craft',
    wide: true,
  },
  {
    to: '/products?category=handmade-baskets',
    img: 'https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=600&q=75',
    overlay: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
    tag: 'Home Decor',
    title: 'Storage Baskets',
    sub: 'Natural willow & straw',
    wide: false,
  },
  {
    to: '/products?category=woolen-items',
    img: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=75',
    overlay: 'bg-gradient-to-t from-black/70 via-black/20 to-transparent',
    tag: 'New Season',
    title: 'Hand Woolens',
    sub: 'Soft textures & purses',
    wide: false,
  },
  {
    to: '/deals',
    img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=75',
    overlay: 'bg-gradient-to-r from-black/70 via-black/30 to-transparent',
    tag: 'Bundle Offer',
    title: 'Artisan Sets',
    sub: 'Handpicked craft collections',
    wide: true,
  },
];

const DealTiles: React.FC = memo(() => (
  <section className="bg-white w-full pt-0 pb-3">
    <div className="w-full px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {BENTO_TILES.map((tile) => (
          <Link
            key={tile.title}
            to={tile.to}
            className={`group relative overflow-hidden rounded-xl h-[140px] sm:h-[180px] md:h-[210px] ${tile.wide ? 'col-span-2 md:col-span-2' : 'col-span-1'}`}
          >
            <img
              src={tile.img}
              alt={tile.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 ${tile.overlay}`} />
            <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-white/60 uppercase mb-0.5">
                {tile.tag}
              </span>
              <p className="text-white font-bold text-sm sm:text-lg leading-tight">{tile.title}</p>
              <p className="text-white/70 text-[10px] sm:text-xs mt-0.5 leading-snug">{tile.sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
));
DealTiles.displayName = 'DealTiles';

/* ─── Price-Filter Strips ─── */
const PRICE_FILTERS = [
  { label: 'Under ₹499', link: '/products?maxPrice=499', bg: 'bg-stone-50 border-stone-200 text-stone-800' },
  { label: 'Under ₹999', link: '/products?maxPrice=999', bg: 'bg-orange-50 border-orange-200 text-orange-800' },
  { label: 'Under ₹1999', link: '/products?maxPrice=1999', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
  { label: 'Under ₹2999', link: '/products?maxPrice=2999', bg: 'bg-green-50 border-green-200 text-green-800' },
  { label: 'Luxury Craft', link: '/products?minPrice=3000', bg: 'bg-stone-100 border-stone-300 text-stone-900' },
];

const ShopByPrice: React.FC = memo(() => (
  <section className="py-5 sm:py-6 bg-white w-full">
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-base sm:text-lg font-bold text-gray-900">Price Palette</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
        {PRICE_FILTERS.map(({ label, link, bg }) => (
          <Link
            key={label}
            to={link}
            className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:scale-[1.02] ${bg}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  </section>
));
ShopByPrice.displayName = 'ShopByPrice';

/* ─── Mini Promo Banner - Full Width ─── */
const PromoBanner: React.FC = memo(() => (
  <div className="w-full px-4 sm:px-6 lg:px-8 my-2">
    <Link
      to="/deals"
      className="flex items-center justify-between bg-stone-900 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 group"
    >
      <div>
        <p className="text-white font-black text-sm sm:text-base">🌿 Eco-Conscious Promise</p>
        <p className="text-amber-100 text-xs sm:text-sm">Plastic-free packaging on all artisanal orders</p>
      </div>
      <div className="flex items-center gap-1 bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-amber-50 transition-colors">
        Explore <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  </div>
));
PromoBanner.displayName = 'PromoBanner';

/* ─── Trust Signals ─── */
const TRUST_ITEMS = [
  { icon: Truck, title: 'Artisan Direct', desc: 'Sourced from the makers' },
  { icon: RotateCcw, title: 'Fair Trade', desc: 'Supporting livelihoods' },
  { icon: ShieldCheck, title: '100% Organic', desc: 'Natural fibers only' },
  { icon: Headphones, title: 'Expert Care', desc: 'Craft concierge support' },
];

const TrustBar: React.FC = memo(() => (
  <section className="bg-white pt-4 pb-0 w-full">
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-2.5">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-50 flex items-center justify-center">
              <Icon className="h-4 w-4 text-stone-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{title}</p>
              <p className="text-[10px] text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));
TrustBar.displayName = 'TrustBar';

/* ─── Main Page ─── */
export default function HomePage() {
  const { categories, loading: categoriesLoading } = useProducts();

  return (
    <div className="min-h-screen bg-stone-50/50">

      {/* 1. Banner Carousel */}
      <Hero />

      {/* 2. Category Chips */}
      <CategoryChips categories={categories} loading={categoriesLoading && categories.length === 0} />

      {/* 3. Deal Tiles — Bento layout */}
      <DealTiles />

      {/* 4. Flash Sale */}
      <div className="mt-1.5">
        <FlashSale />
      </div>

      {/* 5. Featured Products — 2×2 mobile / 4-col desktop */}
      <div className="mt-1.5">
        <Suspense fallback={<SectionLoader />}>
          <FeaturedProducts />
        </Suspense>
      </div>

      {/* 6. Mini promo banner strip */}
      <PromoBanner />

      {/* 7. Best Sellers — horizontal scroll */}
      <BestSellers />

      {/* 8. New Arrivals — horizontal scroll */}
      <div className="mt-1.5">
        <Suspense fallback={<SectionLoader />}>
          <LatestArrivals />
        </Suspense>
      </div>

      {/* 9. CTA Banner - Full Width */}
      <section className="mt-4 bg-stone-900 py-12 sm:py-16 overflow-hidden relative w-full">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=75')] bg-cover bg-center" />
        <div className="relative w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold mb-2">Sustainable Elegance</h2>
            <p className="text-stone-300 text-sm sm:text-base max-w-lg">Join 10,000+ conscious homes who chose artisan-crafted organic goods over mass production.</p>
          </div>
          <Link
            to="/products"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-accent-500 text-white hover:bg-accent-600 font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-sm"
          >
            Start Exploring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 10. Trust Signals */}
      <TrustBar />

    </div>
  );
}

