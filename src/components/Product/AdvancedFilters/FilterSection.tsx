import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSectionProps {
    title: string;
    icon: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    premium?: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
    title, icon, isExpanded, onToggle, children, premium = false 
}) => (
    <div className="border-b border-gray-100 last:border-b-0">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 rounded-lg transition-colors px-3"
        >
            <div className="flex items-center space-x-3">
                <span className={`${premium ? 'text-amber-500' : 'text-purple-600'}`}>{icon}</span>
                <span className={`font-semibold text-sm ${premium ? 'text-amber-900' : 'text-gray-900'}`}>{title}</span>
                {premium && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Premium
                    </span>
                )}
            </div>
            {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
        </button>
        {isExpanded && (
            <div className="px-3 pb-4 pt-1 animate-fadeIn">
                {children}
            </div>
        )}
    </div>
);
