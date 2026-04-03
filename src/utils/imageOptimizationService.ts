
// Image format support detection
export class ImageFormatDetector {
  private static supportsWebP: boolean | null = null;
  private static supportsAVIF: boolean | null = null;

  static async detectWebPSupport(): Promise<boolean> {
    if (this.supportsWebP !== null) return this.supportsWebP;

    if (typeof window === 'undefined') {
      this.supportsWebP = false;
      return false;
    }

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = webP.height === 2;
        resolve(this.supportsWebP);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  static async detectAVIFSupport(): Promise<boolean> {
    if (this.supportsAVIF !== null) return this.supportsAVIF;

    if (typeof window === 'undefined') {
      this.supportsAVIF = false;
      return false;
    }

    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        this.supportsAVIF = avif.height === 2;
        resolve(this.supportsAVIF);
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }

  static async getBestSupportedFormat(): Promise<'avif' | 'webp' | 'original'> {
    const [supportsAVIF, supportsWebP] = await Promise.all([
      this.detectAVIFSupport(),
      this.detectWebPSupport()
    ]);

    if (supportsAVIF) return 'avif';
    if (supportsWebP) return 'webp';
    return 'original';
  }
}

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

  async generateAutoOptimizedImage(
    baseUrl: string,
    options: { width?: number; height?: number; quality?: number; fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'; } = {}
  ): Promise<string> {
    try {
      const bestFormat = await ImageFormatDetector.getBestSupportedFormat();
      return this.generateOptimizedImageUrl(baseUrl, {
        ...options,
        format: bestFormat === 'original' ? undefined : bestFormat
      });
    } catch (error) {
      return baseUrl;
    }
  }

  generateBlurPlaceholder(baseUrl: string): string {
    return this.generateOptimizedImageUrl(baseUrl, { width: 20, quality: 20, fit: 'inside' });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const imageOptimizationService = ImageOptimizationService.getInstance();

export const generateProductImageSet = (baseUrl: string, quality: number = 80) => imageOptimizationService.generateResponsiveImageSet(baseUrl, [200, 400, 600, 800], { quality });
export const generateProductSrcSet = (baseUrl: string, quality: number = 80) => imageOptimizationService.generateSrcSet(baseUrl, [200, 400, 600, 800], { quality });
export const generateAutoOptimizedProductImage = async (baseUrl: string, width?: number) => imageOptimizationService.generateAutoOptimizedImage(baseUrl, { width, quality: 80 });