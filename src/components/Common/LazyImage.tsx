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
  src, alt, className = '', placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjIwIiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD4KPC9zdmc+',
  width, height, responsive = false, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', srcSet, quality = 80, priority = false, onLoad, onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [bestFormat, setBestFormat] = useState<string>(src);
  const intersectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return setIsInView(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setIsInView(true); observer.disconnect(); }
    }, { threshold: 0.1, rootMargin: '50px' });
    if (intersectionRef.current) observer.observe(intersectionRef.current);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    if (!isInView) return;
    (async () => {
      const optimized = await imageOptimizationService.generateAutoOptimizedImage(src, { width, height, quality });
      setBestFormat(optimized);
    })();
  }, [src, isInView, width, height, quality]);

  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjM3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=';

  return (
    <div className={`relative overflow-hidden ${className}`} ref={intersectionRef} style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}>
      {!isLoaded && !hasError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      {isInView && (
        <img
          src={hasError ? fallbackImage : bestFormat}
          srcSet={srcSet || (responsive && !src.startsWith('data:') ? imageOptimizationService.generateSrcSet(src, [320, 640, 1024, 1600], { quality }) : undefined)}
          alt={alt} width={width} height={height} sizes={responsive ? sizes : undefined}
          className={`${className} transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105 blur-sm'}`}
          onLoad={() => { setIsLoaded(true); onLoad?.(); }}
          onError={() => { setHasError(true); onError?.(); }}
          loading={priority ? 'eager' : 'lazy'} decoding="async" crossOrigin="anonymous"
        />
      )}
    </div>
  );
};
