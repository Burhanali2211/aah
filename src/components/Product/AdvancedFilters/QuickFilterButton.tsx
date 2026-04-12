import React from 'react';

interface QuickFilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}

export const QuickFilterButton: React.FC<QuickFilterButtonProps> = ({ 
    label, isActive, onClick, icon 
}) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all duration-300 ${isActive
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-200 scale-[1.02]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50'
            }`}
    >
        <span className={`${isActive ? 'text-white' : 'text-purple-600'}`}>{icon}</span>
        <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
    </button>
);
