/**
 * Logo utilities for dynamic logo selection based on theme contrast
 */

import { useState, useEffect } from 'react';
import { getCurrentTheme } from '../managers/ThemeManager';

export interface LogoInfo {
  src: string;
  alt: string;
  isLightLogo: boolean;
}

/**
 * Get the appropriate logo based on the current theme's header background contrast
 * Light logos are used on dark backgrounds, dark logos on light backgrounds
 */
export const getThemeLogo = (): LogoInfo => {
  const currentTheme = getCurrentTheme();
  
  if (!currentTheme) {
    // Fallback to light logo if no theme is available
    return {
      src: '/assets/images/logo-light.png',
      alt: 'GamingDronzz',
      isLightLogo: true
    };
  }

  // Define themes that typically have dark headers (need light logo)
  const darkHeaderThemes = [
    'dark-cyber',
    'gaming-inferno', 
    'space-explorer',
    'electric-storm',
    'ocean-deep',
    'retro-arcade',
    'default',  // Formal theme uses dark header
    'forest-tech'  // Forest tech uses dark header
  ];

  // Define themes that typically have light headers (need dark logo)  
  const lightHeaderThemes = [
    'arctic-frost',
    'sakura-bloom',
    'minimal-green'
  ];

  // Check for explicit theme classification first (most reliable)
  if (darkHeaderThemes.includes(currentTheme.id)) {
    return {
      src: '/assets/images/logo-light.png',
      alt: 'GamingDronzz',
      isLightLogo: true
    };
  }

  if (lightHeaderThemes.includes(currentTheme.id)) {
    return {
      src: '/assets/images/logo-dark.png',
      alt: 'GamingDronzz',
      isLightLogo: false
    };
  }

  // For themes not explicitly categorized, use keyword analysis as fallback
  const themeName = currentTheme.name.toLowerCase();
  const themeId = currentTheme.id.toLowerCase();
  
  const darkKeywords = ['dark', 'night', 'deep', 'black', 'shadow', 'cyber', 'inferno', 'storm', 'tech'];
  const lightKeywords = ['light', 'bright', 'white', 'frost', 'minimal', 'clean', 'bloom', 'arctic'];

  const isDarkTheme = darkKeywords.some(keyword => 
    themeName.includes(keyword) || themeId.includes(keyword)
  );
  
  const isLightTheme = lightKeywords.some(keyword => 
    themeName.includes(keyword) || themeId.includes(keyword)
  );

  // Prioritize dark theme detection to avoid conflicts
  if (isDarkTheme) {
    return {
      src: '/assets/images/logo-light.png',
      alt: 'GamingDronzz',
      isLightLogo: true
    };
  }

  if (isLightTheme) {
    return {
      src: '/assets/images/logo-dark.png',
      alt: 'GamingDronzz',
      isLightLogo: false
    };
  }

  // Default fallback - use light logo for unknown themes (safer default)
  return {
    src: '/assets/images/logo-light.png',
    alt: 'GamingDronzz',
    isLightLogo: true
  };
};

/**
 * Hook to get logo info with reactivity to theme changes
 * Provides reactive updates when theme changes
 */
export const useThemeLogo = (): LogoInfo => {
  const [logoInfo, setLogoInfo] = useState<LogoInfo>(() => getThemeLogo());
  
  useEffect(() => {
    // Function to update logo when theme changes
    const updateLogo = () => {
      const newLogoInfo = getThemeLogo();
      setLogoInfo(prevLogo => {
        // Only update if logo actually changed to prevent unnecessary re-renders
        if (prevLogo.src !== newLogoInfo.src || prevLogo.isLightLogo !== newLogoInfo.isLightLogo) {
          return newLogoInfo;
        }
        return prevLogo;
      });
    };

    // Set up observer for theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' && 
          mutation.attributeName === 'data-theme'
        ) {
          // Theme changed, update logo
          setTimeout(updateLogo, 0); // Defer to next tick to ensure theme is applied
        }
      });
    });

    // Start observing theme changes on document element
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Also check on mount to ensure we have the correct logo
    updateLogo();

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return logoInfo;
};