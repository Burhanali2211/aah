import React, { useEffect, memo } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../../contexts/ProductContext';
import { ProductGridSkeleton } from '../Common/ProductCardSkeleton';
import { HomepageProductCard } from '../Product/HomepageProductCard';
import { Link } from 'react-router-dom';

/**
 * FeaturedProducts Component
 * Modernized with luxury editorial header and staggered entrance
 */
export const FeaturedProducts: React.FC = memo(() => {
    const { featuredProducts, featuredLoading, fetchFeaturedProducts } = useProducts();

    useEffect(() => {
        fetchFeaturedProducts(8, true);
    }, [fetchFeaturedProducts]);

    return (
        <section className="py-16 sm:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-[0.3em]"
                        >
                            <></>
                            Curated Selection
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl sm:text-5xl font-serif italic text-black"
                        >
                            Featured Essentials
                        </motion.h2>
                        <p className="text-stone-400 text-sm font-medium">Handpicked pure attars, perfumes, and authentic Islamic literature.</p>
                    </div>
                    
                    <Link to="/products?featured=true" className="group flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors">
                        Discover More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Products Display — 2 full rows (8 products) */}
                {featuredLoading ? (
                    <ProductGridSkeleton count={8} variant="featured" />
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-start">
                        {featuredProducts.map((product, index) => (
                            <HomepageProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-[#F9F9F9] rounded-[3rem] border border-black/[0.03]">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white shadow-xl rounded-full mb-8">
                            <Star className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-black text-2xl font-black mb-3">Refining Our Picks</h3>
                        <p className="text-black/40 font-medium max-w-xs mx-auto">Our editors are currently hand-selecting new featured pieces for you.</p>
                    </div>
                )}
            </div>
        </section>
    );
});

FeaturedProducts.displayName = 'FeaturedProducts';

export default FeaturedProducts;
