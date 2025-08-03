/**
 * CSS Manager - Handles loading and management of CSS files
 */
class CSSManager {
    constructor() {
        this.stylesheets = {};
        this.defaultVersion = '1.0.0';
        const version = Date.now();

        //Base
        // this.addStylesheet('variables', 'css/themes/variables-matrix.css', version, true);
        this.addStylesheet('variables', 'css/base/variables.css', version, true);
        this.addStylesheet('animations', 'css/base/animations.css', version, true);
        this.addStylesheet('preloader', 'css/base/preloader.css', version, true);
        this.addStylesheet('base', 'css/base/base.css', version, true);
        this.addStylesheet('modal-base', 'css/base/modal-base.css', version, true);

        this.addStylesheet('performance-optimizations', 'css/performance.css', version, true);
        this.addStylesheet('scroll-to-top', 'css/scrollToTop.css', version, true);

        // Sections
        this.addStylesheet('header', 'css/sections/header.css', version, true);
        this.addStylesheet('hero', 'css/sections/hero.css', version, true);
        this.addStylesheet('game', 'css/sections/game.css', version, true);
        this.addStylesheet('portfolio', 'css/sections/portfolio.css', version, true);
        this.addStylesheet('skills', 'css/sections/skills.css', version, true);
        this.addStylesheet('experience', 'css/sections/experience.css', version, true);
        this.addStylesheet('testimonials', 'css/sections/testimonials.css', version, true);
        this.addStylesheet('contact', 'css/sections/contact.css', version, true);

        //Component
        this.addStylesheet('project-modal', 'css/components/project-modal.css', version, true);
        this.addStylesheet('game-modal', 'css/components/game-modal.css', version, true);
        this.addStylesheet('skills-modal', 'css/components/skills-modal.css', version, true);
        this.addStylesheet('consent-footer', 'css/components/tracking-consent-footer.css', version, true);
        this.addStylesheet('responsive-images', 'css/components/responsive-images.css', version, true);
        this.addStylesheet('chat-widget', 'css/components/chat-widget.css', version, true);

    }

    /**
     * Add a stylesheet to the manager
     * @param {string} id - Unique identifier for the stylesheet
     * @param {string} path - Path to the CSS file
     * @param {string} [version] - Version number (defaults to 1.0.0)
     * @param {boolean} [preload=false] - Whether to preload the stylesheet
     */
    addStylesheet(id, path, version = null, preload = false) {
        this.stylesheets[id] = {
            path: path,
            version: version || this.defaultVersion,
            preload: preload,
            element: null,
            loaded: false
        };

        if (preload) {
            this.load(id);
        }
    }

    /**
     * Load a stylesheet into the DOM
     * @param {string} id - Stylesheet identifier
     * @returns {Promise}
     */
    load(id) {
        return new Promise((resolve, reject) => {
            if (!this.stylesheets[id]) {
                console.error(`Stylesheet ${id} not found`);
                reject(new Error(`Stylesheet ${id} not found`));
                return;
            }

            const sheet = this.stylesheets[id];

            // If already loaded, resolve immediately
            if (sheet.loaded && sheet.element) {
                resolve();
                return;
            }

            // Remove existing stylesheet if it exists
            this.remove(id);

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = this._getVersionedPath(sheet.path, sheet.version);
            link.id = `css-${id}`;

            link.onload = () => {
                sheet.loaded = true;
                console.log(`Stylesheet ${id} loaded successfully`);
                resolve();
            };

            link.onerror = () => {
                console.error(`Failed to load stylesheet ${id}`);
                reject(new Error(`Failed to load stylesheet ${id}`));
            };

            document.head.appendChild(link);
            sheet.element = link;
        });
    }

    /**
     * Remove a stylesheet from the DOM
     * @param {string} id - Stylesheet identifier
     */
    remove(id) {
        if (!this.stylesheets[id]) return;

        const sheet = this.stylesheets[id];
        if (sheet.element && sheet.element.parentNode) {
            sheet.element.parentNode.removeChild(sheet.element);
        }
        sheet.element = null;
        sheet.loaded = false;
    }

    /**
     * Update the version of a stylesheet and reload it
     * @param {string} id - Stylesheet identifier
     * @param {string} newVersion - New version number
     * @returns {Promise}
     */
    async updateVersion(id, newVersion) {
        if (!this.stylesheets[id]) {
            console.error(`Stylesheet ${id} not found`);
            return;
        }

        this.stylesheets[id].version = newVersion;
        this.stylesheets[id].loaded = false;

        // If the stylesheet is currently loaded, reload it with new version
        if (this.stylesheets[id].element) {
            await this.load(id);
        }
    }

    /**
     * Get the versioned path for a stylesheet
     * @private
     */
    _getVersionedPath(path, version) {
        // If the path already has a query string, append version as another param
        if (path.includes('?')) {
            return `${path}&v=${version}`;
        }
        return `${path}?v=${version}`;
    }

    /**
     * Load all stylesheets marked for preload
     * @returns {Promise}
     */
    async loadPreloaded() {
        const preloadPromises = Object.keys(this.stylesheets)
            .filter(id => this.stylesheets[id].preload)
            .map(id => this.load(id));

        await Promise.all(preloadPromises);
    }

    /**
     * Check if a stylesheet is loaded
     * @param {string} id - Stylesheet identifier
     * @returns {boolean}
     */
    isLoaded(id) {
        return this.stylesheets[id] && this.stylesheets[id].loaded;
    }

    /**
     * Get information about all managed stylesheets
     * @returns {Object}
     */
    getStylesheets() {
        return this.stylesheets;
    }

    /**
     * Load multiple stylesheets
     * @param {string[]} ids - Array of stylesheet identifiers
     * @returns {Promise}
     */
    async loadMultiple(ids) {
        const promises = ids.map(id => this.load(id));
        await Promise.all(promises);
    }
}

// Create a singleton instance
window.CSSManager = new CSSManager();

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CSSManager;
}