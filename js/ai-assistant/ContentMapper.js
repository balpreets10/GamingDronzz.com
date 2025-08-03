/**
 * Enhanced Content Mapper - Multi-Action Navigation Support
 * Handles complex queries with sequential actions
 */
class ContentMapper {
    constructor() {
        this.contentMap = null;
        this.isReady = false;
        this.sectionReadyPromises = new Map();
    }

    async init() {
        try {
            // Load content map from JSON file
            const response = await fetch('data/content-map.json');
            if (!response.ok) {
                throw new Error(`Failed to load content-map.json: ${response.status}`);
            }

            const data = await response.json();

            // Flatten the nested structure for easier processing
            this.contentMap = {
                ...data.sections,
                ...data.project_categories,
                ...data.specific_projects,
                ...data.project_actions,
                ...data.company_experience,
                ...data.skills_detailed,
                ...data.technology_focus,
                ...data.achievement_focus,
                ...data.complex_queries
            };

            // Store response templates
            this.responses = data.responses;
            this.fallbackSuggestions = data.fallback_suggestions;

            this.isReady = true;
            // Initialize section ready state tracking
            this.initializeSectionTracking();

            console.log('ContentMapper initialized with JSON data:', Object.keys(this.contentMap).length, 'intents loaded');
        } catch (error) {
            console.error('Error loading content-map.json:', error);
            this.loadFallbackContentMap();
        }
    }

