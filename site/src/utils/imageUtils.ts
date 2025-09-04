// utils/imageUtils.ts
/**
 * Utility for responsive image loading based on screen resolution
 * Supports project assets in public/assets/projects/[project-name]/ structure
 */

interface ImageSourceSet {
  src: string;
  width: number;
}

interface ResponsiveImageOptions {
  projectName: string;
  imageIndex?: number;
  fallbackImageUrl?: string;
  alt: string;
}

/**
 * Get the appropriate image resolution based on current screen size
 */
export const getCurrentResolution = (): number => {
  if (typeof window === 'undefined') return 992; // SSR fallback
  
  const width = window.innerWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const effectiveWidth = width * pixelRatio;
  
  // Map to available resolution folders
  if (effectiveWidth >= 1200) return 1200;
  if (effectiveWidth >= 992) return 992;
  if (effectiveWidth >= 768) return 768;
  if (effectiveWidth >= 576) return 576;
  return 480;
};

/**
 * Generate image source set for responsive loading
 */
export const generateImageSourceSet = (
  projectName: string, 
  imageIndex: number = 0
): ImageSourceSet[] => {
  const resolutions = [480, 576, 768, 992, 1200];
  
  return resolutions.map(width => ({
    src: `/assets/projects/${projectName}/${width}/${projectName}-${imageIndex}.png`,
    width
  }));
};

/**
 * Get the thumbnail image source (smallest resolution, index 0)
 */
export const getThumbnailSrc = (projectName: string): string => {
  return `/assets/projects/${projectName}/480/${projectName}-0.png`;
};

/**
 * Get the appropriate image source based on current viewport
 */
export const getResponsiveImageSrc = (
  projectName: string,
  imageIndex: number = 0
): string => {
  const resolution = getCurrentResolution();
  return `/assets/projects/${projectName}/${resolution}/${projectName}-${imageIndex}.png`;
};

/**
 * Generate srcset attribute for img element
 */
export const generateSrcSet = (projectName: string, imageIndex: number = 0): string => {
  const sourceSet = generateImageSourceSet(projectName, imageIndex);
  return sourceSet
    .map(source => `${source.src} ${source.width}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for img element
 */
export const generateSizes = (): string => {
  return '(max-width: 576px) 480px, (max-width: 768px) 576px, (max-width: 992px) 768px, (max-width: 1200px) 992px, 1200px';
};

/**
 * Check if project has image assets in the expected structure
 */
export const checkImageExists = async (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * Get fallback image if project assets don't exist
 */
export const getFallbackImage = (projectName: string, category: string): string => {
  const categoryColorMap: Record<string, string> = {
    'mobile': '#4A90E2',
    'pc': '#7DD3FC', 
    'console': '#34D399',
    'vr': '#F59E0B',
    'ar': '#EF4444'
  };

  const categoryColor = categoryColorMap[category] || '#6B7280';
  const encodedTitle = encodeURIComponent(
    projectName.length > 20 ? projectName.substring(0, 17) + '...' : projectName
  );
  const encodedCategory = encodeURIComponent(category.toUpperCase());

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:${encodeURIComponent(categoryColor)};stop-opacity:0.05'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='250' fill='url(%23grad)' rx='12'/%3E%3Crect x='50' y='75' width='300' height='100' fill='${encodeURIComponent(categoryColor)}' opacity='0.1' rx='8'/%3E%3Ctext x='200' y='115' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='16' font-weight='600' fill='${encodeURIComponent(categoryColor)}'%3E${encodedTitle}%3C/text%3E%3Ctext x='200' y='140' text-anchor='middle' font-family='Inter, Arial, sans-serif' font-size='12' fill='%236B7280'%3E${encodedCategory} Project%3C/text%3E%3C/svg%3E`;
};

/**
 * Extract project name from project title for file system paths
 */
export const getProjectNameFromTitle = (title: string): string => {
  return title.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
};

/**
 * Advanced responsive image component props
 */
export interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  projectName: string;
  imageIndex?: number;
  category?: string;
  useLazyLoading?: boolean;
  onLoadComplete?: () => void;
  onError?: () => void;
}