// components/common/ResponsiveImage.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  getThumbnailSrc, 
  generateSrcSet, 
  generateSizes, 
  getFallbackImage, 
  checkImageExists,
  type ResponsiveImageProps 
} from '../../utils/imageUtils';

interface ResponsiveImageState {
  isLoaded: boolean;
  hasError: boolean;
  isInView: boolean;
  retryCount: number;
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  projectName,
  imageIndex = 0,
  category = 'pc',
  useLazyLoading = true,
  onLoadComplete,
  onError,
  alt,
  className = '',
  style,
  ...imgProps
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ResponsiveImageState>({
    isLoaded: false,
    hasError: false,
    isInView: false,
    retryCount: 0
  });

  // Generate image sources
  const thumbnailSrc = getThumbnailSrc(projectName);
  const srcSet = generateSrcSet(projectName, imageIndex);
  const sizes = generateSizes();
  const fallbackSrc = getFallbackImage(projectName, category);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!useLazyLoading || state.isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState(prev => ({ ...prev, isInView: true }));
        }
      },
      { 
        rootMargin: '50px 0px',
        threshold: 0.1 
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [useLazyLoading, state.isInView]);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isLoaded: true, 
      hasError: false, 
      retryCount: 0 
    }));

    // Animate image appearance
    if (imgRef.current) {
      imgRef.current.animate([
        { opacity: 0, transform: 'scale(1.05)' },
        { opacity: 1, transform: 'scale(1)' }
      ], {
        duration: 400,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'both'
      });
    }

    onLoadComplete?.();
  }, [onLoadComplete]);

  // Handle image load error with retry logic
  const handleImageError = useCallback(async () => {
    const maxRetries = 2;
    
    if (state.retryCount < maxRetries) {
      // Try checking if the image exists before retry
      const imageExists = await checkImageExists(thumbnailSrc);
      
      if (imageExists) {
        // Retry with cache bust
        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            retryCount: prev.retryCount + 1, 
            hasError: false 
          }));
          
          if (imgRef.current) {
            const timestamp = Date.now();
            const separator = imgRef.current.src.includes('?') ? '&' : '?';
            imgRef.current.src = `${imgRef.current.src}${separator}retry=${state.retryCount + 1}&t=${timestamp}`;
          }
        }, 1000 * (state.retryCount + 1));
      } else {
        // Image doesn't exist, use fallback
        setState(prev => ({ ...prev, hasError: true }));
        onError?.();
      }
    } else {
      // Max retries reached, use fallback
      setState(prev => ({ ...prev, hasError: true }));
      onError?.();
    }
  }, [state.retryCount, thumbnailSrc, onError]);

  // Determine which image source to use
  const getImageSrc = useCallback(() => {
    if (state.hasError && state.retryCount >= 2) {
      return fallbackSrc;
    }
    return thumbnailSrc;
  }, [state.hasError, state.retryCount, fallbackSrc, thumbnailSrc]);

  // Don't render anything until in view (for lazy loading)
  if (useLazyLoading && !state.isInView) {
    return (
      <div 
        ref={imgRef as any}
        className={`responsive-image-placeholder ${className}`}
        style={{ 
          width: '100%', 
          height: '250px', 
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style 
        }}
      >
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="responsive-image-container" style={{ position: 'relative' }}>
      {/* Loading placeholder */}
      {!state.isLoaded && !state.hasError && (
        <div 
          className="image-loading-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}
        >
          <div className="loading-spinner" />
          {state.retryCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              bottom: '8px', 
              fontSize: '12px', 
              color: '#6b7280' 
            }}>
              Retry {state.retryCount}/2
            </span>
          )}
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={getImageSrc()}
        srcSet={!state.hasError ? srcSet : undefined}
        sizes={!state.hasError ? sizes : undefined}
        alt={alt || `${projectName} project screenshot`}
        className={`responsive-image ${className} ${state.isLoaded ? 'loaded' : ''} ${state.hasError ? 'fallback' : ''}`}
        style={{
          width: '100%',
          height: 'auto',
          opacity: state.isLoaded || state.hasError ? 1 : 0,
          transition: 'opacity 0.3s ease',
          ...style
        }}
        loading={useLazyLoading ? 'lazy' : 'eager'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...imgProps}
      />
    </div>
  );
};

export default ResponsiveImage;