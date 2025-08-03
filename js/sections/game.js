/**
 * Enhanced Game Section - Sleek Multi-Engine Game Portfolio
 * Showcases interactive resume experiences across different game engines
 */
class GameSection {
    constructor() {
        this.config = null;
        this.gameContainer = null;
        this.isInitialized = false;
        this.isDataLoaded = false;
        this.dataPath = 'data/game-data.json';

        // Bind methods
        this.handleEngineClick = this.handleEngineClick.bind(this);
        this.enableEngine = this.enableEngine.bind(this);
        this.disableEngine = this.disableEngine.bind(this);
        this.loadGameData = this.loadGameData.bind(this);
    }

    async loadGameData(dataPath = null) {
        const path = dataPath || this.dataPath;
        try {
            console.log(`Loading game data from: ${path}`);
            const response = await fetch(path);

            if (!response.ok) {
                throw new Error(`Failed to load game data: ${response.status}`);
            }

            const data = await response.json();
            this.config = data;
            this.isDataLoaded = true;
            console.log('Game data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);

            // Fallback to minimal config
            this.config = {
                title: "Interactive Resume Experience",
                subtitle: "Game configuration could not be loaded. Please check the data file.",
                features: ["Configuration Error"],
                engines: []
            };
            this.isDataLoaded = true;
            return false;
        }
    }

    async loadDataAndUpdate() {
        const success = await this.loadGameData();

        if (success || this.isDataLoaded) {
            const grid = document.getElementById('enginesGrid');
            if (grid) {
                this.renderEnginesGrid(grid);
                setTimeout(() => {
                    this.setupEventHandlers();
                }, 100);
            }
            this.updateSectionHeader();
        } else {
            const grid = document.getElementById('enginesGrid');
            if (grid) {
                grid.innerHTML = `
                    <div class="engines-error">
                        <div class="error-content">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load game engines. Please try refreshing the page.</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    renderEnginesGrid(container) {
        container.innerHTML = '';

        if (!this.config?.engines || this.config.engines.length === 0) {
            container.innerHTML = `
                <div class="engines-empty">
                    <div class="empty-content">
                        <i class="fas fa-gamepad"></i>
                        <p>No game engines available at the moment.</p>
                    </div>
                </div>
            `;
            return;
        }

        this.config.engines.forEach((engine, index) => {
            const engineButton = this.createEngineButton(engine, index);
            container.appendChild(engineButton);
        });
    }

    updateSectionHeader() {
        const titleElement = document.querySelector('#game .section-title');
        const subtitleElement = document.querySelector('#game .section-subtitle');

        if (titleElement && this.config?.title) {
            titleElement.innerHTML = `
                <i class="fas fa-gamepad title-icon"></i>
                ${this.config.title}
            `;
        }

        if (subtitleElement && this.config?.subtitle) {
            subtitleElement.textContent = this.config.subtitle;
        }

        const featuresContainer = document.querySelector('#game .game-features');
        if (featuresContainer && this.config?.features) {
            featuresContainer.innerHTML = '';
            // this.config.features.forEach((feature, index) => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag';
            tag.textContent = "Ready";
            tag.setAttribute('data-aos', 'zoom-in');
            tag.setAttribute('data-aos-delay', 50 + (index * 50));
            featuresContainer.appendChild(tag);
            // });
        }


    }

    async initialize(dataPath = null) {
        console.log('Multi-Engine Game section initializing...');
        await this.loadDataAndUpdate();
        this.isInitialized = true;
        this.setupKeyboardShortcuts();
        console.log('Multi-Engine Game section initialized');
    }

    createSectionHeader() {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.setAttribute('data-aos', 'fade-down');

        const title = this.isDataLoaded ? (this.config?.title || 'Interactive Resume Experience') : 'Interactive Resume Experience';
        const subtitle = this.isDataLoaded ? (this.config?.subtitle || 'Loading game configuration...') : 'Loading game configuration...';

        header.innerHTML = `
            <div class="title-container">
                <h2 class="section-title">
                    <i class="fas fa-gamepad title-icon"></i>
                    ${title}
                </h2>
                <div class="scan-line"></div>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${subtitle}</p>
        `;

        return header;
    }

    createGameInfoStrip() {
        const infoStrip = document.createElement('div');
        infoStrip.className = 'game-info-strip';
        infoStrip.setAttribute('data-aos', 'fade-up');
        infoStrip.setAttribute('data-aos-delay', '100');

        const content = document.createElement('div');
        content.className = 'game-info-content';

        const featuresContainer = document.createElement('div');
        featuresContainer.className = 'game-features';

        if (!this.isDataLoaded) {
            const loadingTag = document.createElement('span');
            loadingTag.className = 'feature-tag';
            loadingTag.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            featuresContainer.appendChild(loadingTag);
        } else {
            const features = this.config?.features || ['No features available'];
            features.forEach((feature, index) => {
                const tag = document.createElement('span');
                tag.className = 'feature-tag';
                tag.textContent = feature;
                tag.setAttribute('data-aos', 'zoom-in');
                tag.setAttribute('data-aos-delay', 100 + (index * 50));
                featuresContainer.appendChild(tag);
            });
        }

        content.appendChild(featuresContainer);
        infoStrip.appendChild(content);
        return infoStrip;
    }

    createEngineButton(engine, index) {
        const button = document.createElement('div');
        button.className = `engine-button ${engine.status}`;
        button.id = `engine-${engine.id}`;
        button.setAttribute('data-engine', engine.id);
        button.setAttribute('data-status', engine.status);
        button.setAttribute('data-aos', 'zoom-in');
        button.setAttribute('data-aos-delay', 200 + (index * 100));

        // Status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';

        let statusText = '';
        let statusIcon = '';
        switch (engine.status) {
            case 'available':
                statusText = 'Ready to Play';
                statusIcon = 'fas fa-play-circle';
                break;
            case 'coming-soon':
                statusText = 'Coming Soon';
                statusIcon = 'fas fa-clock';
                break;
            case 'disabled':
                statusText = 'Maintenance';
                statusIcon = 'fas fa-tools';
                break;
        }

        statusIndicator.innerHTML = `
            <i class="${statusIcon}"></i>
            <span>${statusText}</span>
        `;

        // Engine content - simplified structure
        const content = document.createElement('div');
        content.className = 'engine-content';

        const header = document.createElement('div');
        header.className = 'engine-header';

        const logo = document.createElement('div');
        logo.className = 'engine-logo';
        logo.innerHTML = `<i class="${engine.logo}"></i>`;

        const info = document.createElement('div');
        info.className = 'engine-info';

        const name = document.createElement('h3');
        name.className = 'engine-name';
        name.textContent = engine.name;

        // const description = document.createElement('p');
        // description.className = 'engine-description';
        // description.textContent = engine.description;

        info.appendChild(name);
        // info.appendChild(description);
        header.appendChild(logo);
        header.appendChild(info);

        // Action area
        const actionArea = document.createElement('div');
        actionArea.className = 'engine-action';

        const playButton = document.createElement('button');
        playButton.className = 'play-button';
        playButton.innerHTML = `
            <i class="fas fa-external-link-alt"></i>
            <span>Launch Game</span>
        `;

        actionArea.appendChild(playButton);

        // Assemble content - only header and action
        content.appendChild(header);
        content.appendChild(actionArea);

        // Effects
        const glowEffect = document.createElement('div');
        glowEffect.className = 'engine-glow';

        const particles = document.createElement('div');
        particles.className = 'engine-particles';
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particles.appendChild(particle);
        }

        button.appendChild(statusIndicator);
        button.appendChild(content);
        button.appendChild(glowEffect);
        button.appendChild(particles);

        // Set custom properties for engine colors
        button.style.setProperty('--engine-color', engine.color);
        button.style.setProperty('--engine-glow', engine.glowColor);

        button.addEventListener('click', () => this.handleEngineClick(engine));
        return button;
    }

    createGameContainer() {
        const container = document.createElement('div');
        container.className = 'games-showcase-container';
        container.setAttribute('data-aos', 'fade-up');
        container.setAttribute('data-aos-delay', '200');

        const screenContainer = document.createElement('div');
        screenContainer.className = 'games-screen';

        const screenHeader = document.createElement('div');
        screenHeader.className = 'screen-header';
        screenHeader.innerHTML = `
            <div class="screen-title">
                <i class="fas fa-desktop"></i>
                <span>Select Game Engine</span>
            </div>
            <div class="screen-status">
                <div class="status-dot"></div>
                <span>Systems Online</span>
            </div>
        `;

        const enginesGrid = document.createElement('div');
        enginesGrid.className = 'engines-grid';
        enginesGrid.id = 'enginesGrid';

        if (!this.isDataLoaded) {
            const loadingMessage = document.createElement('div');
            loadingMessage.className = 'loading-message';
            loadingMessage.innerHTML = `
                <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading game engines...</p>
                </div>
            `;
            enginesGrid.appendChild(loadingMessage);
        } else {
            this.renderEnginesGrid(enginesGrid);
        }

        screenContainer.appendChild(screenHeader);
        screenContainer.appendChild(enginesGrid);
        container.appendChild(screenContainer);
        return container;
    }

    render() {
        const section = document.createElement('section');
        section.id = 'game';
        section.className = 'game-section section';

        const container = document.createElement('div');
        container.className = 'container';

        const row = document.createElement('div');
        row.className = 'row';

        const col = document.createElement('div');
        col.className = 'col-12';

        const header = this.createSectionHeader();
        const infoStrip = this.createGameInfoStrip();
        const gameContainer = this.createGameContainer();

        col.appendChild(header);
        col.appendChild(infoStrip);
        col.appendChild(gameContainer);

        row.appendChild(col);
        container.appendChild(row);
        section.appendChild(container);

        this.gameContainer = gameContainer;
        return section;
    }

    handleEngineClick(engine) {
        console.log(`Engine clicked: ${engine.name}`);
        const button = document.getElementById(`engine-${engine.id}`);

        button.style.transform = 'scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);

        switch (engine.status) {
            case 'available':
                this.launchGame(engine);
                break;
            case 'coming-soon':
                this.showComingSoonModal(engine);
                break;
            case 'disabled':
                this.showMaintenanceModal(engine);
                break;
        }
    }

    launchGame(engine) {
        console.log(`Launching ${engine.name} game...`);
        const button = document.getElementById(`engine-${engine.id}`);
        button.classList.add('launching');

        setTimeout(() => {
            window.open(engine.gameUrl, '_blank', 'noopener,noreferrer');
            button.classList.remove('launching');
        }, 800);
    }

    showComingSoonModal(engine) {
        console.log(`${engine.name} coming soon...`);
        alert(`${engine.name} experience is coming soon! Stay tuned for updates.`);
    }

    showMaintenanceModal(engine) {
        console.log(`${engine.name} under maintenance...`);
        alert(`${engine.name} is currently under maintenance. Please try again later.`);
    }

    // Engine control methods
    enableEngine(engineId) {
        const engine = this.config?.engines?.find(e => e.id === engineId);
        if (engine) {
            engine.status = 'available';
            this.updateEngineButton(engineId);
            console.log(`${engine.name} enabled`);
        }
    }

    disableEngine(engineId) {
        const engine = this.config?.engines?.find(e => e.id === engineId);
        if (engine) {
            engine.status = 'disabled';
            this.updateEngineButton(engineId);
            console.log(`${engine.name} disabled`);
        }
    }

    setEngineComingSoon(engineId) {
        const engine = this.config?.engines?.find(e => e.id === engineId);
        if (engine) {
            engine.status = 'coming-soon';
            this.updateEngineButton(engineId);
            console.log(`${engine.name} set to coming soon`);
        }
    }

    updateEngineButton(engineId) {
        const button = document.getElementById(`engine-${engineId}`);
        const engine = this.config?.engines?.find(e => e.id === engineId);

        if (button && engine) {
            button.className = `engine-button ${engine.status}`;
            button.setAttribute('data-status', engine.status);

            const statusIndicator = button.querySelector('.status-indicator');
            let statusText = '';
            let statusIcon = '';

            switch (engine.status) {
                case 'available':
                    statusText = 'Ready to Play';
                    statusIcon = 'fas fa-play-circle';
                    break;
                case 'coming-soon':
                    statusText = 'Coming Soon';
                    statusIcon = 'fas fa-clock';
                    break;
                case 'disabled':
                    statusText = 'Maintenance';
                    statusIcon = 'fas fa-tools';
                    break;
            }

            statusIndicator.innerHTML = `
                <i class="${statusIcon}"></i>
                <span>${statusText}</span>
            `;
        }
    }

    updateEngineUrl(engineId, newUrl) {
        const engine = this.config?.engines?.find(e => e.id === engineId);
        if (engine) {
            engine.gameUrl = newUrl;
            console.log(`${engine.name} URL updated to: ${newUrl}`);
        }
    }

    setupEventHandlers() {
        window.addEventListener('resize', () => {
            // Handle responsive adjustments if needed
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            const gameSection = document.getElementById('game');
            if (!gameSection || !this.isElementInViewport(gameSection)) return;

            if (event.key >= '1' && event.key <= '4') {
                event.preventDefault();
                const engineIndex = parseInt(event.key) - 1;
                if (this.config?.engines && this.config.engines[engineIndex]) {
                    this.handleEngineClick(this.config.engines[engineIndex]);
                }
            }
        });
    }

    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Configuration methods
    setDataPath(path) {
        this.dataPath = path;
        console.log(`Game data path set to: ${path}`);
    }

    async reloadGameData() {
        if (!this.isInitialized) {
            console.warn('Game section not initialized');
            return false;
        }

        const success = await this.loadGameData();
        if (success && this.gameContainer) {
            this.refreshEnginesGrid();
            this.updateSectionHeader();
        }
        return success;
    }

    refreshEnginesGrid() {
        const enginesGrid = document.getElementById('enginesGrid');
        if (enginesGrid && this.config?.engines) {
            this.renderEnginesGrid(enginesGrid);
        }
    }

    async updateGameData(newData) {
        this.config = { ...this.config, ...newData };
        this.isDataLoaded = true;
        const existingSection = document.getElementById('game');
        if (existingSection) {
            const newSection = this.render();
            existingSection.parentNode.replaceChild(newSection, existingSection);
            await this.initialize();
        }
    }

    async refreshData() {
        this.isDataLoaded = false;
        this.config = null;
        await this.loadDataAndUpdate();
    }

    // Utility methods
    getEngineStatus(engineId) {
        const engine = this.config?.engines?.find(e => e.id === engineId);
        return engine ? engine.status : null;
    }

    getAllEngines() {
        return this.config?.engines ? [...this.config.engines] : [];
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Game section config updated');
    }

    cleanup() {
        this.isInitialized = false;
        this.isDataLoaded = false;
        console.log('Multi-Engine Game section cleaned up');
    }
}

// Global methods
window.GameSection = GameSection;

window.enableGameEngine = function (engineId) {
    if (window.gameSection && window.gameSection.enableEngine) {
        window.gameSection.enableEngine(engineId);
    }
};

window.disableGameEngine = function (engineId) {
    if (window.gameSection && window.gameSection.disableEngine) {
        window.gameSection.disableEngine(engineId);
    }
};

window.setGameEngineComingSoon = function (engineId) {
    if (window.gameSection && window.gameSection.setEngineComingSoon) {
        window.gameSection.setEngineComingSoon(engineId);
    }
};

window.updateGameEngineUrl = function (engineId, newUrl) {
    if (window.gameSection && window.gameSection.updateEngineUrl) {
        window.gameSection.updateEngineUrl(engineId, newUrl);
    }
};