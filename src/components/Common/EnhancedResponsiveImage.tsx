import React, { useState, useRef, useEffect } from 'react';
import { imageOptimizationService, ImageFormatDetector } from '../../utils/imageOptimizationService';

interface EnhancedResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  priority?: boolean;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  breakpoints?: number[];
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  placeholder?: 'blur' | 'color' | 'none';
  backgroundColor?: string;
}

export const EnhancedResponsiveImage: React.FC<EnhancedResponsiveImageProps> = ({
  src, alt, className = '', width, height, sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', quality = 80, priority = false, lazy = true, onLoad, onError, breakpoints = [320, 640, 768, 1024, 1280, 1536], fit = 'cover', placeholder = 'blur', backgroundColor = '#f0f0f0'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority || !lazy);
  const [hasError, setHasError] = useState(false);
  const [srcSet, setSrcSet] = useState<string>('');
  const [bestSrc, setBestSrc] = useState<string>(src);
  const [placeholderSrc, setPlaceholderSrc] = useState<string>('');
  const intersectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority || !lazy) return setIsInView(true);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setIsInView(true); observer.disconnect(); }
    }, { threshold: 0.1, rootMargin: '50px' });
    if (intersectionRef.current) observer.observe(intersectionRef.current);
    return () => observer.disconnect();
  }, [priority, lazy]);

  useEffect(() => {
    if (!src) return;
    (async () => {
      try {
        const bestFormat = await ImageFormatDetector.getBestSupportedFormat();
        const genSrcSet = imageOptimizationService.generateSrcSet(src, breakpoints, { quality, format: bestFormat === 'original' ? undefined : bestFormat, fit });
        setSrcSet(genSrcSet);
        const bestSrcUrl = imageOptimizationService.generateOptimizedImageUrl(src, { width: breakpoints[breakpoints.length - 1], quality, format: bestFormat === 'original' ? undefined : bestFormat, fit });
        setBestSrc(bestSrcUrl);
        if (placeholder === 'blur') setPlaceholderSrc(imageOptimizationService.generateBlurPlaceholder(src));
      } catch (err) {
        setBestSrc(src);
      }
    })();
  }, [src, breakpoints, quality, fit, placeholder]);

  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjM3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=';
  const showPlaceholder = !isLoaded && !hasError && isInView && placeholder === 'blur' && placeholderSrc;

  return (
    <div className={`relative overflow-hidden ${className}`} ref={intersectionRef} style={{ aspectRatio: width && height ? `${width}/${height}` : undefined, backgroundColor: showPlaceholder ? backgroundColor : undefined }}>
      {!isLoaded && !hasError && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      {showPlaceholder && <img src={placeholderSrc} alt="" className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-105" />}
      {isInView && (
        <img
          src={hasError ? fallbackImage : bestSrc} srcSet={srcSet || undefined} sizes={sizes} alt={alt} width={width} height={height}
          className={`${className} transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} ${showPlaceholder ? 'filter blur-sm' : ''}`}
          onLoad={() => { setIsLoaded(true); onLoad?.(); }}
          onError={() => { setHasError(true); onError?.(); }}
          loading={priority ? 'eager' : lazy ? 'lazy' : undefined} decoding="async" crossOrigin="anonymous"
        />
      )}
    </div>
  );
};