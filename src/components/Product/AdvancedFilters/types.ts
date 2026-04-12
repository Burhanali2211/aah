export interface AdvancedFilterState {
    category: string;
    priceRange: [number, number];
    rating: number;
    inStock: boolean;
    featured: boolean;
    newArrivals: boolean;
    onSale: boolean;
    brands: string[];
    longevity: string[];
    sillage: string[];
    concentration: string[];
    origins: string[];
    fragranceFamily: string[];
}

export interface AdvancedFiltersProps {
    filters: AdvancedFilterState;
    onFiltersChange: (filters: AdvancedFilterState) => void;
    categories: any[];
    isOpen: boolean;
    onToggle: () => void;
    productCount: number;
}
