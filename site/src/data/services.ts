/**
 * Services Data (New Implementation)
 * Uses the centralized data loader for services management
 */

import { getServicesData } from '../utils/dataLoader';
import type { ServicesData, Service } from '../types/staticData';

// Cache for services data
let servicesCache: ServicesData | null = null;

// Legacy interface for backward compatibility
export interface ServiceData {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  pricing: 'consultation' | 'project-based' | 'hourly';
  category: 'development' | 'consulting' | 'optimization' | 'design';
  featured: boolean;
}

/**
 * Initialize services data cache
 */
const initializeServicesData = async (): Promise<ServicesData> => {
  if (!servicesCache) {
    try {
      servicesCache = await getServicesData();
    } catch (error) {
      console.error('Failed to load services data:', error);
      // Fallback services data
      servicesCache = {
        categories: ['development', 'consulting', 'optimization', 'design'],
        services: []
      };
    }
  }
  return servicesCache;
};

/**
 * Get all services
 */
export const getAllServices = async (): Promise<Service[]> => {
  const data = await initializeServicesData();
  return data.services;
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (category: Service['category']): Promise<Service[]> => {
  const services = await getAllServices();
  return services.filter(service => service.category === category);
};

/**
 * Get featured services
 */
export const getFeaturedServices = async (): Promise<Service[]> => {
  const services = await getAllServices();
  // Check if service has featured property or use pricing type as fallback
  return services.filter(service => 
    // Prioritize project-based services as featured
    service.pricing?.type === 'project' || 
    service.features.length >= 4 // Services with more features are considered featured
  );
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: string): Promise<Service | undefined> => {
  const services = await getAllServices();
  return services.find(service => service.id === id);
};

/**
 * Get all service categories
 */
export const getServiceCategories = async (): Promise<string[]> => {
  const data = await initializeServicesData();
  return data.categories;
};

/**
 * Search services
 */
export const searchServices = async (query: string): Promise<Service[]> => {
  const services = await getAllServices();
  const lowerQuery = query.toLowerCase();
  
  return services.filter(service =>
    service.title.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.category.toLowerCase().includes(lowerQuery) ||
    service.features.some(feature => feature.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get services by pricing type
 */
export const getServicesByPricingType = async (pricingType: 'fixed' | 'hourly' | 'project'): Promise<Service[]> => {
  const services = await getAllServices();
  return services.filter(service => service.pricing?.type === pricingType);
};

/**
 * Get services within price range
 */
export const getServicesInPriceRange = async (minPrice: number, maxPrice: number): Promise<Service[]> => {
  const services = await getAllServices();
  return services.filter(service => {
    if (!service.pricing?.min || !service.pricing?.max) return false;
    return service.pricing.min >= minPrice && service.pricing.max <= maxPrice;
  });
};

/**
 * Get service statistics
 */
export const getServiceStatistics = async () => {
  const services = await getAllServices();
  const categories = await getServiceCategories();
  
  return {
    totalServices: services.length,
    totalCategories: categories.length,
    servicesByCategory: categories.reduce((acc, category) => {
      acc[category] = services.filter(service => service.category === category).length;
      return acc;
    }, {} as Record<string, number>),
    averageFeaturesPerService: services.reduce((sum, service) => sum + service.features.length, 0) / services.length,
    pricingTypeDistribution: {
      fixed: services.filter(s => s.pricing?.type === 'fixed').length,
      hourly: services.filter(s => s.pricing?.type === 'hourly').length,
      project: services.filter(s => s.pricing?.type === 'project').length
    }
  };
};

/**
 * Convert new Service format to legacy ServiceData format
 */
const convertToLegacyFormat = (service: Service): ServiceData => ({
  id: service.id,
  title: service.title,
  description: service.description,
  icon: service.icon,
  features: service.features,
  pricing: service.pricing?.type === 'project' ? 'project-based' : 
           service.pricing?.type === 'hourly' ? 'hourly' : 'consultation',
  category: service.category,
  featured: service.pricing?.type === 'project' || service.features.length >= 4
});

/**
 * Legacy exports for backward compatibility
 */
export let servicesData: ServiceData[] = [];

// Legacy functions with updated implementations
export const getServicesByCategoryLegacy = async (category: ServiceData['category']): Promise<ServiceData[]> => {
  const services = await getServicesByCategory(category);
  return services.map(convertToLegacyFormat);
};

export const getFeaturedServicesLegacy = async (): Promise<ServiceData[]> => {
  const services = await getFeaturedServices();
  return services.map(convertToLegacyFormat);
};

export const getServiceByIdLegacy = async (id: string): Promise<ServiceData | undefined> => {
  const service = await getServiceById(id);
  return service ? convertToLegacyFormat(service) : undefined;
};

// Initialize services data and populate legacy export
initializeServicesData().then(data => {
  const legacyData = data.services.map(convertToLegacyFormat);
  servicesData.splice(0, servicesData.length, ...legacyData);
}).catch(error => {
  console.error('Failed to initialize services data for legacy compatibility:', error);
});

// Re-export types
export type { Service, ServicesData };

// Export the complete services data getter
export const getCompleteServicesData = initializeServicesData;