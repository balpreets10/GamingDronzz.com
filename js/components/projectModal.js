/**
 * Enhanced Project Modal Handler - FIXED VERSION
 * Handles displaying project details with working image carousel
 */

class ProjectModal {
    constructor() {
        this.currentImageIndex = 0;
        this.images = [];
        this.modalId = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.init();
    }

    init() {
        // Ensure ModalManager is available
        if (!window.modalManager) {
            console.error('ModalManager not found. Please ensure ModalManager.js is loaded.');
            return;
        }
        console.log('ProjectModal initialized');
    }

    /**
     * Open project modal with data
     * @param {Object} projectData - Project information
     */
    open(projectData) {
        if (!projectData) {
            console.error('No project data provided');
            return;
        }

        // Reset state
        this.currentImageIndex = 0;
        this.images = projectData.images || [];

        // Generate modal content
        const content = this.generateModalContent(projectData);

        // Create modal using ModalManager
        this.modalId = window.modalManager.createModal({
            title: `<i class="fas fa-rocket"></i> ${projectData.title}`,
            content: content,
            size: 'xl',
            className: 'project-modal',
            onShow: (id) => this.onModalShow(id, projectData),
            onHide: (id) => this.onModalHide(id)
        });
    }

    /**
     * Generate complete modal content HTML
     * @param {Object} data - Project data
     * @returns {string} HTML content
     */
    generateModalContent(data) {
        return `
            <div class="project-modal-content">
                <!-- Hero Section -->
                ${this.generateHeroSection(data)}
                
                <!-- Main Content Grid -->
                <div class="project-content-grid">
                    <!-- Left Column -->
                    <div class="project-left-column">
                        ${this.generateImageGallery(data)}
                        ${this.generateVideoSection(data)}
                        ${this.generateLinksSection(data)}
                        ${this.generateStatsSection(data)}
                        ${this.generateTechnologiesSection(data)}
                    </div>
                    
                    <!-- Right Column -->
                    <div class="project-right-column">
                        ${this.generateOverviewSection(data)}
                        ${this.generateFeaturesSection(data)}
                        ${this.generateChallengesSection(data)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate hero section with basic info
     */
    generateHeroSection(data) {
        const statusClass = data.status?.toLowerCase().replace(/\s+/g, '-') || 'unknown';
        const categories = Array.isArray(data.category) ? data.category : [data.category].filter(Boolean);

        return `
            <div class="project-hero">
                <div class="project-meta">
                    <div class="project-status status-${statusClass}">
                        <i class="fas fa-circle"></i>
                        ${data.status || 'Unknown'}
                    </div>
                    <div class="project-categories">
                        ${categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                    </div>
                </div>
                <div class="project-client">
                    <i class="fas fa-building"></i>
                    <span>Client: ${data.client || 'N/A'}</span>
                </div>
            </div>
        `;
    }



    /**
     * Generate image gallery section
     */
    generateImageGallery(data) {
        if (!data.images || data.images.length === 0) {
            return '';
        }

        // Helper function for optimized images
        const getOptimizedImg = (url) => window.imageManager ? window.imageManager.smartUrl(url) : url;

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-images"></i>
                    Gallery
                </h3>
                <div class="image-gallery">
                    <div class="gallery-main">
                        <img id="mainImage" src="${getOptimizedImg(data.images[0])}" alt="${data.title}" class="main-image">
                        ${data.images.length > 1 ? `
                            <div class="gallery-controls">
                                <button class="gallery-btn prev" data-action="prev">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <span class="gallery-counter">1 / ${data.images.length}</span>
                                <button class="gallery-btn next" data-action="next">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    ${data.images.length > 1 ? `
                        <div class="gallery-thumbs">
                            ${data.images.map((img, index) => `
                                <img src="${img}" alt="Thumbnail ${index + 1}" 
                                     class="thumb-image ${index === 0 ? 'active' : ''}" 
                                     data-index="${index}">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Generate video section
     */
    generateVideoSection(data) {
        if (!data.videoUrl) return '';

        const videoId = this.extractYouTubeId(data.videoUrl);
        if (!videoId) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-play"></i>
                    Demo Video
                </h3>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" 
                            frameborder="0" 
                            allowfullscreen
                            title="Project Demo Video">
                    </iframe>
                </div>
            </div>
        `;
    }

    /**
     * Generate links section
     */
    generateLinksSection(data) {
        const links = [];

        if (data.webbuildlink) {
            links.push({
                url: data.webbuildlink,
                title: 'Web Version',
                icon: 'fas fa-globe',
                class: 'web-link'
            });
        }

        if (data.androidapplink) {
            links.push({
                url: data.androidapplink,
                title: 'Android App',
                icon: 'fab fa-google-play',
                class: 'android-link'
            });
        }

        if (data.iosapplink) {
            links.push({
                url: data.iosapplink,
                title: 'iOS App',
                icon: 'fab fa-app-store',
                class: 'ios-link'
            });
        }

        if (links.length === 0) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-external-link-alt"></i>
                    Try It Out
                </h3>
                <div class="project-links">
                    ${links.map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
                           class="project-link ${link.class}">
                            <i class="${link.icon}"></i>
                            <span>${link.title}</span>
                            <i class="fas fa-external-link-alt link-arrow"></i>
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate overview section
     */
    generateOverviewSection(data) {
        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-info-circle"></i>
                    Overview
                </h3>
                <p class="project-description">${data.description || 'No description available.'}</p>
                ${data.roles && data.roles.length > 0 ? `
                    <div class="project-roles">
                        <h4>My Role</h4>
                        <div class="roles-list">
                            ${data.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Generate stats section
     */
    generateStatsSection(data) {
        if (!data.stats || Object.keys(data.stats).length === 0) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-chart-bar"></i>
                    Stats
                </h3>
                <div class="stats-grid">
                    ${Object.entries(data.stats).map(([key, value]) => `
                        <div class="stat-item">
                            <div class="stat-value">${value}</div>
                            <div class="stat-label">
                                <i class="${this.getStatIcon(key)}"></i>
                                ${this.formatLabel(key)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getStatIcon(key) {
        const iconMap = {
            'stars': 'fas fa-star',
            'downloads': 'fas fa-download',
            'rating': 'fa-solid fa-star',
            'duration': 'bi-clock'
        };

        const lowerKey = key.toLowerCase();
        if (iconMap[lowerKey]) return iconMap[lowerKey];

        for (const [pattern, icon] of Object.entries(iconMap)) {
            if (lowerKey.includes(pattern)) return icon;
        }

        return 'fas fa-info-circle';
    }

    /**
     * Generate technologies section
     */
    generateTechnologiesSection(data) {
        if (!data.technologies || data.technologies.length === 0) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-code"></i>
                    Technologies
                </h3>
                <div class="tech-grid">
                    ${data.technologies.map(tech => `
                        <span class="tech-tag">${tech.trim()}</span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Generate features section
     */
    generateFeaturesSection(data) {
        if (!data.features || data.features.length === 0) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-star"></i>
                    Key Features
                </h3>
                <ul class="features-list">
                    ${data.features.map(feature => `
                        <li class="feature-item">
                            <i class="fas fa-check"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Generate challenges section
     */
    generateChallengesSection(data) {
        if (!data.challenges || data.challenges.length === 0) return '';

        return `
            <div class="project-section">
                <h3 class="section-title">
                    <i class="fas fa-mountain"></i>
                    Challenges Overcome
                </h3>
                <ul class="challenges-list">
                    ${data.challenges.map(challenge => `
                        <li class="challenge-item">
                            <i class="fas fa-lightning-bolt"></i>
                            ${challenge}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Modal event handlers - FIXED VERSION
     */
    onModalShow(modalId, projectData) {
        console.log(`Project modal shown: ${projectData.title}`);

        // Use setTimeout to ensure DOM is rendered
        setTimeout(() => {
            this.bindImageGalleryEvents();
        }, 100);
    }

    onModalHide(modalId) {
        console.log('Project modal hidden');
        this.modalId = null;
    }

    /**
     * Bind image gallery events - FIXED VERSION
     */
    bindImageGalleryEvents() {
        if (!this.modalId) {
            console.warn('Modal ID not set');
            return;
        }

        const modal = document.getElementById(this.modalId);
        if (!modal) {
            console.warn('Modal element not found');
            return;
        }

        // Gallery controls with proper error checking
        const prevBtn = modal.querySelector('[data-action="prev"]');
        const nextBtn = modal.querySelector('[data-action="next"]');
        const thumbs = modal.querySelectorAll('.thumb-image');
        const mainImage = modal.querySelector('#mainImage');

        console.log('Found elements:', {
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            thumbs: thumbs.length,
            mainImage: !!mainImage,
            images: this.images.length
        });

        // Bind navigation buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Previous button clicked');
                this.previousImage();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Next button clicked');
                this.nextImage();
            });
        }

        // Bind thumbnail clicks
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Thumbnail clicked:', index);
                this.showImage(index);
            });
        });

        // Add touch/swipe support
        if (mainImage) {
            this.bindTouchEvents(mainImage);
        }

        // Add keyboard support
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));

        console.log('Gallery events bound successfully');
    }

    /**
     * Bind touch events for swipe support
     */
    bindTouchEvents(element) {
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        let threshold = 150; // Required distance
        let restraint = 100; // Maximum distance perpendicular
        let allowedTime = 300; // Maximum time allowed
        let elapsedTime = 0;
        let startTime = 0;

        element.addEventListener('touchstart', (e) => {
            const touchobj = e.changedTouches[0];
            startX = touchobj.pageX;
            startY = touchobj.pageY;
            startTime = new Date().getTime();
            e.preventDefault();
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            const touchobj = e.changedTouches[0];
            distX = touchobj.pageX - startX;
            distY = touchobj.pageY - startY;
            elapsedTime = new Date().getTime() - startTime;

            if (elapsedTime <= allowedTime) {
                if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                    if (distX > 0) {
                        console.log('Swiped right');
                        this.previousImage();
                    } else {
                        console.log('Swiped left');
                        this.nextImage();
                    }
                }
            }
            e.preventDefault();
        }, { passive: false });
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        if (!this.modalId) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextImage();
                break;
        }
    }

    /**
     * Gallery navigation methods - UPDATED
     */
    showImage(index) {
        if (!this.modalId || this.images.length === 0) {
            console.warn('Cannot show image - modal not ready or no images');
            return;
        }

        if (index < 0 || index >= this.images.length) {
            console.warn('Invalid image index:', index);
            return;
        }

        this.currentImageIndex = index;
        const modal = document.getElementById(this.modalId);

        if (!modal) {
            console.warn('Modal element not found');
            return;
        }

        const mainImage = modal.querySelector('#mainImage');
        const counter = modal.querySelector('.gallery-counter');
        const thumbs = modal.querySelectorAll('.thumb-image');

        console.log('Showing image:', index, 'URL:', this.images[index]);

        if (mainImage) {
            // Use optimized image URL
            const optimizedUrl = window.imageManager ?
                window.imageManager.smartUrl(this.images[index]) :
                this.images[index];

            mainImage.src = optimizedUrl;
            mainImage.alt = `Image ${index + 1}`;
        }

        if (counter) {
            counter.textContent = `${index + 1} / ${this.images.length}`;
        }

        thumbs.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
    nextImage() {
        if (this.images.length === 0) return;
        const nextIndex = (this.currentImageIndex + 1) % this.images.length;
        console.log('Next image:', nextIndex);
        this.showImage(nextIndex);
    }

    previousImage() {
        if (this.images.length === 0) return;
        const prevIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
        console.log('Previous image:', prevIndex);
        this.showImage(prevIndex);
    }

    /**
     * Utility methods
     */
    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    formatLabel(key) {
        return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
}

// Initialize and expose globally
document.addEventListener('DOMContentLoaded', () => {
    window.projectModal = new ProjectModal();
});

// Helper function to open project modal
function openProjectModal(projectData) {
    if (window.projectModal) {
        window.projectModal.open(projectData);
    } else {
        console.error('ProjectModal not initialized');
    }
}