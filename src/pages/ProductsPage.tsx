import React, { useState, useMemo, useEffect, useCallback, useRef, memo } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom';
import {
    Search, Grid3X3, LayoutList, Star, Heart, ShoppingCart,
    ChevronDown, ChevronUp, X, SlidersHorizontal, Home,
    Sparkles, TrendingUp, Percent, Package, ArrowUpDown,
    Eye, Check, Flame, Clock, Filter, RotateCcw,
    ChevronLeft, ChevronRight, Zap, Droplet, Wind, Sun, Info, ArrowRight
} from 'lucide-react';
import { useCategories, useProductsQuery } from '../hooks/useProductQueries';
import { useWishlist } from '../contexts/ShoppingContext';
import { useCart } from '../contexts/ShoppingContext';
import { Product, Category } from '../types';
import { ProductCard } from '../components/Product/ProductCard';
import { ProductListSkeleton } from '../components/Common/SkeletonScreens';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedFilters, UnifiedFilterState } from '@/components/Product';

// Filter interface moved to UnifiedFilters component type

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { slug } = useParams<{ slug?: string }>();
    const navigate = useNavigate();

    // UI state
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [comparingIds, setComparingIds] = useState<string[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Filter state
    const [filters, setFilters] = useState<UnifiedFilterState>({
        category: '',
        search: searchParams.get('q') || '',
        priceRange: [0, 100000],
        rating: 0,
        brands: [],
        concentration: [],
        origins: [],
        sortBy: 'newest',
        inStock: false
    });

    // Queries
    const { data: categories = [] } = useCategories();
    const { data: productsData, isLoading: loading } = useProductsQuery(page, 20, {
        categoryId: filters.category || undefined,
        search: filters.search || undefined,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        rating: filters.rating || undefined,
        sortBy: filters.sortBy as any
    });

    const products = productsData?.products || [];
    const pagination = productsData?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

    // Update filters from URL
    useEffect(() => {
        const categoryParam = searchParams.get('category') || slug || '';
        if (categories.length > 0 && categoryParam) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryParam);
            if (isUUID) {
                setFilters(prev => ({ ...prev, category: categoryParam }));
            } else {
                const category = categories.find((c: Category) => c.slug === categoryParam);
                if (category) setFilters(prev => ({ ...prev, category: category.id }));
            }
        }
    }, [categories, searchParams, slug]);

    // Slider state
    const [priceSliderValue, setPriceSliderValue] = useState(100000);
    const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleFilterChange = (newFilters: UnifiedFilterState) => {
        setFilters(newFilters);
        setPage(1); // Reset page on filter change
    };

    const toggleCompare = (id: string) => {
        setComparingIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(0, 4)
        );
    };

    // The products are already filtered and sorted by the server
    const sortedProducts = products;

    return (
        <div className="min-h-screen bg-[#f7f8f8]">
            <div className="max-w-[1600px] mx-auto px-4 pt-3 pb-0 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">

                {/* Sidebar Filters */}
                <aside className={`w-full lg:w-72 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                    <div className="lg:sticky lg:top-28 w-full mt-4 lg:mt-0">
                        <UnifiedFilters
                            filters={filters}
                            onFiltersChange={handleFilterChange}
                            categories={categories}
                            isOpen={isFilterOpen}
                            onToggle={() => setIsFilterOpen(!isFilterOpen)}
                            productCount={pagination.total}
                        />
                    </div>
                </aside>

                {/* Main Product Area */}
                <main className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        {/* Filter icon */}
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${isFilterOpen ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Filter</span>
                            {(filters.category || filters.rating > 0 || filters.discount > 0 || filters.availability !== 'all') && (
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            )}
                        </button>

                        {/* Result count */}
                        <span className="text-xs text-gray-400 flex-1">{sortedProducts.length} products</span>

                        {/* Sort */}
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="h-8 bg-white border border-gray-200 rounded-lg text-xs font-medium px-2.5 focus:outline-none cursor-pointer text-gray-700"
                        >
                            <option value="newest">Newest</option>
                            <option value="price-low-high">Price ↑</option>
                            <option value="price-high-low">Price ↓</option>
                            <option value="rating">Top Rated</option>
                        </select>

                        {/* Grid / List toggle */}
                        <div className="flex border border-gray-200 rounded-lg overflow-hidden h-8">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-2.5 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Grid3X3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-2.5 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                            >
                                <LayoutList className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <ProductListSkeleton count={12} columns={3} />
                    ) : sortedProducts.length === 0 ? (
                        <div className="py-32 text-center bg-white rounded-2xl border border-gray-200">
                            <Wind className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-black text-[#131921] mb-2">No results for this selection</h3>
                            <p className="text-sm text-gray-500">Try adjusting your filters or search term.</p>
                            <button 
                               onClick={() => setFilters({ category: '', search: '', priceRange: [0, 100000], rating: 0, brands: [], concentration: [], origins: [], sortBy: 'newest', inStock: false })}
                               className="mt-6 px-6 py-2 bg-[#131921] text-white rounded-lg text-sm font-bold hover:bg-black transition-colors"
                            >
                               Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4" : "space-y-3 sm:space-y-4"}>
                            {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isListView={viewMode === 'list'}
                                    onCompareToggle={toggleCompare}
                                    isComparing={comparingIds.includes(product.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-2">
                            <button 
                                onClick={() => { setPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={pagination.page === 1}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex gap-2">
                                {Array.from({ length: pagination.pages }).map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className={`w-10 h-10 rounded-lg text-sm font-black transition-all ${pagination.page === i + 1 ? 'bg-[#131921] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => { setPage(prev => Math.min(pagination.pages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                disabled={pagination.page === pagination.pages}
                                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Floating Comparison Bar */}
            <AnimatePresence>
                {comparingIds.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-2xl"
                    >
                        <div className="bg-[#131921] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 overflow-x-auto pb-1 no-scrollbar">
                                {comparingIds.map(id => {
                                    const p = products.find(prod => prod.id === id);
                                    return (
                                        <div key={id} className="relative flex-shrink-0 group">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 border border-white/20">
                                                <img src={p?.images[0]} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <button 
                                                onClick={() => toggleCompare(id)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                {Array.from({ length: Math.max(0, 4 - comparingIds.length) }).map((_, i) => (
                                    <div key={i} className="w-12 h-12 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center text-white/20">
                                        <Info className="h-4 w-4" />
                                    </div>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-black">{comparingIds.length} Products Selected</p>
                                    <p className="text-[10px] text-gray-400">Up to 4 items</p>
                                </div>
                                <button 
                                    onClick={() => navigate(`/compare?ids=${comparingIds.join(',')}`)}
                                    disabled={comparingIds.length < 2}
                                    className="bg-amber-400 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-400 text-[#131921] px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
                                >
                                    Compare Now <ArrowRight className="h-4 w-4" />
                                </button>
                                <button 
                                   onClick={() => setComparingIds([])}
                                   className="p-2 text-gray-400 hover:text-white"
                                >
                                   <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Removed Redundant FilterSection component

export default ProductsPage;
