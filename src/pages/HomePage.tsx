import React, { Suspense, lazy, memo, useMemo, useState, useEffect } from 'react';
import { Hero } from '@/components/Home/Hero';
import { CategoryChips } from '@/components/Home/CategoryChips';
import { FlashSale } from '@/components/Home/FlashSale';
import { BestSellers } from '@/components/Home/BestSellers';
import { useProducts } from '@/contexts/ProductContext';
import { ProfessionalLoader } from '@/components/Common/ProfessionalLoader';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, ArrowUpRight,  } from 'lucide-react';
import { HomepageProductCard } from '@/components/Product/HomepageProductCard';

import { BentoGrid } from '@/components/Home/BentoGrid';

import { FounderStorySection } from '@/components/Home/FounderStorySection';
import { StoreVisitorsTestimonials } from '@/components/Home/StoreVisitorsTestimonials';

const FeaturedProducts = lazy(() => import('@/components/Home/FeaturedProducts'));
const LatestArrivals = lazy(() => import('@/components/Home/LatestArrivals'));

const SectionLoader = memo(() => (
  <div className="py-6 bg-white">
    <div className="max-w-7xl mx-auto px-4"><ProfessionalLoader fullPage={false} /></div>
  </div>
));
SectionLoader.displayName = 'SectionLoader';

/* ─── Price-Filter Strips ─── */
const PRICE_FILTERS = [
  { label: 'Under ₹499', link: '/products?maxPrice=499', bg: 'bg-stone-50 border-stone-200 text-stone-800' },
  { label: 'Under ₹999', link: '/products?maxPrice=999', bg: 'bg-orange-50 border-orange-200 text-orange-800' },
  { label: 'Under ₹1999', link: '/products?maxPrice=1999', bg: 'bg-amber-50 border-amber-200 text-amber-800' },
  { label: 'Under ₹2999', link: '/products?maxPrice=2999', bg: 'bg-green-50 border-green-200 text-green-800' },
  { label: 'Luxury Attars', link: '/products?minPrice=3000', bg: 'bg-stone-100 border-stone-300 text-stone-900' },
];

const ShopByPrice: React.FC = memo(() => (
  <section className="py-5 sm:py-6 bg-white border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-base sm:text-lg font-bold text-gray-900">Price Palette</span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto overflow-y-hidden scrollbar-hide pb-1">
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

/* ─── Mini Promo Banner ─── */
const PromoBanner: React.FC = memo(() => (
  <div className="sm:mx-6 lg:mx-8 my-10 max-w-7xl xl:mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden bg-black sm:rounded-[2.5rem] px-6 py-14 sm:p-16 group"
    >
      <div className="absolute inset-0 opacity-40 bg-[url('/images/perfumes/kashmiri-oudh.jpeg')] bg-cover bg-center transition-transform duration-[4s] group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-amber-300 font-black text-[9px] uppercase tracking-[0.4em]">
            <div className="h-3.5 w-3.5" />
            Our Guarantee
          </div>
          <h3 className="text-3xl sm:text-5xl font-serif italic text-white leading-tight">
            Leak-Proof <span className="font-sans not-italic font-black text-white/10 uppercase tracking-tighter">Packaging</span>
          </h3>
          <p className="text-white/70 text-xs sm:text-base max-w-md font-medium tracking-wide">
            We promise 100% padded, leak-proof delivery on every pure attar and perfume order. Protecting the fragrance and purity.
          </p>
        </div>
        <Link
          to="/products"
          className="flex-shrink-0 group inline-flex items-center gap-3 sm:gap-4 bg-white text-black font-bold text-[9px] sm:text-[10px] uppercase tracking-widest sm:tracking-[0.25em] px-6 py-3.5 sm:px-10 sm:py-5 rounded-full transition-all hover:bg-[#F0F0F0] active:scale-95 shadow-xl shadow-black/20"
        >
          Explore Collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  </div>
));
PromoBanner.displayName = 'PromoBanner';

/* ─── Main Page ─── */
export default function HomePage() {
  const { categories, loading: categoriesLoading } = useProducts();

  return (
    <div className="min-h-screen bg-stone-50/50">

      {/* 1. Banner Carousel */}
      <Hero />

      {/* 2. Category Chips */}
      <CategoryChips categories={categories} loading={categoriesLoading && categories.length === 0} />

      {/* 3. Deal Tiles / Bento Grid */}
      <section className="bg-white py-10 sm:py-20 border-t border-black/[0.03]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BentoGrid categories={categories} loading={categoriesLoading} />
        </div>
      </section>

      {/* 4. Flash Sale (Limited Time Deals) */}
      <div className="mt-1.5">
        <FlashSale />
      </div>

      {/* 4.5. Founder & Master Perfumer Authenticity Section */}
      <FounderStorySection />

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

      {/* 8.5. Store Visitors & Patrons Testimonials */}
      <StoreVisitorsTestimonials />

      {/* 9. CTA Banner */}
      <section className="mt-8 bg-black py-24 sm:py-32 overflow-hidden relative">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('/images/perfumes/choco-musk.jpg')] bg-cover bg-center" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-white/40 font-bold text-[10px] uppercase tracking-[0.4em]">The Aligarh Attar Philosophy</span>
              <h2 className="text-white text-4xl sm:text-6xl md:text-7xl font-serif italic leading-none">
                Pure Aromas & <span className="font-sans not-italic font-black text-white/10 uppercase tracking-tighter block sm:inline">Elegance</span>
              </h2>
            </div>
            
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              Join 10,000+ patrons who chose pure alcohol-free attars, authentic Islamic literature & elegant modest wear.
            </p>

            <Link
              to="/products"
              className="inline-flex items-center gap-3 sm:gap-4 bg-white text-black hover:bg-[#F0F0F0] font-bold text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] px-8 py-4 sm:px-12 sm:py-6 rounded-full transition-all shadow-2xl active:scale-95 group"
            >
              Start Exploring 
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
