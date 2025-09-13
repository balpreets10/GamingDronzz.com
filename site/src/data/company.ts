/**
 * Company Data (New Implementation)
 * Uses the centralized data loader
 */

import { getCompanyData } from '../utils/dataLoader';
import type { CompanyData, TeamMember, CompanyStat, Skill } from '../types/staticData';

// Cache for company data
let companyCache: CompanyData | null = null;

/**
 * Initialize company data cache
 */
const initializeCompanyData = async (): Promise<CompanyData> => {
  if (!companyCache) {
    try {
      companyCache = await getCompanyData();
    } catch (error) {
      console.error('Failed to load company data:', error);
      // Fallback company data
      companyCache = {
        title: "About GamingDronzz",
        subtitle: "Crafting exceptional gaming experiences through innovative development",
        story: "Founded with a passion for creating immersive gaming worlds, GamingDronzz emerged from a team of dedicated developers who understood that great games require more than just code—they require vision, creativity, and technical excellence.",
        mission: "To empower game developers and studios with cutting-edge solutions, expert consultation, and innovative technology that transforms creative visions into compelling gaming realities.",
        stats: [],
        team: [],
        skills: []
      };
    }
  }
  return companyCache;
};

/**
 * Get complete company data
 */
export const getCompanyDataAsync = initializeCompanyData;

/**
 * Get team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const data = await initializeCompanyData();
  return data.team;
};

/**
 * Get company stats
 */
export const getCompanyStats = async (): Promise<CompanyStat[]> => {
  const data = await initializeCompanyData();
  return data.stats;
};

/**
 * Get company skills
 */
export const getCompanySkills = async (): Promise<Skill[]> => {
  const data = await initializeCompanyData();
  return data.skills;
};

/**
 * Get skills by category
 */
export const getSkillsByCategory = async (category: Skill['category']): Promise<Skill[]> => {
  const skills = await getCompanySkills();
  return skills.filter(skill => skill.category === category);
};

/**
 * Get team member by name
 */
export const getTeamMemberByName = async (name: string): Promise<TeamMember | undefined> => {
  const team = await getTeamMembers();
  return team.find(member => member.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get company story
 */
export const getCompanyStory = async (): Promise<string> => {
  const data = await initializeCompanyData();
  return data.story;
};

/**
 * Get company mission
 */
export const getCompanyMission = async (): Promise<string> => {
  const data = await initializeCompanyData();
  return data.mission;
};

/**
 * Get company vision
 */
export const getCompanyVision = async (): Promise<string | undefined> => {
  const data = await initializeCompanyData();
  return data.vision;
};

/**
 * Get company values
 */
export const getCompanyValues = async (): Promise<string[] | undefined> => {
  const data = await initializeCompanyData();
  return data.values;
};

// Legacy export for backward compatibility
export const companyData: CompanyData = {
  title: '',
  subtitle: '',
  story: '',
  mission: '',
  stats: [],
  team: [],
  skills: []
};

// Initialize company data and populate legacy export
initializeCompanyData().then(data => {
  Object.assign(companyData, data);
}).catch(error => {
  console.error('Failed to initialize company data for legacy compatibility:', error);
});

// Re-export types for convenience
export type { CompanyData, TeamMember, CompanyStat, Skill };