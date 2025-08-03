/**
 * Testimonials Section - Clean Gaming Theme Implementation
 */
class TestimonialsSection {
    constructor() {
        this.config = null;
        this.dataLoaded = false;
    }

    async loadTestimonialsData() {
        if (this.dataLoaded) {
            return this.config;
        }

        try {
            const response = await fetch('data/testimonials-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
            this.dataLoaded = true;
            console.log('Testimonials data loaded successfully');
            return this.config;
        } catch (error) {
            console.error('Error loading testimonials data:', error);
            // Fallback to default config if JSON fails to load
            this.config = this.getDefaultConfig();
            this.dataLoaded = true;
            return this.config;
        }
    }

    getDefaultConfig() {
        // Fallback config in case JSON loading fails
        return {
            title: 'Testimonials',
            subtitle: 'What industry professionals say about working with me',
            testimonials: [
                {
                    quote: 'The kind of technical leader who transforms teams and elevates outcomes. Visionary in systems design with unmatched problem solving attitude. Navigates high-pressure scenarios with calm and turns challenges into opportunities',
                    clientName: 'Sameer Bhanot',
                    positions: ['Co-Founder', 'Technical Director'],
                    companies: ['Rovelens', 'ArdentInfo Solutions'],
                    linkedinImage: 'https://media.licdn.com/dms/image/v2/C4D03AQEFLLmXUVe0QA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1605625324403?e=1755734400&v=beta&t=FUy5Z3jSoW7Cp3QJka2cvolxo5Hg2oD2lG7KcJqozjs',
                    companyLogo: '',
                    profileUrl: '',
                    highlight: true
                },
                {
                    quote: 'Played a key role in shaping the technical direction of the project and led a team of 15 developers with clarity, patience, and strong leadership. Ability to stay grounded and collaborative',
                    clientName: 'Ankush Sharma',
                    positions: ['Senior Game Developer'],
                    companies: ['King Entertainment Corp'],
                    linkedinImage: 'https://media.licdn.com/dms/image/v2/D5603AQFMxdkhfUkNRw/profile-displayphoto-shrink_400_400/B56ZTy9CL3GQAk-/0/1739242876229?e=1755734400&v=beta&t=bAGTsJXjBJRX7neGYJoNp6SEgJKMC-RYRQPJIKsbWj8',
                    companyLogo: '',
                    profileUrl: '',
                    highlight: false
                },
                {
                    quote: 'Highly productive and unwavering commitment to quality in every aspect. Deep understanding of game development paired with technical knowledge and vision consistently guided the team towards success',
                    clientName: 'Gunjita Jamwal',
                    positions: ['Software Engineer'],
                    companies: ['Scopely'],
                    linkedinImage: 'https://media.licdn.com/dms/image/v2/D5603AQGh8wqQhdrjbA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1718250502224?e=1755734400&v=beta&t=Lh40NG651n0hVSpNf9jEJDWe3MM46YGku0E7y-GUGi0',
                    companyLogo: '',
                    profileUrl: '',
                    highlight: false
                }
            ]
        };
    }

    createSectionHeader() {
        const header = document.createElement('div');
        header.className = 'section-header';
        header.setAttribute('data-aos', 'fade-down');

        header.innerHTML = `
            <div class="title-container">
                <h2 class="section-title">${this.config.title}</h2>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${this.config.subtitle}</p>
        `;

        return header;
    }

    createTestimonialCard(testimonial) {
        const card = document.createElement('div');
        card.className = testimonial.highlight ? 'testimonial-card highlight' : 'testimonial-card';

        // Company logo (top right corner)
        if (testimonial.companyLogo) {
            const companyLogo = document.createElement('div');
            companyLogo.className = 'company-logo';
            const logoImg = document.createElement('img');
            logoImg.src = testimonial.companyLogo;
            logoImg.alt = `${testimonial.companies?.[0] || 'Company'} logo`;
            logoImg.loading = 'lazy';
            logoImg.onerror = () => {
                // Hide logo container if image fails to load
                companyLogo.style.display = 'none';
            };
            companyLogo.appendChild(logoImg);
            card.appendChild(companyLogo);
        }

        // Quote icon
        const quoteIcon = document.createElement('div');
        quoteIcon.className = 'quote-icon';
        quoteIcon.innerHTML = '<i class="bi bi-quote"></i>';

        // Quote content
        const quoteContent = document.createElement('div');
        quoteContent.className = 'quote-content';
        const quote = document.createElement('p');
        quote.textContent = testimonial.quote;
        quoteContent.appendChild(quote);

        // Client info
        const clientInfo = document.createElement('div');
        clientInfo.className = 'client-info';

        // Client avatar
        const clientAvatar = document.createElement('div');
        clientAvatar.className = 'client-avatar';
        const img = document.createElement('img');

        // Try to use LinkedIn image, fallback to placeholder
        if (testimonial.linkedinImage) {
            img.src = testimonial.linkedinImage;
            img.onerror = () => {
                // Fallback to a default avatar if LinkedIn image fails
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.clientName)}&background=38ac5f&color=fff&size=96`;
            };
        } else {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.clientName)}&background=38ac5f&color=fff&size=96`;
        }

        img.alt = testimonial.clientName;
        img.loading = 'lazy';
        clientAvatar.appendChild(img);

        // Client details
        const clientDetails = document.createElement('div');
        clientDetails.className = 'client-details';

        const h4 = document.createElement('h4');
        h4.textContent = testimonial.clientName;

        // Position labels
        if (testimonial.positions && testimonial.positions.length > 0) {
            const positionContainer = document.createElement('div');
            positionContainer.className = 'position-container';
            testimonial.positions.forEach((pos, index) => {
                const position = document.createElement('p');
                position.className = 'position';
                position.textContent = pos;
                positionContainer.appendChild(position);
            });
            clientDetails.appendChild(h4);
            clientDetails.appendChild(positionContainer);
        }

        // Company labels
        if (testimonial.companies && testimonial.companies.length > 0) {
            const companyContainer = document.createElement('div');
            companyContainer.className = 'company-container';
            testimonial.companies.forEach((comp, index) => {
                const company = document.createElement('p');
                company.className = 'company';
                company.textContent = comp;
                companyContainer.appendChild(company);
            });
            clientDetails.appendChild(companyContainer);
        }

        // LinkedIn button
        if (testimonial.profileUrl) {
            const linkedinBtn = document.createElement('a');
            linkedinBtn.href = testimonial.profileUrl;
            linkedinBtn.target = '_blank';
            linkedinBtn.rel = 'noopener noreferrer';
            linkedinBtn.className = 'linkedin-btn';
            linkedinBtn.innerHTML = '<i class="bi bi-linkedin"></i>';
            linkedinBtn.setAttribute('aria-label', `View ${testimonial.clientName}'s LinkedIn profile`);
            clientDetails.appendChild(linkedinBtn);
        }

        // Assemble client info
        clientInfo.appendChild(clientAvatar);
        clientInfo.appendChild(clientDetails);

        // Assemble card
        card.appendChild(quoteIcon);
        card.appendChild(quoteContent);
        card.appendChild(clientInfo);

        return card;
    }

