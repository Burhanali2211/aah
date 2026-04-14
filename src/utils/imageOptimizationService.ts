// Image optimization service
export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private cache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Generate optimized image URL with format and quality parameters
   */
  generateOptimizedImageUrl(
    baseUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png';
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    } = {}
  ): string {
    const cacheKey = `${baseUrl}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (baseUrl.startsWith('data:') || baseUrl.includes('?')) {
      return baseUrl;
    }

    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      fit = 'cover'
    } = options;

    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== 80) params.append('q', quality.toString());
    if (fit !== 'cover') params.append('fit', fit);
    if (format !== 'auto') params.append('f', format);

    const optimizedUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    this.cache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }

  generateResponsiveImageSet(
    baseUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536],
    options: { quality?: number; format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png'; fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'; } = {}
  ): { src: string; width: number }[] {
    return breakpoints.map(width => ({ src: this.generateOptimizedImageUrl(baseUrl, { ...options, width }), width }));
  }

  generateSrcSet(
    baseUrl: string,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1536],
    options: { quality?: number; format?: 'auto' | 'avif' | 'webp' | 'jpeg' | 'png'; fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'; } = {}
  ): string {
    return this.generateResponsiveImageSet(baseUrl, breakpoints, options).map(img => `${img.src} ${img.width}w`).join(', ');
  }

  generateBlurPlaceholder(baseUrl: string): string {
    return this.generateOptimizedImageUrl(baseUrl, { width: 20, quality: 20, fit: 'inside' });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const ImageFormatDetector = {
  getBestSupportedFormat: async (): Promise<'avif' | 'webp' | 'original'> => {
    // Simplified detection — in production you'd use checkFeatures() or similar
    // For now, we assume most modern browsers support webp at minimum
    return 'webp'; 
  }
};

export const imageOptimizationService = ImageOptimizationService.getInstance();

export const generateProductImageSet = (baseUrl: string, quality: number = 80) => imageOptimizationService.generateResponsiveImageSet(baseUrl, [200, 400, 600, 800], { quality });
export const generateProductSrcSet = (baseUrl: string, quality: number = 80) => imageOptimizationService.generateSrcSet(baseUrl, [200, 400, 600, 800], { quality });