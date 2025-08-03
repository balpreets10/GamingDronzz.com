/**
 * Enhanced Section Manager - Handles dynamic loading of JS and section rendering
 * CSS loading is handled by CSSManager
 */
class SectionManager {
    constructor() {
        this.loadedSections = new Set();
        this.loadedJS = new Set();
        this.registeredSections = new Map();
        this.renderedSections = new Map();
        this.mainElement = null;
    }

    /**
     * Register a section class with its configuration
     * @param {string} id - Section identifier
     * @param {Object} config - Section configuration
     */
    registerSection(id, config) {
        this.registeredSections.set(id, {
            id,
            class: config.class, // Can be string class name or actual constructor
            container: config.container || 'main', // 'body', 'main', or custom selector
            order: config.order || 0,
            jsPath: config.jsPath || `js/sections/${id}.js`,
            loadJS: config.loadJS !== false, // Changed default to true
            enabled: config.enabled !== false
        });
    }

    /**
     * Register multiple sections at once
     * @param {Array} sections - Array of section configurations
     */
    registerSections(sections) {
        sections.forEach((section, index) => {
            this.registerSection(section.id, {
                ...section,
                order: section.order || index
            });
        });
    }

    /**
     * Resolve string class name to actual constructor
     * @param {string|Function} classRef - Class name string or constructor function
     * @returns {Function|null} Class constructor or null if not found
     */
    resolveClass(classRef) {
        if (typeof classRef === 'function') {
            return classRef; // Already a constructor
        }

        if (typeof classRef === 'string') {
            // Try to resolve from global window object
            if (window[classRef] && typeof window[classRef] === 'function') {
                return window[classRef];
            }

            console.error(`Class '${classRef}' not found in global scope`);
            return null;
        }

        console.error(`Invalid class reference:`, classRef);
        return null;
    }

    /**
     * Create main element if it doesn't exist
     */
    ensureMainElement() {
        if (!this.mainElement) {
            this.mainElement = document.querySelector('main.main');
            if (!this.mainElement) {
                this.mainElement = document.createElement('main');
                this.mainElement.className = 'main';
                document.body.appendChild(this.mainElement);
            }
        }
        return this.mainElement;
    }

    /**
     * Get container element for a section
     * @param {Object} sectionConfig - Section configuration
     * @returns {Element} Container element
     */
    getContainer(sectionConfig) {
        switch (sectionConfig.container) {
            case 'body':
                return document.body;
            case 'main':
                return this.ensureMainElement();
            default:
                const customContainer = document.querySelector(sectionConfig.container);
                return customContainer || this.ensureMainElement();
        }
    }

    /**
     * Insert element at correct position in container based on section order
     * @param {Element} element - Element to insert
     * @param {Element} container - Container element
     * @param {number} order - Section order
     * @param {string} sectionId - Section identifier
     */
    insertElementInOrder(element, container, order, sectionId) {
        // Special handling for header and footer
        if (sectionId === 'header' && container === document.body) {
            const mainEl = this.ensureMainElement();
            container.insertBefore(element, mainEl);
            return;
        }

        if (sectionId === 'footer' && container === document.body) {
            container.appendChild(element);
            return;
        }

        // For other sections, find the correct position based on order
        const existingSections = Array.from(this.renderedSections.values())
            .filter(s => s.config.container === (container === document.body ? 'body' : 'main'))
            .sort((a, b) => a.config.order - b.config.order);

        // Find the first section with higher order
        const nextSection = existingSections.find(s => s.config.order > order);

        if (nextSection && nextSection.element.parentNode === container) {
            container.insertBefore(element, nextSection.element);
        } else {
            container.appendChild(element);
        }
    }

    /**
     * Render a single section
     * @param {string} sectionId - Section identifier
     * @returns {Promise<Element>} Rendered section element
     */
    async renderSection(sectionId) {
        const config = this.registeredSections.get(sectionId);
        if (!config || !config.enabled) {
            console.warn(`Section '${sectionId}' not registered or disabled`);
            return null;
        }

        if (this.renderedSections.has(sectionId)) {
            console.log(`Section '${sectionId}' already rendered`);
            return this.renderedSections.get(sectionId).element;
        }

        try {
            // Load JS dependencies if needed
            await this.loadSectionDependencies(sectionId, config);

            // Resolve and instantiate section class
            const SectionClass = this.resolveClass(config.class);
            if (!SectionClass) {
                throw new Error(`Section class not found for '${sectionId}': ${config.class}`);
            }

            const sectionInstance = new SectionClass();
            let renderedElement;
            const renderResult = sectionInstance.render();

            // Check if render() returns a Promise
            if (renderResult && typeof renderResult.then === 'function') {
                console.log(`Section '${sectionId}' has async render method, awaiting...`);
                renderedElement = await renderResult;
            } else {
                renderedElement = renderResult;
            }

            if (!renderedElement) {
                throw new Error(`Section '${sectionId}' render() returned null`);
            }

            // Get container and insert element in correct order
            const container = this.getContainer(config);
            this.insertElementInOrder(renderedElement, container, config.order, sectionId);

            // Store references
            this.renderedSections.set(sectionId, {
                element: renderedElement,
                instance: sectionInstance,
                config: config
            });

            // Initialize section if it has initialization methods
            this.initializeSection(sectionInstance, sectionId);

            console.log(`Section '${sectionId}' rendered successfully at order ${config.order}`);
            return renderedElement;

        } catch (error) {
            console.error(`Failed to render section '${sectionId}':`, error);
            return null;
        }
    }

