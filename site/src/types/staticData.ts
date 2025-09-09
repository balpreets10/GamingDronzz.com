/**
 * Centralized Static Data Types
 * Single source of truth for all static data type definitions
 */

// ==================== DESIGN SYSTEM ====================
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Typography {
  fontFamily: {
    primary: string;
    secondary: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface DesignSystem {
  breakpoints: Breakpoints;
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
}

// ==================== THEMES ====================
export interface Theme {
  id: string;
  name: string;
  icon: string;
  category: 'light' | 'dark' | 'colorful';
  colors: Colors;
}

export interface ThemeConfiguration {
  availableThemes: Theme[];
  defaultTheme: string;
  categoryMapping: {
    light: string[];
    dark: string[];
    colorful: string[];
  };
}

// ==================== COMPANY DATA ====================
export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  skills?: string[];
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface CompanyStat {
  number: string;
  label: string;
  description?: string;
}

export interface Skill {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'gamedev' | 'design' | 'tools';
  proficiency?: number;
}

export interface CompanyData {
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  vision?: string;
  values?: string[];
  stats: CompanyStat[];
  team: TeamMember[];
  skills: Skill[];
  founded?: string;
  location?: string;
}

// ==================== PROJECT DATA ====================
export interface ProjectMapping {
  title: string;
  folderName: string;
  aliases: string[];
  hasAssets: boolean;
}

export interface ProjectMappings {
  mappings: ProjectMapping[];
  availableFolders: string[];
}

// ==================== NAVIGATION DATA ====================
export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon: string;
  position?: number;
  disabled?: boolean;
  external?: boolean;
  ariaLabel?: string;
  children?: NavigationItem[];
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export interface NavigationData {
  mainNavigation: NavigationItem[];
  dashboardNavigation: NavigationItem[];
  footerNavigation: NavigationSection[];
  socialLinks: NavigationItem[];
}

// ==================== SEO DATA ====================
export interface SEOConfig {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultImage: string;
  siteUrl: string;
  twitterHandle: string;
  organizationSchema: {
    name: string;
    url: string;
    logo: string;
    description: string;
    contactPoint: {
      telephone: string;
      contactType: string;
    };
    sameAs: string[];
  };
  sectionSEO: {
    [key: string]: {
      title: string;
      description: string;
      keywords: string[];
      image?: string;
    };
  };
}

// ==================== SERVICES DATA ====================
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  pricing?: {
    type: 'fixed' | 'hourly' | 'project';
    min?: number;
    max?: number;
    currency: string;
  };
  features: string[];
  deliverables?: string[];
  timeline?: string;
}

export interface ServicesData {
  categories: string[];
  services: Service[];
}

// ==================== MAIN DATA STRUCTURE ====================
export interface StaticData {
  designSystem: DesignSystem;
  themes: ThemeConfiguration;
  company: CompanyData;
  projects: ProjectMappings;
  navigation: NavigationData;
  seo: SEOConfig;
  services: ServicesData;
}

// ==================== DATA VALIDATION ====================
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataLoader {
  loadData(): Promise<StaticData>;
  validateData(data: Partial<StaticData>): ValidationResult;
  getSection<K extends keyof StaticData>(section: K): Promise<StaticData[K]>;
}

// ==================== UTILITY TYPES ====================
export type DataSection = keyof StaticData;
export type ThemeCategory = Theme['category'];
export type SkillCategory = Skill['category'];
export type ServiceCategory = Service['category'];

// Type guards for runtime validation
export const isTheme = (obj: any): obj is Theme => {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.icon === 'string';
};

export const isNavigationItem = (obj: any): obj is NavigationItem => {
  return obj && typeof obj.id === 'string' && typeof obj.label === 'string' && typeof obj.icon === 'string';
};

export const isTeamMember = (obj: any): obj is TeamMember => {
  return obj && typeof obj.name === 'string' && typeof obj.role === 'string' && typeof obj.bio === 'string';
};