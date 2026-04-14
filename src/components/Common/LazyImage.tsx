import React, { useState, useRef, useEffect } from 'react';
import { imageOptimizationService } from '../../utils/imageOptimizationService';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  sizes?: string;
  srcSet?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  responsive = false,
  quality = 80,
  priority = false,
  onLoad,
  onError
}) => {
  if (!src) return null;

  const getUrl = (format?: string) => 
    imageOptimizationService.generateOptimizedImageUrl(src, { width, height, quality, format: format as any });

  const getSrcSet = (format?: string) => 
    responsive ? imageOptimizationService.generateSrcSet(src, [320, 640, 1024, 1600], { quality, format: format as any }) : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}>
      <picture>
        <source type="image/avif" srcSet={getSrcSet('avif')} src={getUrl('avif')} />
        <source type="image/webp" srcSet={getSrcSet('webp')} src={getUrl('webp')} />
        <img
          src={getUrl()}
          srcSet={getSrcSet()}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={`${className} transition-opacity duration-300`}
          onLoad={() => onLoad?.()}
          onError={() => onError?.()}
        />
      </picture>
    </div>
  );
};
