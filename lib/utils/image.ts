/**
 * Image Utilities
 * Helpers za optimizaciju slika i blur placeholders
 */

/**
 * Generate simple blur data URL
 * Koristi se kao placeholder dok se slika učitava
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = typeof document !== 'undefined' 
    ? document.createElement('canvas')
    : null;
    
  if (!canvas) {
    // Fallback za server-side
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyZDNkNTAiLz48L3N2Zz4=';
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  // Create gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#2d3d50');
  gradient.addColorStop(0.5, '#1e293b');
  gradient.addColorStop(1, '#0f172a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * SVG blur placeholder - lightweight alternative
 */
export const SVG_BLUR_PLACEHOLDER = 
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMyZDNkNTAiLz48L3N2Zz4=';

/**
 * Next.js Image component props sa blur placeholder
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * Default props za optimizovane slike
 */
export const defaultImageProps: Partial<OptimizedImageProps> = {
  placeholder: 'blur',
  blurDataURL: SVG_BLUR_PLACEHOLDER,
  priority: false,
};

/**
 * Helper za hero images (above the fold)
 */
export const heroImageProps: Partial<OptimizedImageProps> = {
  ...defaultImageProps,
  priority: true, // Učitaj odmah
};

/**
 * Helper za lazy-loaded images
 */
export const lazyImageProps: Partial<OptimizedImageProps> = {
  ...defaultImageProps,
  priority: false, // Učitaj kad uđe u viewport
};
