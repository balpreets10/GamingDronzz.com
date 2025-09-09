/**
 * Project Image Mapping (New Implementation)
 * Uses the centralized data loader for project mappings
 */

import { getProjectMappings } from './dataLoader';
import type { ProjectMappings, ProjectMapping } from '../types/staticData';

// Cache for project mappings
let projectMappingsCache: ProjectMappings | null = null;

/**
 * Initialize project mappings cache
 */
const initializeProjectMappings = async (): Promise<ProjectMappings> => {
  if (!projectMappingsCache) {
    try {
      projectMappingsCache = await getProjectMappings();
    } catch (error) {
      console.error('Failed to load project mappings:', error);
      // Fallback project mappings
      projectMappingsCache = {
        mappings: [],
        availableFolders: []
      };
    }
  }
  return projectMappingsCache;
};

/**
 * Get the folder name for a project based on its title
 */
export const getProjectFolderName = async (projectTitle: string): Promise<string | null> => {
  const mappings = await initializeProjectMappings();
  
  // Try exact match first
  const exactMatch = mappings.mappings.find(mapping => 
    mapping.title === projectTitle || 
    mapping.aliases.includes(projectTitle)
  );
  
  if (exactMatch) {
    return exactMatch.folderName;
  }
  
  // Try case-insensitive match
  const lowerTitle = projectTitle.toLowerCase();
  const caseInsensitiveMatch = mappings.mappings.find(mapping => 
    mapping.title.toLowerCase() === lowerTitle ||
    mapping.aliases.some(alias => alias.toLowerCase() === lowerTitle)
  );
  
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch.folderName;
  }
  
  // Try partial match
  const partialMatch = mappings.mappings.find(mapping => 
    mapping.title.toLowerCase().includes(lowerTitle) ||
    lowerTitle.includes(mapping.title.toLowerCase()) ||
    mapping.aliases.some(alias => 
      alias.toLowerCase().includes(lowerTitle) || 
      lowerTitle.includes(alias.toLowerCase())
    )
  );
  
  if (partialMatch) {
    return partialMatch.folderName;
  }
  
  // Fallback: generate folder name from title
  return projectTitle.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
};

/**
 * Check if a project has assets available
 */
export const hasProjectAssets = async (projectTitle: string): Promise<boolean> => {
  const mappings = await initializeProjectMappings();
  const folderName = await getProjectFolderName(projectTitle);
  
  if (!folderName) return false;
  
  const projectMapping = mappings.mappings.find(mapping => mapping.folderName === folderName);
  return projectMapping?.hasAssets || mappings.availableFolders.includes(folderName);
};

/**
 * Get all available project folder names
 */
export const getAvailableProjects = async (): Promise<string[]> => {
  const mappings = await initializeProjectMappings();
  return mappings.availableFolders;
};

/**
 * Get all project mappings
 */
export const getAllProjectMappings = async (): Promise<ProjectMapping[]> => {
  const mappings = await initializeProjectMappings();
  return mappings.mappings;
};

/**
 * Get project mapping by folder name
 */
export const getProjectMappingByFolder = async (folderName: string): Promise<ProjectMapping | undefined> => {
  const mappings = await getAllProjectMappings();
  return mappings.find(mapping => mapping.folderName === folderName);
};

/**
 * Get project mapping by title
 */
export const getProjectMappingByTitle = async (title: string): Promise<ProjectMapping | undefined> => {
  const mappings = await getAllProjectMappings();
  return mappings.find(mapping => 
    mapping.title === title || 
    mapping.aliases.includes(title)
  );
};

/**
 * Search project mappings
 */
export const searchProjectMappings = async (query: string): Promise<ProjectMapping[]> => {
  const mappings = await getAllProjectMappings();
  const lowerQuery = query.toLowerCase();
  
  return mappings.filter(mapping => 
    mapping.title.toLowerCase().includes(lowerQuery) ||
    mapping.folderName.toLowerCase().includes(lowerQuery) ||
    mapping.aliases.some(alias => alias.toLowerCase().includes(lowerQuery))
  );
};

// Legacy exports for backward compatibility
export const PROJECT_FOLDER_MAP: Record<string, string> = {};

// Initialize legacy export
initializeProjectMappings().then(mappings => {
  // Clear existing mappings
  Object.keys(PROJECT_FOLDER_MAP).forEach(key => delete PROJECT_FOLDER_MAP[key]);
  
  // Populate legacy mapping
  mappings.mappings.forEach(mapping => {
    PROJECT_FOLDER_MAP[mapping.title] = mapping.folderName;
    mapping.aliases.forEach(alias => {
      PROJECT_FOLDER_MAP[alias] = mapping.folderName;
    });
  });
}).catch(error => {
  console.error('Failed to initialize project mappings for legacy compatibility:', error);
});

// Synchronous versions that use cached data (will be empty until data is loaded)
export const getProjectFolderNameSync = (projectTitle: string): string | null => {
  return PROJECT_FOLDER_MAP[projectTitle] || null;
};

export const hasProjectAssetsSync = (projectTitle: string): boolean => {
  const folderName = getProjectFolderNameSync(projectTitle);
  if (!folderName || !projectMappingsCache) return false;
  
  const projectMapping = projectMappingsCache.mappings.find(mapping => mapping.folderName === folderName);
  return projectMapping?.hasAssets || projectMappingsCache.availableFolders.includes(folderName);
};

export const getAvailableProjectsSync = (): string[] => {
  return projectMappingsCache?.availableFolders || [];
};