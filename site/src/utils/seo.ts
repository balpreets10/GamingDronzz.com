/**
 * SEO Utilities (New Implementation)
 * Uses the centralized data loader for SEO management
 */

import { getSEOConfig } from './dataLoader';
import type { SEOConfig } from '../types/staticData';

// Cache for SEO config
let seoCache: SEOConfig | null = null;

// Legacy SEO interfaces for backward compatibility
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  siteName?: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Initialize SEO config cache
 */
const initializeSEOConfig = async (): Promise<SEOConfig> => {
  if (!seoCache) {
    try {
      seoCache = await getSEOConfig();
    } catch (error) {
      console.error('Failed to load SEO config:', error);
      // Fallback SEO config
      seoCache = {
        siteName: 'GamingDronzz',
        defaultTitle: 'GamingDronzz - Expert Game Development Services',
        defaultDescription: 'Transform your gaming ideas into reality with our expert development team.',
        defaultKeywords: ['game development', 'unity', 'unreal engine'],
        defaultImage: '/og-image.png',
        siteUrl: 'https://gamingdronzz.com',
        twitterHandle: '@gamingdronzz',
        organizationSchema: {
          name: 'GamingDronzz',
          url: 'https://gamingdronzz.com',
          logo: 'https://gamingdronzz.com/logo.png',
          description: 'Expert game development consultancy and services',
          contactPoint: {
            telephone: '+1-555-GAMING',
            contactType: 'customer service'
          },
          sameAs: []
        },
        sectionSEO: {}
      };
    }
  }
  return seoCache;
};

/**
 * Update meta tags with SEO data
 */
export const updateMetaTags = (seoData: SEOData): void => {
  // Title
  document.title = seoData.title;

  // Description
  updateMetaTag('description', seoData.description);

  // Keywords
  if (seoData.keywords?.length) {
    updateMetaTag('keywords', seoData.keywords.join(', '));
  }

  // Open Graph
  updateMetaTag('og:title', seoData.title);
  updateMetaTag('og:description', seoData.description);
  updateMetaTag('og:type', seoData.type || 'website');
  updateMetaTag('og:site_name', seoData.siteName || 'GamingDronzz');

  if (seoData.image) {
    updateMetaTag('og:image', seoData.image);
  }

  if (seoData.url) {
    updateMetaTag('og:url', seoData.url);
  }

  // Twitter
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', seoData.title);
  updateMetaTag('twitter:description', seoData.description);

  if (seoData.image) {
    updateMetaTag('twitter:image', seoData.image);
  }
};

const updateMetaTag = (name: string, content: string): void => {
  const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
  const attribute = isProperty ? 'property' : 'name';

  let tag = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
};

/**
 * Add structured data to document
 */
export const addStructuredData = (data: StructuredData): void => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Create organization schema from config
 */
export const createOrganizationSchema = async (): Promise<StructuredData> => {
  const config = await initializeSEOConfig();
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    ...config.organizationSchema
  };
};

/**
 * Create service schema
 */
export const createServiceSchema = (service: any): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.title,
  description: service.description,
  provider: {
    '@type': 'Organization',
    name: 'GamingDronzz'
  },
  serviceType: service.category,
  offers: {
    '@type': 'Offer',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'USD',
      valueReference: service.pricing
    }
  }
});

/**
 * Create project schema
 */
export const createProjectSchema = (project: any): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.title,
  description: project.description,
  image: project.image,
  creator: {
    '@type': 'Organization',
    name: 'GamingDronzz'
  },
  datePublished: `${project.year}-01-01`,
  keywords: project.technologies?.join(', ')
});

/**
 * Generate SEO data for a specific section using centralized config
 */
export const generateSEOForSection = async (section: string): Promise<SEOData> => {
  const config = await initializeSEOConfig();
  
  const baseData = {
    siteName: config.siteName,
    type: 'website' as const,
    url: `${config.siteUrl}#${section}`,
    image: config.defaultImage
  };

  // Check if section has specific SEO config
  const sectionSEO = config.sectionSEO[section];
  
  if (sectionSEO) {
    return {
      ...baseData,
      title: sectionSEO.title,
      description: sectionSEO.description,
      keywords: sectionSEO.keywords,
      image: sectionSEO.image || baseData.image
    };
  }

  // Fallback to default SEO
  return {
    ...baseData,
    title: config.defaultTitle,
    description: config.defaultDescription,
    keywords: config.defaultKeywords
  };
};

/**
 * Get default SEO data
 */
export const getDefaultSEOData = async (): Promise<SEOData> => {
  const config = await initializeSEOConfig();
  
  return {
    title: config.defaultTitle,
    description: config.defaultDescription,
    keywords: config.defaultKeywords,
    image: config.defaultImage,
    url: config.siteUrl,
    type: 'website',
    siteName: config.siteName
  };
};

/**
 * Get SEO config
 */
export const getSEOConfigData = initializeSEOConfig;

/**
 * Update page SEO for a specific section
 */
export const updatePageSEO = async (section: string): Promise<void> => {
  try {
    const seoData = await generateSEOForSection(section);
    updateMetaTags(seoData);
    
    // Add organization schema
    const orgSchema = await createOrganizationSchema();
    addStructuredData(orgSchema);
  } catch (error) {
    console.error('Failed to update page SEO:', error);
  }
};

/**
 * Validate SEO configuration
 */
export const validateSEOConfig = async (): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const config = await initializeSEOConfig();
    
    if (!config.siteName) errors.push('Missing site name');
    if (!config.defaultTitle) errors.push('Missing default title');
    if (!config.defaultDescription) errors.push('Missing default description');
    if (!config.siteUrl) warnings.push('Missing site URL');
    if (!config.defaultImage) warnings.push('Missing default image');
    
    if (config.defaultTitle && config.defaultTitle.length > 60) {
      warnings.push('Default title might be too long for optimal SEO');
    }
    
    if (config.defaultDescription && config.defaultDescription.length > 160) {
      warnings.push('Default description might be too long for optimal SEO');
    }
    
  } catch (error) {
    errors.push(`Failed to validate SEO config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};