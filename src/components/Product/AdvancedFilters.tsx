import React, { useState } from 'react';
import { Filter, X, Crown, Sparkles, DollarSign, Package } from 'lucide-react';
import { AdvancedFilterState, AdvancedFiltersProps } from './AdvancedFilters/types';
import { FilterSection } from './AdvancedFilters/FilterSection';
import { QuickFilterButton } from './AdvancedFilters/QuickFilterButton';
import { 
    longevityOptions, 
    sillageOptions, 
    concentrationOptions, 
    originOptions, 
    fragranceFamilyOptions 
} from './AdvancedFilters/constants';

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
    filters,
    onFiltersChange,
    categories,
    isOpen,
    onToggle,
    productCount
}) => {
    const [expandedSections, setExpandedSections] = useState({
        category: true,
        price: true,
        quality: true,
        advanced: false
    });

    const updateFilter = (key: keyof AdvancedFilterState, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const clearAllFilters = () => {
        onFiltersChange({
            category: '',
            priceRange: [0, 50000],
            rating: 0,
            inStock: false,
            featured: false,
            newArrivals: false,
            onSale: false,
            brands: [],
            longevity: [],
            sillage: [],
            concentration: [],
            origins: [],
            fragranceFamily: []
        });
    };

    const activeFilterCount = [
        filters.category && filters.category !== '' ? 1 : 0,
        filters.priceRange[0] > 0 || filters.priceRange[1] < 50000 ? 1 : 0,
        filters.rating > 0 ? 1 : 0,
        filters.inStock ? 1 : 0,
        filters.featured ? 1 : 0,
        filters.newArrivals ? 1 : 0,
        filters.onSale ? 1 : 0,
        filters.longevity.length,
        filters.sillage.length,
        filters.concentration.length,
        filters.origins.length,
        filters.fragranceFamily.length
    ].reduce((sum, count) => sum + count, 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 via-white to-blue-50">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg shadow-purple-200">
                            <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl tracking-tight">Advanced Filters</h3>
                            <p className="text-sm text-gray-500 font-medium">
                                {productCount} matches found
                            </p>
                        </div>
                        {activeFilterCount > 0 && (
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-purple-200">
                                {activeFilterCount} Active
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="text-xs font-bold text-gray-400 hover:text-purple-600 transition-colors uppercase tracking-widest px-4 py-2"
                            >
                                Reset All
                            </button>
                        )}
                        <button
                            onClick={onToggle}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                        >
                            <X className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:rotate-90 transition-all duration-300" />
                        </button>
                    </div>
                </div>

                {/* Quick Filters */}
                <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-wrap gap-2">
                        <QuickFilterButton
                            label="Premium"
                            isActive={filters.featured}
                            onClick={() => updateFilter('featured', !filters.featured)}
                            icon={<Crown className="w-4 h-4" />}
                        />
                        <QuickFilterButton
                            label="New Arrival"
                            isActive={filters.newArrivals}
                            onClick={() => updateFilter('newArrivals', !filters.newArrivals)}
                            icon={<Sparkles className="w-4 h-4" />}
                        />
                        <QuickFilterButton
                            label="Flash Sale"
                            isActive={filters.onSale}
                            onClick={() => updateFilter('onSale', !filters.onSale)}
                            icon="🔥"
                        />
                        <QuickFilterButton
                            label="In Stock"
                            isActive={filters.inStock}
                            onClick={() => updateFilter('inStock', !filters.inStock)}
                            icon={<Package className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* Main Filter Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <div className="space-y-2">
                            <FilterSection
                                title="Categories"
                                icon={<Package className="h-5 w-5" />}
                                isExpanded={expandedSections.category}
                                onToggle={() => toggleSection('category')}
                            >
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    <label className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={!filters.category || filters.category === ''}
                                            onChange={() => updateFilter('category', '')}
                                            className="form-radio text-purple-600 focus:ring-purple-500 h-4 w-4 border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">All Collections</span>
                                    </label>
                                    {categories.map((category) => (
                                        <label key={category.id} className="flex items-center space-x-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={filters.category === category.name}
                                                onChange={() => updateFilter('category', category.name)}
                                                className="form-radio text-purple-600 focus:ring-purple-500 h-4 w-4 border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">{category.name}</span>
                                            <span className="text-[10px] text-gray-400 ml-auto font-bold">{category.productCount || 0}</span>
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection
                                title="Price Range"
                                icon={<DollarSign className="h-5 w-5" />}
                                isExpanded={expandedSections.price}
                                onToggle={() => toggleSection('price')}
                            >
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={filters.priceRange[0]}
                                                onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                                placeholder="Min"
                                            />
                                        </div>
                                        <span className="text-gray-400 font-bold">−</span>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={filters.priceRange[1]}
                                                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 50000])}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { range: [1000, 5000], label: '₹1K - ₹5K' },
                                            { range: [5000, 15000], label: '₹5K - ₹15K' },
                                            { range: [15000, 30000], label: '₹15K - ₹30K' },
                                            { range: [30000, 50000], label: 'Over ₹30K' }
                                        ].map(({ range, label }) => (
                                            <button
                                                key={label}
                                                onClick={() => updateFilter('priceRange', range)}
                                                className="py-2 text-[10px] font-bold text-gray-500 border border-gray-100 rounded-lg hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 transition-all uppercase tracking-wider"
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </FilterSection>
                        </div>

                        <div className="space-y-2">
                            <FilterSection
                                title="Aromatic Quality"
                                icon={<Sparkles className="h-5 w-5" />}
                                isExpanded={expandedSections.quality}
                                onToggle={() => toggleSection('quality')}
                                premium
                            >
                                <div className="space-y-5 pt-2">
                                    <div>
                                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Longevity</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {longevityOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => updateFilter('longevity', filters.longevity.includes(opt.value) 
                                                        ? filters.longevity.filter(l => l !== opt.value) 
                                                        : [...filters.longevity, opt.value])}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.longevity.includes(opt.value)
                                                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    {opt.icon} {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Concentration</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {concentrationOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => updateFilter('concentration', filters.concentration.includes(opt.value)
                                                        ? filters.concentration.filter(c => c !== opt.value)
                                                        : [...filters.concentration, opt.value])}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${filters.concentration.includes(opt.value)
                                                        ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    {opt.label} {opt.premium && <Crown className="w-3 h-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </FilterSection>

                            <FilterSection
                                title="Discovery"
                                icon={<Package className="h-5 w-5" />}
                                isExpanded={expandedSections.advanced}
                                onToggle={() => toggleSection('advanced')}
                            >
                                <div className="space-y-5 pt-2">
                                    <div>
                                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Origins</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {originOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => updateFilter('origins', filters.origins.includes(opt.value)
                                                        ? filters.origins.filter(o => o !== opt.value)
                                                        : [...filters.origins, opt.value])}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.origins.includes(opt.value)
                                                        ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
                                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                                >
                                                    {opt.flag} {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </FilterSection>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-500">
                        {productCount} products found
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onToggle}
                            className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onToggle}
                            className="px-10 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilters;