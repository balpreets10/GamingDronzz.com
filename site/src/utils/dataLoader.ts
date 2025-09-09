/**
 * Centralized Data Loader Utility
 * Single source of truth for all static data loading and validation
 */

import type { 
  StaticData, 
  ValidationResult, 
  DataLoader as IDataLoader, 
  DataSection,
  DesignSystem,
  ThemeConfiguration,
  CompanyData,
  ProjectMappings,
  NavigationData,
  SEOConfig,
  ServicesData
} from '../types/staticData';

// Import JSON data
import designSystemData from '../data/json/designSystem.json';
import themesData from '../data/json/themes.json';
import companyData from '../data/json/company.json';
import projectsData from '../data/json/projects.json';
import navigationData from '../data/json/navigation.json';
import seoData from '../data/json/seo.json';
import servicesData from '../data/json/services.json';

/**
 * Data validation functions
 */
const validateDesignSystem = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.breakpoints) errors.push('Design system missing breakpoints');
  if (!data.colors) errors.push('Design system missing colors');
  if (!data.typography) errors.push('Design system missing typography');
  if (!data.spacing) errors.push('Design system missing spacing');
  if (!data.shadows) errors.push('Design system missing shadows');

  if (data.breakpoints && !data.breakpoints.mobile) {
    warnings.push('Missing mobile breakpoint');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateThemes = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.availableThemes || !Array.isArray(data.availableThemes)) {
    errors.push('Themes missing availableThemes array');
  } else {
    data.availableThemes.forEach((theme: any, index: number) => {
      if (!theme.id) errors.push(`Theme ${index} missing id`);
      if (!theme.name) errors.push(`Theme ${index} missing name`);
      if (!theme.icon) warnings.push(`Theme ${index} missing icon`);
    });
  }

  if (!data.defaultTheme) warnings.push('No default theme specified');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateCompany = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.title) errors.push('Company data missing title');
  if (!data.description && !data.story) errors.push('Company data missing description or story');
  if (!data.team || !Array.isArray(data.team)) warnings.push('Company data missing team array');
  if (!data.skills || !Array.isArray(data.skills)) warnings.push('Company data missing skills array');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateProjects = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.mappings || !Array.isArray(data.mappings)) {
    errors.push('Projects missing mappings array');
  }
  
  if (!data.availableFolders || !Array.isArray(data.availableFolders)) {
    warnings.push('Projects missing availableFolders array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateNavigation = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.mainNavigation || !Array.isArray(data.mainNavigation)) {
    warnings.push('Navigation missing mainNavigation array');
  }

  if (!data.dashboardNavigation || !Array.isArray(data.dashboardNavigation)) {
    warnings.push('Navigation missing dashboardNavigation array');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateSEO = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.siteName) errors.push('SEO missing siteName');
  if (!data.defaultTitle) errors.push('SEO missing defaultTitle');
  if (!data.defaultDescription) errors.push('SEO missing defaultDescription');
  if (!data.siteUrl) warnings.push('SEO missing siteUrl');

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

const validateServices = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.services || !Array.isArray(data.services)) {
    errors.push('Services missing services array');
  } else {
    data.services.forEach((service: any, index: number) => {
      if (!service.id) errors.push(`Service ${index} missing id`);
      if (!service.title) errors.push(`Service ${index} missing title`);
      if (!service.category) warnings.push(`Service ${index} missing category`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Data Loader Class Implementation
 */
class DataLoader implements IDataLoader {
  private static instance: DataLoader;
  private cachedData: StaticData | null = null;
  private loadPromise: Promise<StaticData> | null = null;

  private constructor() {}

  static getInstance(): DataLoader {
    if (!DataLoader.instance) {
      DataLoader.instance = new DataLoader();
    }
    return DataLoader.instance;
  }

  async loadData(): Promise<StaticData> {
    if (this.cachedData) {
      return this.cachedData;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performDataLoad();
    this.cachedData = await this.loadPromise;
    
    return this.cachedData;
  }

  private async performDataLoad(): Promise<StaticData> {
    try {
      const staticData: StaticData = {
        designSystem: designSystemData as DesignSystem,
        themes: themesData as ThemeConfiguration,
        company: companyData as CompanyData,
        projects: projectsData as ProjectMappings,
        navigation: navigationData as NavigationData,
        seo: seoData as SEOConfig,
        services: servicesData as ServicesData
      };

      // Validate all data sections
      const validationResults = this.validateData(staticData);
      
      if (!validationResults.isValid) {
        console.warn('Static data validation failed:', validationResults.errors);
        if (validationResults.warnings.length > 0) {
          console.warn('Static data warnings:', validationResults.warnings);
        }
      }

      return staticData;
    } catch (error) {
      console.error('Failed to load static data:', error);
      throw new Error(`Data loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateData(data: Partial<StaticData>): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate each section
    if (data.designSystem) {
      const result = validateDesignSystem(data.designSystem);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.themes) {
      const result = validateThemes(data.themes);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.company) {
      const result = validateCompany(data.company);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.projects) {
      const result = validateProjects(data.projects);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.navigation) {
      const result = validateNavigation(data.navigation);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.seo) {
      const result = validateSEO(data.seo);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    if (data.services) {
      const result = validateServices(data.services);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  async getSection<K extends keyof StaticData>(section: K): Promise<StaticData[K]> {
    const data = await this.loadData();
    return data[section];
  }

  // Utility method to clear cache (useful for development/testing)
  clearCache(): void {
    this.cachedData = null;
    this.loadPromise = null;
  }

  // Method to reload data (useful for hot reloading)
  async reloadData(): Promise<StaticData> {
    this.clearCache();
    return this.loadData();
  }
}

// Export singleton instance
export const dataLoader = DataLoader.getInstance();

// Export convenience functions for common use cases
export const getStaticData = () => dataLoader.loadData();
export const getDesignSystem = () => dataLoader.getSection('designSystem');
export const getThemes = () => dataLoader.getSection('themes');
export const getCompanyData = () => dataLoader.getSection('company');
export const getProjectMappings = () => dataLoader.getSection('projects');
export const getNavigationData = () => dataLoader.getSection('navigation');
export const getSEOConfig = () => dataLoader.getSection('seo');
export const getServicesData = () => dataLoader.getSection('services');

// Export for testing and development
export { DataLoader };

// Validation utilities export
export const validateStaticData = (data: Partial<StaticData>) => dataLoader.validateData(data);

// React hook for data loading (optional, can be created later)
export const useStaticData = () => {
  // This would be implemented as a React hook when needed
  throw new Error('useStaticData hook not implemented yet. Use getStaticData() for now.');
};