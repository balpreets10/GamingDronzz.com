/**
 * Enhanced Navigation Manager - Handles active states, hover collapse, and mobile slide animation
 */
class NavigationManager {
    constructor() {
        this.sections = [];
        this.navItems = [];
        this.isScrolling = false;
        this.header = null;
        this.headerToggle = null;
        this.backdrop = null;
        this.isCollapsed = true; // Start in collapsed state
        this.isMobile = false;
        this.isNavOpen = false; // Mobile nav state
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Get header element
        this.header = document.querySelector('#header');
        this.headerToggle = document.querySelector('.header-toggle');

        if (!this.header) {
            console.warn('Header element not found');
            return;
        }

        // Get all navigation items
        this.navItems = document.querySelectorAll('.navmenu a[href^="#"]');

        // Get all sections - filter out invalid hrefs
        this.sections = Array.from(this.navItems).map(item => {
            const href = item.getAttribute('href');

            // Skip if href is just '#' or empty
            if (!href || href === '#' || href.length <= 1) {
                return null;
            }

            const section = document.querySelector(href);
            return {
                id: href.replace('#', ''),
                element: section,
                navItem: item,
                href: href
            };
        }).filter(item => item && item.element); // Only include valid sections that exist

        // Check if mobile
        this.checkMobile();

        // Setup mobile navigation
        this.setupMobileNavigation();

        // Add click handlers
        this.addClickHandlers();

        // Add scroll handler
        this.addScrollHandler();

        // Add hover handlers for desktop only
        if (!this.isMobile) {
            this.addHoverHandlers();
            this.setCollapsedState(true); // Start collapsed on desktop
        }

        // Add resize handler to detect mobile/desktop changes
        this.addResizeHandler();

        // Initial active state
        this.updateActiveState();

        console.log('Enhanced Navigation Manager initialized with sections:', this.sections.map(s => s.id));
    }

    setupMobileNavigation() {
        if (!this.headerToggle) return;

        // Create backdrop for mobile
        this.createBackdrop();

        // Add toggle event listener
        this.headerToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMobileNav();
        });

        // Close nav when clicking backdrop
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => {
                this.closeMobileNav();
            });
        }

        // Close nav on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isNavOpen) {
                this.closeMobileNav();
            }
        });

        // Close nav when clicking nav links (mobile)
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', () => {
                if (this.isMobile && this.isNavOpen) {
                    // Small delay to allow smooth scroll to start
                    setTimeout(() => {
                        this.closeMobileNav();
                    }, 100);
                }
            });
        });
    }

    createBackdrop() {
        // Only create if it doesn't exist
        if (this.backdrop || !document.body) return;

        this.backdrop = document.createElement('div');
        this.backdrop.className = 'header-backdrop';
        document.body.appendChild(this.backdrop);
    }

    toggleMobileNav() {
        if (this.isNavOpen) {
            this.closeMobileNav();
        } else {
            this.openMobileNav();
        }
    }

    openMobileNav() {
        if (!this.isMobile) return;

        this.isNavOpen = true;
        this.header.classList.add('header-show');
        document.body.classList.add('nav-open');

        // Update toggle button
        if (this.headerToggle) {
            this.headerToggle.classList.remove('bi-list');
            this.headerToggle.classList.add('bi-x');
        }
    }

    closeMobileNav() {
        if (!this.isMobile) return;

        this.isNavOpen = false;
        this.header.classList.remove('header-show');
        document.body.classList.remove('nav-open');

        // Update toggle button
        if (this.headerToggle) {
            this.headerToggle.classList.add('bi-list');
            this.headerToggle.classList.remove('bi-x');
        }
    }

    checkMobile() {
        this.isMobile = window.innerWidth <= 1199;
    }

    addHoverHandlers() {
        if (!this.header || this.isMobile) return;

        let hoverTimeout;

        // Mouse enter - expand navigation
        this.header.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            this.setCollapsedState(false);
        });

        // Mouse leave - collapse navigation with delay
        this.header.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                this.setCollapsedState(true);
            }, 300); // Small delay before collapsing
        });
    }

    addResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = this.isMobile;
                this.checkMobile();

                // If switching from mobile to desktop
                if (wasMobile && !this.isMobile) {
                    this.closeMobileNav(); // Close mobile nav
                    this.addHoverHandlers();
                    this.setCollapsedState(true);
                }
                // If switching from desktop to mobile
                else if (!wasMobile && this.isMobile) {
                    this.removeHoverClasses();
                }
            }, 250);
        });
    }

    setCollapsedState(collapsed) {
        if (!this.header || this.isMobile) return;

        this.isCollapsed = collapsed;

        if (collapsed) {
            this.header.classList.add('collapsed');
            this.header.classList.remove('expanded');
        } else {
            this.header.classList.remove('collapsed');
            this.header.classList.add('expanded');
        }
    }

    removeHoverClasses() {
        if (!this.header) return;
        this.header.classList.remove('collapsed', 'expanded');
    }

    addClickHandlers() {
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', (e) => {
                const href = navItem.getAttribute('href');

                // Only handle valid internal links
                if (href && href.startsWith('#') && href.length > 1) {
                    // Remove active from all nav items
                    this.removeAllActive();

                    // Add active to clicked item
                    navItem.classList.add('active');

                    // Smooth scroll to section
                    const targetSection = document.querySelector(href);
                    if (targetSection) {
                        e.preventDefault();
                        this.scrollToSection(targetSection);
                    }
                }
            });
        });
    }

    addScrollHandler() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    handleScroll() {
        // Don't update during programmatic scrolling
        if (this.isScrolling) return;

        const scrollPos = window.scrollY + 100; // Offset for better detection
        let activeSection = null;

        // Find the current section
        for (let i = this.sections.length - 1; i >= 0; i--) {
            const section = this.sections[i];
            if (section.element) {
                const rect = section.element.getBoundingClientRect();
                const sectionTop = window.scrollY + rect.top;

                if (scrollPos >= sectionTop) {
                    activeSection = section;
                    break;
                }
            }
        }

        // Special case for hero section when at top
        if (window.scrollY < 50) {
            const heroSection = this.sections.find(s => s.id === 'hero');
            if (heroSection) {
                activeSection = heroSection;
            }
        }

        // Update active state
        if (activeSection) {
            this.setActiveSection(activeSection);
        }
    }

    setActiveSection(activeSection) {
        // Remove active from all
        this.removeAllActive();

        // Add active to current section's nav item
        if (activeSection.navItem) {
            activeSection.navItem.classList.add('active');
        }
    }

    removeAllActive() {
        this.navItems.forEach(item => {
            item.classList.remove('active');
        });
    }

    scrollToSection(targetElement) {
        this.isScrolling = true;

        // Calculate header offset based on current state
        const headerOffset = 10;

        const targetPosition = targetElement.offsetTop - headerOffset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Reset scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);
    }

    updateActiveState() {
        // Set initial active state based on current scroll position
        this.handleScroll();
    }

    // Public method to manually toggle collapse state (optional)
    toggleCollapse() {
        if (!this.isMobile) {
            this.setCollapsedState(!this.isCollapsed);
        }
    }

    // Public method to get current state
    getState() {
        return {
            isCollapsed: this.isCollapsed,
            isMobile: this.isMobile,
            isNavOpen: this.isNavOpen,
            activeSection: this.sections.find(s => s.navItem?.classList.contains('active'))?.id
        };
    }
}

// Expose class on window for manual initialization
window.NavigationManager = NavigationManager;