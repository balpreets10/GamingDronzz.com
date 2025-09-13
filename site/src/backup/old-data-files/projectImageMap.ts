// utils/projectImageMap.ts
/**
 * Mapping between project titles and their folder names in public/assets/projects/
 */

export const PROJECT_FOLDER_MAP: Record<string, string> = {
  // Map project titles (as they appear in database) to folder names
  'African Bibliography': 'africanbib',
  'African Bib': 'africanbib',
  'AfricanBib': 'africanbib',
  
  'Bingo Game': 'bingo',
  'Bingo': 'bingo',
  
  'CCA Platform': 'cca',
  'CCA': 'cca',
  
  'DUI Tracker': 'dui',
  'DUI': 'dui',
  
  'F7 Fun': 'f7fun',
  'F7Fun': 'f7fun',
  
  'Hyike': 'hyike',
  'Hyike App': 'hyike',
  
  'Ludo Game': 'ludo',
  'Ludo': 'ludo',
  
  'Match Game': 'match',
  'Match': 'match',
  
  'Race for White House': 'raceforwhitehouse',
  'Race for the White House': 'raceforwhitehouse',
  'Political Race': 'raceforwhitehouse',
  
  'Resume Builder': 'resume',
  'Resume': 'resume',
  
  'RS Fun': 'rsfun',
  'RSFun': 'rsfun',
  
  'Rule of 3': 'ruleof3',
  'Rule of Three': 'ruleof3',
  
  'UNT Project': 'unt',
  'UNT': 'unt',
  
  'Website Portfolio': 'website',
  'Portfolio Website': 'website',
  'Website': 'website'
};

/**
 * Get the folder name for a project based on its title
 */
export const getProjectFolderName = (projectTitle: string): string | null => {
  // Try exact match first
  if (PROJECT_FOLDER_MAP[projectTitle]) {
    return PROJECT_FOLDER_MAP[projectTitle];
  }
  
  // Try case-insensitive match
  const lowerTitle = projectTitle.toLowerCase();
  for (const [key, value] of Object.entries(PROJECT_FOLDER_MAP)) {
    if (key.toLowerCase() === lowerTitle) {
      return value;
    }
  }
  
  // Try partial match
  for (const [key, value] of Object.entries(PROJECT_FOLDER_MAP)) {
    if (key.toLowerCase().includes(lowerTitle) || lowerTitle.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // Fallback: generate folder name from title
  return projectTitle.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
};

/**
 * Check if a project has assets available
 */
export const hasProjectAssets = (projectTitle: string): boolean => {
  const folderName = getProjectFolderName(projectTitle);
  const availableFolders = [
    'africanbib', 'bingo', 'cca', 'dui', 'f7fun', 
    'hyike', 'ludo', 'match', 'raceforwhitehouse', 
    'resume', 'rsfun', 'ruleof3', 'unt', 'website'
  ];
  
  return folderName ? availableFolders.includes(folderName) : false;
};

/**
 * Get all available project folder names
 */
export const getAvailableProjects = (): string[] => {
  return [
    'africanbib', 'bingo', 'cca', 'dui', 'f7fun',
    'hyike', 'ludo', 'match', 'raceforwhitehouse',
    'resume', 'rsfun', 'ruleof3', 'unt', 'website'
  ];
};