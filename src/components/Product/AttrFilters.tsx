import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  DollarSign,
  Package,
  MapPin,
  Clock,
  Sparkles,
  Flower2,
  Droplets
} from 'lucide-react';
import { Category } from '../../types';
import { FilterSection, QuickFilterButton } from './FilterComponents';
import { 
  longevityOptions, 
  sillageOptions, 
  concentrationOptions, 
  originOptions, 
  fragranceFamilyOptions 
} from './FilterOptions';

export interface AttrFilterState {
  category: string;
  priceRange: [number, number];
  brands: string[];
  longevity: string[];
  sillage: string[];
  concentration: string[];
  origins: string[];
  fragranceFamily: string[];
  sortBy: string;
  search: string;
  rating: number;
  inStock: boolean;
}

interface AttrFiltersProps {
  filters: AttrFilterState;
  onFiltersChange: (filters: AttrFilterState) => void;
  categories: Category[];
  availableBrands: string[];
  isOpen: boolean;
  onToggle: () => void;
  productCount: number;
  className?: string;
}

export const AttrFilters: React.FC<AttrFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  isOpen,
  onToggle,
  productCount,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    longevity: true,
    sillage: true,
    concentration: true,
    origins: false,
    fragranceFamily: false
  });

  const updateFilter = <K extends keyof AttrFilterState>(key: K, value: AttrFilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      priceRange: [0, 25000],
      rating: 0,
      inStock: false,
      brands: [],
      longevity: [],
      sillage: [],
      concentration: [],
      origins: [],
      fragranceFamily: [],
      sortBy: 'featured',
      search: ''
    });
  };

  const activeFilterCount = [
    filters.category && filters.category !== '' ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 25000 ? 1 : 0,
    filters.longevity.length,
    filters.sillage.length,
    filters.concentration.length,
    filters.origins.length,
    filters.fragranceFamily.length
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className={`bg-white rounded-xl shadow-luxury border border-neutral-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg">
            <Filter className="h-4 w-4 text-neutral-700" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 text-base">Attar Filters</h3>
            <p className="text-xs text-neutral-500">Discover your perfect fragrance</p>
          </div>
          {activeFilterCount > 0 && (
            <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
              Clear all
            </button>
          )}
          <button onClick={onToggle} className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 bg-gradient-to-r from-neutral-25 to-white border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{productCount}</span> exquisite attars found
          </p>
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
      </div>

      <div className="p-6 border-b border-neutral-100 flex-shrink-0">
        <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center">
          <Droplets className="h-4 w-4 mr-2 text-neutral-600" />
          Quick Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          <QuickFilterButton
            label="Pure Oil"
            isActive={filters.concentration.includes('pure-oil')}
            onClick={() => {
              const newC = filters.concentration.includes('pure-oil')
                ? filters.concentration.filter(c => c !== 'pure-oil')
                : [...filters.concentration, 'pure-oil'];
              updateFilter('concentration', newC);
            }}
            icon="💎" premium
          />
          <QuickFilterButton
            label="Long-lasting"
            isActive={filters.longevity.includes('very-long')}
            onClick={() => {
              const newL = filters.longevity.includes('very-long')
                ? filters.longevity.filter(l => l !== 'very-long')
                : [...filters.longevity, 'very-long'];
              updateFilter('longevity', newL);
            }}
            icon="⏰"
          />
          <QuickFilterButton
            label="Strong Sillage"
            isActive={filters.sillage.includes('very-strong')}
            onClick={() => {
              const newS = filters.sillage.includes('very-strong')
                ? filters.sillage.filter(s => s !== 'very-strong')
                : [...filters.sillage, 'very-strong'];
              updateFilter('sillage', newS);
            }}
            icon="💨"
          />
          <QuickFilterButton
            label="Premium"
            isActive={filters.priceRange[0] >= 10000}
            onClick={() => updateFilter('priceRange', filters.priceRange[0] >= 10000 ? [0, 25000] : [10000, 25000])}
            icon="👑" premium
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-0">
          <FilterSection title="Attar Categories" icon={<Package className="h-5 w-5" />} isExpanded={expandedSections.category} onToggle={() => toggleSection('category')}>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="radio" name="category" checked={!filters.category || filters.category === ''} onChange={() => updateFilter('category', '')} className="form-radio text-neutral-600 h-4 w-4" />
                <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm font-medium">All Categories</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="radio" name="category" checked={filters.category === category.name} onChange={() => updateFilter('category', category.name)} className="form-radio text-neutral-600 h-4 w-4" />
                  <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm">{category.name}</span>
                  <span className="text-xs text-neutral-400 ml-auto bg-neutral-100 px-2 py-1 rounded-full">{category.productCount}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Price Range (₹)" icon={<DollarSign className="h-5 w-5" />} isExpanded={expandedSections.price} onToggle={() => toggleSection('price')}>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-neutral-600 mb-2 font-medium">Minimum</label>
                  <input type="number" value={filters.priceRange[0]} onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" placeholder="1000" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-neutral-600 mb-2 font-medium">Maximum</label>
                  <input type="number" value={filters.priceRange[1]} onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 25000])} className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm" placeholder="25000" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>₹{filters.priceRange[0].toLocaleString('en-IN')}</span>
                <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { range: [1000, 5000], label: '₹1K - ₹5K', desc: 'Premium' },
                  { range: [5000, 10000], label: '₹5K - ₹10K', desc: 'Luxury' },
                  { range: [10000, 15000], label: '₹10K - ₹15K', desc: 'Elite' },
                  { range: [15000, 25000], label: '₹15K+', desc: 'Royal' }
                ].map(({ range, label, desc }) => (
                  <button key={label} onClick={() => updateFilter('priceRange', range as [number, number])} className="px-3 py-3 text-xs border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all text-left">
                    <div className="font-medium text-neutral-700">{label}</div>
                    <div className="text-neutral-500 text-xs">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Longevity" icon={<Clock className="h-5 w-5" />} isExpanded={expandedSections.longevity} onToggle={() => toggleSection('longevity')} premium>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {longevityOptions.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={filters.longevity.includes(opt.value)} onChange={(e) => {
                    const next = e.target.checked ? [...filters.longevity, opt.value] : filters.longevity.filter(l => l !== opt.value);
                    updateFilter('longevity', next);
                  }} className="form-checkbox h-4 w-4 text-amber-600 rounded" />
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Sillage (Projection)" icon={<Sparkles className="h-5 w-5" />} isExpanded={expandedSections.sillage} onToggle={() => toggleSection('sillage')} premium>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {sillageOptions.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={filters.sillage.includes(opt.value)} onChange={(e) => {
                    const next = e.target.checked ? [...filters.sillage, opt.value] : filters.sillage.filter(s => s !== opt.value);
                    updateFilter('sillage', next);
                  }} className="form-checkbox h-4 w-4 text-amber-600 rounded" />
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Concentration" icon={<Droplets className="h-5 w-5" />} isExpanded={expandedSections.concentration} onToggle={() => toggleSection('concentration')} premium>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {concentrationOptions.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={filters.concentration.includes(opt.value)} onChange={(e) => {
                    const next = e.target.checked ? [...filters.concentration, opt.value] : filters.concentration.filter(c => c !== opt.value);
                    updateFilter('concentration', next);
                  }} className="form-checkbox h-4 w-4 text-amber-600 rounded" />
                  <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Origin" icon={<MapPin className="h-5 w-5" />} isExpanded={expandedSections.origins} onToggle={() => toggleSection('origins')}>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {originOptions.map((opt) => (
                <label key={opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input type="checkbox" checked={filters.origins.includes(opt.value)} onChange={(e) => {
                    const next = e.target.checked ? [...filters.origins, opt.value] : filters.origins.filter(o => o !== opt.value);
                    updateFilter('origins', next);
                  }} className="form-checkbox h-4 w-4 text-neutral-600 rounded" />
                  <span className="text-lg">{opt.flag}</span>
                  <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Fragrance Family" icon={<Flower2 className="h-5 w-5" />} isExpanded={expandedSections.fragranceFamily} onToggle={() => toggleSection('fragranceFamily')}>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 pb-2">
              {fragranceFamilyOptions.map((opt) => (
                <button key={opt.value} onClick={() => {
                  const next = filters.fragranceFamily.includes(opt.value) ? filters.fragranceFamily.filter(f => f !== opt.value) : [...filters.fragranceFamily, opt.value];
                  updateFilter('fragranceFamily', next);
                }} className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${filters.fragranceFamily.includes(opt.value) ? 'bg-neutral-100 text-neutral-700 border border-neutral-300' : 'bg-white text-neutral-600 border border-neutral-200'}`}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
};