    initializeSectionTracking() {
        // Monitor section data loading states
        const checkSectionReady = (sectionId) => {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    const section = document.querySelector(`#${sectionId}`);
                    if (section) {
                        // Check if section has loaded data (not showing loading state)
                        const hasLoading = section.querySelector('.loading-spinner, .projects-loading, .skills-loading, .experience-loading');
                        if (!hasLoading) {
                            clearInterval(checkInterval);
                            resolve(true);
                        }
                    }
                }, 100);

                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve(false);
                }, 10000);
            });
        };

        // Pre-create promises for common sections
        ['portfolio', 'skills', 'experience'].forEach(sectionId => {
            this.sectionReadyPromises.set(sectionId, checkSectionReady(sectionId));
        });
    }

    async waitForSectionReady(sectionId) {
        if (this.sectionReadyPromises.has(sectionId)) {
            return await this.sectionReadyPromises.get(sectionId);
        }

        // Create new promise for this section
        const promise = new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const section = document.querySelector(`#${sectionId}`);
                if (section) {
                    const hasLoading = section.querySelector('.loading-spinner, .projects-loading, .skills-loading, .experience-loading');
                    if (!hasLoading) {
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(false);
            }, 5000);
        });

        this.sectionReadyPromises.set(sectionId, promise);
        return await promise;
    }


    loadFallbackContentMap() {
        // Fallback to basic hardcoded map if JSON fails
        this.contentMap = {
            portfolio: {
                keywords: ["projects", "portfolio", "work", "games", "apps"],
                response: "Let me show you my portfolio!",
                actions: [{ type: "scroll_to_section", target: "portfolio" }]
            },
            skills: {
                keywords: ["skills", "abilities", "technologies", "expertise"],
                response: "Here are my technical skills!",
                actions: [{ type: "scroll_to_section", target: "skills" }]
            },
            experience: {
                keywords: ["experience", "work history", "career", "background"],
                response: "Check out my professional experience!",
                actions: [{ type: "scroll_to_section", target: "experience" }]
            },
            contact: {
                keywords: ["contact", "hire", "email", "reach out"],
                response: "Let's get in touch!",
                actions: [{ type: "scroll_to_section", target: "contact" }]
            }
        };
        this.isReady = true;
        console.log('ContentMapper initialized with fallback data');
    }

    processQuery(query) {
        if (!this.isReady) {
            return {
                response: "I'm still loading. Please wait a moment.",
                actions: []
            };
        }

        const normalizedQuery = query.toLowerCase().trim();

        // Direct intent matching first
        for (const [intentKey, intent] of Object.entries(this.contentMap)) {
            if (intent.keywords && intent.keywords.some(keyword =>
                normalizedQuery.includes(keyword.toLowerCase()))) {
                return {
                    response: intent.response,
                    actions: intent.actions,
                    intent: intentKey
                };
            }
        }

        // Fallback response
        return {
            response: this.getFallbackResponse(),
            actions: [],
            intent: "fallback"
        };
    }

    getFallbackResponse() {
        if (this.fallbackSuggestions) {
            return this.fallbackSuggestions.join('\n');
        }
        return "I can help you navigate this portfolio! Try asking about projects, skills, or experience.";
    }

    async executeAction(intent) {
        if (!intent.actions || intent.actions.length === 0) {
            return false;
        }

        console.log('Executing action chain:', intent.actions);

        try {
            for (let i = 0; i < intent.actions.length; i++) {
                const action = intent.actions[i];

                // Apply delay if specified
                if (action.delay && i > 0) {
                    await this.delay(action.delay);
                }

                console.log('Executing action:', action.type, action);
                const success = await this.executeIndividualAction(action);
                if (!success) {
                    console.warn('Action failed:', action);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error executing action chain:', error);
            return false;
        }
    }

    async executeIndividualAction(action) {
        console.log('Executing action:', action.type, action);

        switch (action.type) {
            case 'scroll_to_section':
                return this.scrollToSection(action.target);

            case 'filter_portfolio':
                await this.waitForSectionReady('portfolio');
                return this.filterPortfolioFixed(action.category);

            case 'open_random_project':
                await this.waitForSectionReady('portfolio');
                return this.openRandomProjectFixed(action.category);

            case 'open_skills_modal':
                await this.waitForSectionReady('skills');
                return this.openSkillsModalFixed(action.categoryId);

            case 'open_specific_project':
                await this.waitForSectionReady('portfolio');
                return this.openSpecificProjectFixed(action.projectId);

            case 'highlight_experience':
                await this.waitForSectionReady('experience');
                return this.highlightExperienceFixed(action.companyId);

            default:
                console.warn('Unknown action type:', action.type);
                return false;
        }
    }

    scrollToSection(sectionId) {
        try {
            if (window.navigationManager) {
                const section = document.querySelector(`#${sectionId}`);
                if (section) {
                    window.navigationManager.scrollToSection(section);
                    return true;
                }
            }

            // Fallback
            const section = document.querySelector(`#${sectionId}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error scrolling to section:', error);
            return false;
        }
    }

    filterPortfolio(category) {
        try {
            const categoryLower = category.toLowerCase();
            console.log('Filtering portfolio for category:', categoryLower);

            // Find filter button with better matching
            const portfolioSection = document.querySelector('#portfolio');
            if (!portfolioSection) {
                console.error('Portfolio section not found');
                return false;
            }

            // Try multiple selectors for filter buttons
            let filterButton =
                portfolioSection.querySelector(`[data-category="${category}"]`) ||
                portfolioSection.querySelector(`[data-category="${categoryLower}"]`) ||
                Array.from(portfolioSection.querySelectorAll('[data-category]')).find(btn =>
                    btn.getAttribute('data-category').toLowerCase() === categoryLower
                );

            if (filterButton) {
                console.log('Found filter button, clicking...');
                filterButton.click();
                return true;
            }

            // Fallback: Direct filtering
            console.log('Filter button not found, doing direct filtering...');
            const cards = portfolioSection.querySelectorAll('.project-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const categories = (card.getAttribute('data-categories') || '').toLowerCase();
                const shouldShow = categories.includes(categoryLower);

                if (shouldShow) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease forwards';
                    visibleCount++;
                } else {
                    card.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });

            console.log(`Direct filtering: ${visibleCount} cards visible for category: ${category}`);
            return visibleCount > 0;

        } catch (error) {
            console.error('Error in filterPortfolioFixed:', error);
            return false;
        }
    }

    openRandomProject(category) {
        try {
            const categoryLower = category.toLowerCase();
            const portfolioSection = document.querySelector('#portfolio');
            if (!portfolioSection) return false;

            const categoryCards = Array.from(portfolioSection.querySelectorAll('.project-card'))
                .filter(card => {
                    const categories = (card.getAttribute('data-categories') || '').toLowerCase();
                    const isVisible = card.style.display !== 'none';
                    return categories.includes(categoryLower) && isVisible;
                });

            if (categoryCards.length === 0) {
                console.warn(`No visible projects found for category: ${category}`);
                return false;
            }

            const randomCard = categoryCards[Math.floor(Math.random() * categoryCards.length)];
            randomCard.click();
            console.log(`Random ${category} project opened`);
            return true;

        } catch (error) {
            console.error('Error in openRandomProjectFixed:', error);
            return false;
        }
    }

    openSkillsModal(categoryId) {
        try {
            console.log('Opening skills modal for category:', categoryId);

            if (window.SkillsModal) {
                const skillsModal = new window.SkillsModal();
                skillsModal.showSkillModal(categoryId);
                return true;
            }

            // Fallback: Try clicking skill category card
            const skillsSection = document.querySelector('#skills');
            if (skillsSection) {
                const categoryCard =
                    skillsSection.querySelector(`[data-category-id="${categoryId}"]`) ||
                    skillsSection.querySelectorAll('.skill-category')[categoryId - 1];

                if (categoryCard) {
                    categoryCard.click();
                    return true;
                }
            }

            console.warn('SkillsModal not available and no category card found');
            return false;
        } catch (error) {
            console.error('Error in openSkillsModalFixed:', error);
            return false;
        }
    }

    openSpecificProject(projectId) {
        try {
            const portfolioSection = document.querySelector('#portfolio');
            if (!portfolioSection) return false;

            // Try multiple approaches to find the project
            let projectCard =
                // Try data-project-id first
                portfolioSection.querySelector(`[data-project-id="${projectId}"]`) ||
                // Try nth-child as fallback
                portfolioSection.querySelector(`.project-card:nth-child(${projectId})`) ||
                // Try index-based selection
                portfolioSection.querySelectorAll('.project-card')[projectId - 1];

            if (projectCard) {
                console.log('Found project card, clicking...');
                projectCard.click();
                return true;
            }

            console.warn(`Project not found with ID: ${projectId}`);
            return false;
        } catch (error) {
            console.error('Error in openSpecificProjectFixed:', error);
            return false;
        }
    }

    highlightExperience(companyId) {
        try {
            const experienceSection = document.querySelector('#experience');
            if (!experienceSection) return false;

            // Try both data-company-id and data-experience-id
            let experienceItem =
                experienceSection.querySelector(`[data-company-id="${companyId}"]`) ||
                experienceSection.querySelector(`[data-experience-id="${companyId}"]`) ||
                experienceSection.querySelectorAll('.experience-flip-container')[companyId - 1];

            if (experienceItem) {
                experienceItem.classList.add('highlighted');
                experienceItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

                setTimeout(() => {
                    experienceItem.classList.remove('highlighted');
                }, 3000);

                console.log(`Experience highlighted: ${companyId}`);
                return true;
            }

            console.warn(`Experience not found: ${companyId}`);
            return false;
        } catch (error) {
            console.error('Error in highlightExperienceFixed:', error);
            return false;
        }
    }

    showUnityMastery() {
        try {
            const skillsSection = document.querySelector('#skills');
            if (!skillsSection) return false;

            // Look for Unity-specific section or create highlight
            const unitySection = skillsSection.querySelector('.unity-mastery') ||
                skillsSection.querySelector('[data-skill="unity"]');

            if (unitySection) {
                unitySection.classList.add('highlighted');
                unitySection.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Remove highlight after 3 seconds
                setTimeout(() => {
                    unitySection.classList.remove('highlighted');
                }, 3000);

                console.log('Unity mastery section highlighted');
                return true;
            }

            console.warn('Unity mastery section not found');
            return false;
        } catch (error) {
            console.error('Error showing Unity mastery:', error);
            return false;
        }
    }

    highlightAchievementProjects(achievement) {
        try {
            const portfolioSection = document.querySelector('#portfolio');
            if (!portfolioSection) return false;

            const achievementCards = Array.from(portfolioSection.querySelectorAll('.project-card'))
                .filter(card => {
                    const achievements = card.getAttribute('data-achievements') || '';
                    return achievements.toLowerCase().includes(achievement.toLowerCase());
                });

            if (achievementCards.length === 0) {
                console.warn(`No projects found with achievement: ${achievement}`);
                return false;
            }

            achievementCards.forEach(card => {
                card.classList.add('highlighted');
                card.style.display = 'block';
            });

            // Remove highlights after 3 seconds
            setTimeout(() => {
                achievementCards.forEach(card => {
                    card.classList.remove('highlighted');
                });
            }, 3000);

            console.log(`Achievement projects highlighted: ${achievement}`);
            return true;
        } catch (error) {
            console.error('Error highlighting achievement projects:', error);
            return false;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility method to add new intents dynamically
    addIntent(key, intentData) {
        if (this.contentMap) {
            this.contentMap[key] = intentData;
        }
    }

    // Get all available intents for debugging
    getAvailableIntents() {
        return Object.keys(this.contentMap || {});
    }
}

// Global instance
window.ContentMapper = ContentMapper;