    async render() {
        // Load data if not already loaded
        if (!this.dataLoaded) {
            await this.loadTestimonialsData();
        }

        // Show loading if data is still not available
        if (!this.config) {
            return this.createLoadingSection();
        }

        const section = document.createElement('section');
        section.id = 'testimonials';
        section.className = 'testimonials section';

        const container = document.createElement('div');
        container.className = 'container';

        // Add section header
        container.appendChild(this.createSectionHeader());

        // Create testimonial grid
        const grid = document.createElement('div');
        grid.className = 'testimonial-grid';

        // Add testimonial cards
        this.config.testimonials.forEach(testimonial => {
            grid.appendChild(this.createTestimonialCard(testimonial));
        });

        container.appendChild(grid);
        section.appendChild(container);

        return section;
    }

    createLoadingSection() {
        const section = document.createElement('section');
        section.id = 'testimonials';
        section.className = 'testimonials section';

        const container = document.createElement('div');
        container.className = 'container';

        container.innerHTML = `
            <div class="loading-testimonials">
                <div class="loading-spinner"></div>
                <p>Loading Testimonials...</p>
            </div>
        `;

        section.appendChild(container);
        return section;
    }

    // Optional: Method to initialize intersection observer for animations
    initializeAnimations() {
        const cards = document.querySelectorAll('.testimonial-card');

        // Only add intersection observer if user prefers animations
        if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, { threshold: 0.1 });

            cards.forEach(card => {
                card.style.animationPlayState = 'paused';
                observer.observe(card);
            });
        }
    }

    // Initialize method called after render
    initialize() {
        console.log('Testimonials section initialized');
        this.initializeAnimations();
    }

    // Method to update testimonials data
    async updateTestimonials(newData) {
        this.config = { ...this.config, ...newData };
        this.dataLoaded = true;
        const existingSection = document.getElementById('testimonials');
        if (existingSection) {
            const newSection = await this.render();
            existingSection.parentNode.replaceChild(newSection, existingSection);
            this.initialize();
        }
    }

    // Method to refresh data from JSON
    async refreshData() {
        this.dataLoaded = false;
        this.config = null;
        await this.loadTestimonialsData();

        const existingSection = document.getElementById('testimonials');
        if (existingSection) {
            const newSection = await this.render();
            existingSection.parentNode.replaceChild(newSection, existingSection);
            this.initialize();
        }
    }

    // Cleanup method
    cleanup() {
        // Remove any remaining event listeners
        const testimonialsSection = document.getElementById('testimonials');
        if (testimonialsSection) {
            testimonialsSection.remove();
        }
    }
}

window.TestimonialsSection = TestimonialsSection;