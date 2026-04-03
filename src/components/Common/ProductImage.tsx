import React, { useState, useRef, useEffect } from 'react';
import { normalizeImageUrl, isValidImageUrl } from '../../utils/images';

interface ProductImageProps {
    product: { name: string; images?: string[]; id: string; };
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large';
    priority?: 'high' | 'low' | 'auto';
    onError?: () => void;
    onLoad?: () => void;
}

export const ProductImage: React.FC<ProductImageProps> = ({
    product, className = '', alt, size = 'medium', priority = 'auto', onError, onLoad
}) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const getImageUrl = () => {
        if (product.images && product.images.length > 0) {
            const normalized = product.images.map(img => normalizeImageUrl(img)).filter(img => img && isValidImageUrl(img));
            if (normalized.length > 0) return normalized[0];
        }
        return null;
    };

    const generateFallbackImage = (name: string) => {
        const firstLetter = name.charAt(0).toUpperCase();
        const colors = [{ bg: '#E3F2FD', text: '#1976D2' }, { bg: '#F3E5F5', text: '#7B1FA2' }, { bg: '#E8F5E8', text: '#388E3C' }, { bg: '#FFF3E0', text: '#F57C00' }, { bg: '#FCE4EC', text: '#C2185B' }, { bg: '#E0F2F1', text: '#00796B' }, { bg: '#FFF8E1', text: '#F9A825' }, { bg: '#EFEBE9', text: '#5D4037' }];
        const color = colors[Math.abs(firstLetter.charCodeAt(0)) % colors.length] || colors[0];
        const config = { small: { w: 100, h: 100, f: 32 }, medium: { w: 200, h: 200, f: 64 }, large: { w: 400, h: 400, f: 128 } }[size];
        const svg = `<svg width="${config.w}" height="${config.h}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color.bg}"/><text x="50%" y="50%" font-family="sans-serif" font-size="${config.f}" font-weight="600" fill="${color.text}" text-anchor="middle" dominant-baseline="central">${firstLetter}</text></svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const imageUrl = getImageUrl();
    const finalImageUrl = (!imageUrl || imageError) ? generateFallbackImage(product.name) : imageUrl;

    return (
        <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
            {isLoading && !imageError && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
            <img
                src={finalImageUrl} alt={alt || product.name} className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={() => { setImageError(true); setIsLoading(false); onError?.(); }}
                onLoad={() => { setIsLoading(false); onLoad?.(); }}
                loading={priority === 'high' ? 'eager' : 'lazy'} decoding="async"
                fetchPriority={priority === 'high' ? 'high' : 'auto'}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default ProductImage;