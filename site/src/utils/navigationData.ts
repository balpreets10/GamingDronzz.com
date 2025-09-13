/**
 * Navigation Data Utility
 * Uses the centralized data loader for navigation management
 */

import { getNavigationData } from './dataLoader';
import type { NavigationData, NavigationItem, NavigationSection } from '../types/staticData';

// Cache for navigation data
let navigationCache: NavigationData | null = null;

/**
 * Initialize navigation data cache
 */
const initializeNavigationData = async (): Promise<NavigationData> => {
  if (!navigationCache) {
    try {
      navigationCache = await getNavigationData();
    } catch (error) {
      console.error('Failed to load navigation data:', error);
      // Fallback navigation data
      navigationCache = {
        mainNavigation: [
          {
            id: 'home',
            label: 'Home',
            href: '#hero',
            icon: '🏠'
          }
        ],
        dashboardNavigation: [
          {
            id: 'overview',
            label: 'Overview',
            href: '/dashboard/overview',
            icon: '📊'
          }
        ],
        footerNavigation: [],
        socialLinks: []
      };
    }
  }
  return navigationCache;
};

/**
 * Get main navigation items
 */
export const getMainNavigation = async (): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  return data.mainNavigation;
};

/**
 * Get dashboard navigation items
 */
export const getDashboardNavigation = async (): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  return data.dashboardNavigation;
};

/**
 * Get footer navigation sections
 */
export const getFooterNavigation = async (): Promise<NavigationSection[]> => {
  const data = await initializeNavigationData();
  return data.footerNavigation;
};

/**
 * Get social links
 */
export const getSocialLinks = async (): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  return data.socialLinks;
};

/**
 * Get navigation item by ID from main navigation
 */
export const getMainNavigationItem = async (id: string): Promise<NavigationItem | undefined> => {
  const mainNav = await getMainNavigation();
  return mainNav.find(item => item.id === id);
};

/**
 * Get dashboard navigation item by ID
 */
export const getDashboardNavigationItem = async (id: string): Promise<NavigationItem | undefined> => {
  const dashboardNav = await getDashboardNavigation();
  return dashboardNav.find(item => item.id === id);
};

/**
 * Get footer navigation section by ID
 */
export const getFooterNavigationSection = async (id: string): Promise<NavigationSection | undefined> => {
  const footerNav = await getFooterNavigation();
  return footerNav.find(section => section.id === id);
};

/**
 * Get social link by ID
 */
export const getSocialLink = async (id: string): Promise<NavigationItem | undefined> => {
  const socialLinks = await getSocialLinks();
  return socialLinks.find(link => link.id === id);
};

/**
 * Search navigation items
 */
export const searchNavigationItems = async (query: string): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  const lowerQuery = query.toLowerCase();
  
  const allItems: NavigationItem[] = [
    ...data.mainNavigation,
    ...data.dashboardNavigation,
    ...data.socialLinks,
    ...data.footerNavigation.flatMap(section => section.items)
  ];
  
  return allItems.filter(item => 
    item.label.toLowerCase().includes(lowerQuery) ||
    item.id.toLowerCase().includes(lowerQuery) ||
    (item.href && item.href.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get navigation items by position (for radial navigation)
 */
export const getNavigationItemsByPosition = async (): Promise<NavigationItem[]> => {
  const mainNav = await getMainNavigation();
  return mainNav
    .filter(item => typeof item.position === 'number')
    .sort((a, b) => (a.position || 0) - (b.position || 0));
};

/**
 * Get external links
 */
export const getExternalNavigationItems = async (): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  const allItems: NavigationItem[] = [
    ...data.mainNavigation,
    ...data.dashboardNavigation,
    ...data.socialLinks,
    ...data.footerNavigation.flatMap(section => section.items)
  ];
  
  return allItems.filter(item => item.external === true);
};

/**
 * Get internal links
 */
export const getInternalNavigationItems = async (): Promise<NavigationItem[]> => {
  const data = await initializeNavigationData();
  const allItems: NavigationItem[] = [
    ...data.mainNavigation,
    ...data.dashboardNavigation,
    ...data.socialLinks,
    ...data.footerNavigation.flatMap(section => section.items)
  ];
  
  return allItems.filter(item => !item.external);
};

/**
 * Validate navigation structure
 */
export const validateNavigation = async (): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = [];
  
  try {
    const data = await initializeNavigationData();
    
    // Check main navigation
    data.mainNavigation.forEach((item, index) => {
      if (!item.id) errors.push(`Main navigation item ${index} missing id`);
      if (!item.label) errors.push(`Main navigation item ${index} missing label`);
      if (!item.icon) errors.push(`Main navigation item ${index} missing icon`);
    });
    
    // Check dashboard navigation
    data.dashboardNavigation.forEach((item, index) => {
      if (!item.id) errors.push(`Dashboard navigation item ${index} missing id`);
      if (!item.label) errors.push(`Dashboard navigation item ${index} missing label`);
      if (!item.icon) errors.push(`Dashboard navigation item ${index} missing icon`);
    });
    
    // Check for duplicate IDs
    const allIds = [
      ...data.mainNavigation.map(item => item.id),
      ...data.dashboardNavigation.map(item => item.id),
      ...data.socialLinks.map(item => item.id)
    ];
    
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate navigation IDs found: ${duplicateIds.join(', ')}`);
    }
    
  } catch (error) {
    errors.push(`Failed to validate navigation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Legacy compatibility - populated asynchronously
export const mainNavigationItems: NavigationItem[] = [];
export const dashboardNavigationItems: NavigationItem[] = [];

// Initialize legacy exports
initializeNavigationData().then(data => {
  mainNavigationItems.splice(0, mainNavigationItems.length, ...data.mainNavigation);
  dashboardNavigationItems.splice(0, dashboardNavigationItems.length, ...data.dashboardNavigation);
}).catch(error => {
  console.error('Failed to initialize navigation data for legacy compatibility:', error);
});

// Export the complete navigation data getter
export const getCompleteNavigationData = initializeNavigationData;