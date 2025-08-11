export interface ImageFormat {
    format: 'webp' | 'jpg' | 'png' | 'avif';
    quality?: number;
}

export interface ImageSize {
    width: number;
    height?: number;
    suffix?: string;
}

export const IMAGE_FORMATS: ImageFormat[] = [
    { format: 'avif', quality: 80 },
    { format: 'webp', quality: 85 },
    { format: 'jpg', quality: 90 }
];

export const IMAGE_SIZES: ImageSize[] = [
    { width: 400, suffix: 'sm' },
    { width: 800, suffix: 'md' },
    { width: 1200, suffix: 'lg' },
    { width: 1920, suffix: 'xl' }
];

export const generateSrcSet = (basePath: string, formats = IMAGE_FORMATS): string => {
    const sources: string[] = [];

    IMAGE_SIZES.forEach(size => {
        formats.forEach(format => {
            const path = basePath.replace(/\.[^/.]+$/, '');
            sources.push(`${path}-${size.suffix}.${format.format} ${size.width}w`);
        });
    });

    return sources.join(', ');
};

export const generatePictureElement = (
    src: string,
    alt: string,
    className?: string
): string => {
    const basePath = src.replace(/\.[^/.]+$/, '');

    const sources = IMAGE_FORMATS.map(format =>
        `<source srcset="${generateSrcSet(basePath, [format])}" type="image/${format.format}">`
    ).join('');

    return `
    <picture class="${className || ''}">
      ${sources}
      <img src="${src}" alt="${alt}" loading="lazy" />
    </picture>
  `;
};

export const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
};

export const preloadImages = async (sources: string[]): Promise<void[]> => {
    return Promise.all(sources.map(preloadImage));
};

export const isWebPSupported = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
};

export const isAVIFSupported = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('avif') > -1;
};

export const getBestImageFormat = (): string => {
    if (isAVIFSupported()) return 'avif';
    if (isWebPSupported()) return 'webp';
    return 'jpg';
};

export const optimizeImagePath = (path: string, size?: string): string => {
    const format = getBestImageFormat();
    const basePath = path.replace(/\.[^/.]+$/, '');
    const sizePrefix = size ? `-${size}` : '';
    return `${basePath}${sizePrefix}.${format}`;
};