/**
 * Contact Section - Contact information and social links
 */
class ContactSection {
    constructor() {
        this.config = {
            title: "Have an Idea ??",
            subtitle: "Ready to bring your game ideas to life? Let's connect and create the next big hit!",
            contactInfo: {
                email: "balpreets10@gmail.com",
                phone: "+91 70069-55241",
                location: "Jammu, J&K, India",
                availability: "Available for freelance and full-time opportunities"
            },
            socialLinks: [
                {
                    name: "LinkedIn",
                    url: "https://www.linkedin.com/in/balpreets7/",
                    icon: "fab fa-linkedin",
                    color: "#0077b5"
                },
                {
                    name: "GitHub",
                    url: "https://github.com/balpreets10/",
                    icon: "fab fa-github",
                    color: "#2ad870ff"
                },
                {
                    name: "Twitter",
                    url: "https://x.com/balpreets7",
                    icon: "fab fa-twitter",
                    color: "#1da1f2"
                },
                {
                    name: "Itch.io",
                    url: "https://balpreets7.itch.io/",
                    icon: "fab fa-itch-io",
                    color: "#fa5c5c"
                }
            ],
            formFields: [
                {
                    name: "name",
                    type: "text",
                    placeholder: "Your Name",
                    required: true,
                    icon: "fas fa-user"
                },
                {
                    name: "email",
                    type: "email",
                    placeholder: "Your Email",
                    required: true,
                    icon: "fas fa-envelope"
                },
                {
                    name: "subject",
                    type: "text",
                    placeholder: "Project Subject",
                    required: true,
                    icon: "fas fa-tag"
                },
                {
                    name: "message",
                    type: "textarea",
                    placeholder: "Tell me about your project...",
                    required: true,
                    icon: "fas fa-comment"
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
                <h2 class="section-title">
                    <span class="title-icon">📧</span>
                    ${this.config.title}
                </h2>
            </div>
            <div class="header-divider"></div>
            <p class="section-subtitle">${this.config.subtitle}</p>
        `;

        return header;
    }

    createContactInfo() {
        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-info-card gaming-card';

        const cardTitle = document.createElement('h3');
        cardTitle.textContent = 'Get In Touch';

        const contactDetails = document.createElement('div');
        contactDetails.className = 'contact-details';

        // Create contact items with clickable functionality
        const contactItems = [
            {
                icon: 'fas fa-envelope',
                label: 'Email',
                value: this.config.contactInfo.email,
                href: `mailto:${this.config.contactInfo.email}`,
                type: 'email'
            },
            {
                icon: 'fas fa-phone',
                label: 'Phone',
                value: this.config.contactInfo.phone,
                href: `tel:${this.config.contactInfo.phone.replace(/\s/g, '')}`,
                type: 'phone'
            },
            {
                icon: 'fas fa-map-marker-alt',
                label: 'Location',
                value: this.config.contactInfo.location,
                href: `https://maps.google.com/?q=${encodeURIComponent(this.config.contactInfo.location)}`,
                type: 'location'
            },
            {
                icon: 'fas fa-clock',
                label: 'Status',
                value: this.config.contactInfo.availability,
                special: 'availability',
                type: 'status'
            }
        ];

        contactItems.forEach(item => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';

            if (item.href) {
                // Create clickable contact item
                const contactLink = document.createElement('a');
                contactLink.href = item.href;
                contactLink.className = 'contact-link';
                if (item.type === 'location') {
                    contactLink.target = '_blank';
                    contactLink.rel = 'noopener noreferrer';
                }

                contactLink.innerHTML = `
                <div class="contact-header">
                    <i class="${item.icon}"></i>
                    <strong>${item.label}</strong>
                </div>
                <div class="contact-value ${item.special || ''}">${item.value}</div>
            `;

                contactItem.appendChild(contactLink);
            } else {
                // Non-clickable item (status)
                contactItem.innerHTML = `
                <div class="contact-header">
                    <i class="${item.icon}"></i>
                    <strong>${item.label}</strong>
                </div>
                <div class="contact-value ${item.special || ''}">${item.value}</div>
            `;
            }

            contactDetails.appendChild(contactItem);
        });

        contactInfo.appendChild(cardTitle);
        contactInfo.appendChild(contactDetails);

        return contactInfo;
    }
    createSocialLinks() {
        const socialSection = document.createElement('div');
        socialSection.className = 'social-links-card gaming-card';

        const socialTitle = document.createElement('h3');
        socialTitle.textContent = 'Connect With Me';

        const socialContainer = document.createElement('div');
        socialContainer.className = 'social-links-container';

        this.config.socialLinks.forEach(link => {
            const socialLink = document.createElement('a');
            socialLink.href = link.url;
            socialLink.target = '_blank';
            socialLink.rel = 'noopener noreferrer';
            socialLink.className = 'social-link';
            socialLink.style.setProperty('--social-color', link.color);

            socialLink.innerHTML = `
            <i class="${link.icon}"></i>
            <span>${link.name}</span>
        `;

            socialContainer.appendChild(socialLink);
        });

        socialSection.appendChild(socialTitle);
        socialSection.appendChild(socialContainer);

        return socialSection;
    }

    createContactContent() {
        const content = document.createElement('div');
        content.className = 'contact-content';

        // Create Bootstrap row
        const row = document.createElement('div');
        row.className = 'row g-4';

        // Create first column for contact info
        const contactCol = document.createElement('div');
        contactCol.className = 'col-md-6';
        contactCol.appendChild(this.createContactInfo());

        // Create second column for social links
        const socialCol = document.createElement('div');
        socialCol.className = 'col-md-6';
        socialCol.appendChild(this.createSocialLinks());

        row.appendChild(contactCol);
        row.appendChild(socialCol);
        content.appendChild(row);

        return content;
    }

    render() {
        const section = document.createElement('section');
        section.id = 'contact';
        section.className = 'contact section';

        const container = document.createElement('div');
        container.className = 'container';

        container.appendChild(this.createSectionHeader());
        container.appendChild(this.createContactContent());

        section.appendChild(container);

        return section;
    }

    setupEventListeners() {
        // Social link hover effects
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.addSocialHoverEffect(link);
            });

            link.addEventListener('mouseleave', () => {
                this.removeSocialHoverEffect(link);
            });
        });

        // Intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const contactElements = document.querySelectorAll('.contact-card');
        contactElements.forEach(element => {
            observer.observe(element);
        });
    }

    addSocialHoverEffect(link) {
        // Add any additional hover effects here
        link.style.transform = 'translateY(-5px) scale(1.05)';
    }

    removeSocialHoverEffect(link) {
        // Remove hover effects
        link.style.transform = '';
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Reset form
            e.target.reset();

            // Show success message
            this.showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        const contactCard = document.querySelector('.contact-card');
        if (contactCard) {
            contactCard.appendChild(messageDiv);

            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    // Initialize method called after render
    initialize() {
        console.log('Contact section initialized');
        this.setupEventListeners();
    }
}

window.ContactSection = ContactSection;