    /**
     * Initialize section-specific features
     * @param {Object} sectionInstance - Section instance
     * @param {string} sectionId - Section identifier
     */
    initializeSection(sectionInstance, sectionId) {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            if (sectionInstance.initialize) {
                sectionInstance.initialize();
            } else if (sectionInstance.initializeTyped) {
                sectionInstance.initializeTyped();
            }
        }, 100);
    }

    /**
     * Load section dependencies (only JS now, CSS handled by CSSManager)
     * @param {string} sectionId - Section identifier  
     * @param {Object} config - Section configuration
     */
    async loadSectionDependencies(sectionId, config) {
        if (config.loadJS) {
            await this.loadJS(config.jsPath);
        }
        this.loadedSections.add(sectionId);
    }

    /**
     * Render all registered sections in order - FIXED VERSION
     * Now renders sections sequentially to maintain proper DOM order
     * @returns {Promise<Array>} Array of rendered elements
     */
    async renderAllSections() {
        // Sort sections by order
        const sectionsToRender = Array.from(this.registeredSections.values())
            .filter(config => config.enabled)
            .sort((a, b) => a.order - b.order);

        console.log('Rendering sections in order:', sectionsToRender.map(s => `${s.id}(${s.order})`));

        const renderedElements = [];

        // Render sections sequentially to maintain order
        for (const config of sectionsToRender) {
            try {
                const element = await this.renderSection(config.id);
                renderedElements.push(element);
                console.log(`✓ Section '${config.id}' rendered in correct order`);
            } catch (error) {
                console.error(`✗ Failed to render section '${config.id}':`, error);
                renderedElements.push(null);
            }
        }

        console.log(`Successfully rendered ${renderedElements.filter(el => el).length}/${sectionsToRender.length} sections`);
        return renderedElements;
    }

    /**
     * Get a rendered section
     * @param {string} sectionId - Section identifier
     * @returns {Object|null} Section data or null
     */
    getSection(sectionId) {
        return this.renderedSections.get(sectionId) || null;
    }

    /**
     * Get all rendered sections
     * @returns {Map} Map of rendered sections
     */
    getAllSections() {
        return this.renderedSections;
    }

    /**
     * Remove a section from DOM
     * @param {string} sectionId - Section identifier
     */
    removeSection(sectionId) {
        const sectionData = this.renderedSections.get(sectionId);
        if (sectionData && sectionData.element && sectionData.element.parentNode) {
            sectionData.element.parentNode.removeChild(sectionData.element);
            this.renderedSections.delete(sectionId);
            console.log(`Section '${sectionId}' removed`);
        }
    }

    /**
     * Load JS file dynamically
     */
    loadJS(src) {
        if (this.loadedJS.has(src)) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loadedJS.add(src);
                console.log(`JS file loaded: ${src}`);
                resolve();
            };
            script.onerror = (error) => {
                console.error(`Failed to load JS file: ${src}`, error);
                reject(error);
            };
            document.body.appendChild(script);
        });
    }

    /**
     * Check if a section's JS is loaded
     * @param {string} sectionId - Section identifier
     * @returns {boolean}
     */
    isSectionLoaded(sectionId) {
        return this.loadedSections.has(sectionId);
    }

    /**
     * Wait for a class to be available in global scope
     * @param {string} className - Name of the class to wait for
     * @param {number} timeout - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Function>} Resolves with the class constructor
     */
    waitForClass(className, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkClass = () => {
                if (window[className] && typeof window[className] === 'function') {
                    resolve(window[className]);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for class '${className}'`));
                    return;
                }

                setTimeout(checkClass, 50);
            };

            checkClass();
        });
    }

    // Legacy methods for backwards compatibility
    async autoLoadSections() {
        const sections = [
            'header', 'hero', 'about', 'stats', 'skills',
            'experience', 'portfolio', 'services', 'testimonials', 'contact'
        ];

        const sectionsToLoad = sections.filter(section => {
            return document.querySelector(`#${section}`) ||
                document.querySelector(`.${section}`);
        });

        await this.loadSections(sectionsToLoad);
    }

    async loadSections(sections) {
        const promises = sections.map(section => {
            if (typeof section === 'string') {
                return this.loadSection(section);
            } else {
                return this.loadSection(section.name, section.options);
            }
        });

        await Promise.all(promises);
    }

    async loadSection(sectionName, options = {}) {
        if (this.loadedSections.has(sectionName)) return;

        const {
            jsPath = `assets/js/sections/${sectionName}.js`,
            loadJS = true
        } = options;

        try {
            if (loadJS) {
                await this.loadJS(jsPath);
            }

            this.loadedSections.add(sectionName);
            console.log(`Section '${sectionName}' loaded successfully`);
        } catch (error) {
            console.error(`Failed to load section '${sectionName}':`, error);
        }
    }
}

// Global instance
window.SectionManager = SectionManager;
window.sectionManager = new SectionManager();