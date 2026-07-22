import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3X3, LayoutList, SlidersHorizontal, ChevronRight, ArrowLeft } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug?: string;
}

interface MobileProductHeaderProps {
    productCount: number;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onFilterClick: () => void;
    isFilterActive: boolean;
    onSearchChange: (value: string) => void;
    searchValue: string;
    categories: Category[];
    selectedCategory?: string;
    onCategoryChange: (categoryId: string) => void;
}

export const MobileProductHeader: React.FC<MobileProductHeaderProps> = ({
    productCount,
    viewMode,
    onViewModeChange,
    onFilterClick,
    isFilterActive,
    onSearchChange,
    searchValue,
    categories,
    selectedCategory = '',
    onCategoryChange
}) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
            {/* Header with back button and greeting */}
            <div className="px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    title="Go back"
                >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Welcome back</span>
                        <></>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900">Discover Products</h1>
                </div>
            </div>

            {/* Search bar with integrated filter button */}
            <div className="px-4 pb-3 flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search clothes..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={onFilterClick}
                    className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg border transition-all ${
                        isFilterActive
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                    title="Toggle filters"
                >
                    <SlidersHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Horizontally scrollable category pills */}
            <div className="px-4 pb-3 flex items-center gap-2">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide"
                >
                    {/* All Items */}
                    <button
                        onClick={() => onCategoryChange('')}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                            selectedCategory === ''
                                ? 'bg-gray-900 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        All Items
                    </button>

                    {/* Category pills */}
                    {categories.slice(0, 5).map(category => (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                selectedCategory === category.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* View mode toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white shrink-0">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 flex items-center justify-center transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                        title="Grid view"
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 flex items-center justify-center transition-colors border-l border-gray-200 ${
                            viewMode === 'list'
                                ? 'bg-gray-900 text-white border-l-gray-900'
                                : 'bg-white text-gray-400 hover:bg-gray-50'
                        }`}
                        title="List view"
                    >
                        <LayoutList className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
