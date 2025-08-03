/**
 * About Section - Profile card and details
 */
class AboutSection {
    constructor() {
        this.config = {
            profileImage: 'assets/img/profile/profile-square-3.webp',
            name: 'Marcus Thompson',
            profession: 'Creative Director & Developer',
            contact: {
                email: 'marcus@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA'
            },
            badge: 'Get to Know Me',
            title: 'Passionate About Creating Digital Experiences',
            description: [
                'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
                'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.'
            ],
            stats: [
                { number: '150+', label: 'Projects Completed' },
                { number: '5+', label: 'Years Experience' },
                { number: '98%', label: 'Client Satisfaction' }
            ],
            details: [
                { label: 'Specialization', value: 'UI/UX Design & Development' },
                { label: 'Experience Level', value: 'Senior Professional' },
                { label: 'Education', value: 'Computer Science, MIT' },
                { label: 'Languages', value: 'English, Spanish, French' }
            ],
            actions: [
                { href: '#', text: 'Download Resume', icon: 'bi-download', class: 'btn btn-primary' },
                { href: '#', text: 'Let\'s Talk', icon: 'bi-chat-dots', class: 'btn btn-outline' }
            ]
        };
    }

    createProfileCard() {
        const card = document.createElement('div');
        card.className = 'profile-card';

        const header = document.createElement('div');
        header.className = 'profile-header';

        const imageDiv = document.createElement('div');
        imageDiv.className = 'profile-image';
        const img = document.createElement('img');
        img.src = this.config.profileImage;
        img.alt = 'Profile Image';
        img.className = 'img-fluid';
        imageDiv.appendChild(img);

        const badge = document.createElement('div');
        badge.className = 'profile-badge';
        badge.innerHTML = '<i class="bi bi-check-circle-fill"></i>';

        header.appendChild(imageDiv);
        header.appendChild(badge);

        const content = document.createElement('div');
        content.className = 'profile-content';

        const h3 = document.createElement('h3');
        h3.textContent = this.config.name;

        const profession = document.createElement('p');
        profession.className = 'profession';
        profession.innerHTML = this.config.profession;

        const contactLinks = document.createElement('div');
        contactLinks.className = 'contact-links';

        // Email
        const emailLink = document.createElement('a');
        emailLink.href = `mailto:${this.config.contact.email}`;
        emailLink.className = 'contact-item';
        emailLink.innerHTML = `<i class="bi bi-envelope"></i>${this.config.contact.email}`;

        // Phone
        const phoneLink = document.createElement('a');
        phoneLink.href = `tel:${this.config.contact.phone}`;
        phoneLink.className = 'contact-item';
        phoneLink.innerHTML = `<i class="bi bi-telephone"></i>${this.config.contact.phone}`;

        // Location
        const locationLink = document.createElement('a');
        locationLink.href = '#';
        locationLink.className = 'contact-item';
        locationLink.innerHTML = `<i class="bi bi-geo-alt"></i>${this.config.contact.location}`;

        contactLinks.appendChild(emailLink);
        contactLinks.appendChild(phoneLink);
        contactLinks.appendChild(locationLink);

        content.appendChild(h3);
        content.appendChild(profession);
        content.appendChild(contactLinks);

        card.appendChild(header);
        card.appendChild(content);

        return card;
    }

    createAboutContent() {
        const content = document.createElement('div');
        content.className = 'about-content';

        // Section header
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';

        const badge = document.createElement('span');
        badge.className = 'badge-text';
        badge.textContent = this.config.badge;

        const h2 = document.createElement('h2');
        h2.textContent = this.config.title;

        sectionHeader.appendChild(badge);
        sectionHeader.appendChild(h2);

        // Description
        const description = document.createElement('div');
        description.className = 'description';

        this.config.description.forEach(text => {
            const p = document.createElement('p');
            p.textContent = text;
            description.appendChild(p);
        });

        // Stats grid
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';

        this.config.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';

            const number = document.createElement('div');
            number.className = 'stat-number';
            number.textContent = stat.number;

            const label = document.createElement('div');
            label.className = 'stat-label';
            label.textContent = stat.label;

            statItem.appendChild(number);
            statItem.appendChild(label);
            statsGrid.appendChild(statItem);
        });

        // Details grid
        const detailsGrid = document.createElement('div');
        detailsGrid.className = 'details-grid';

        for (let i = 0; i < this.config.details.length; i += 2) {
            const row = document.createElement('div');
            row.className = 'detail-row';

            for (let j = i; j < Math.min(i + 2, this.config.details.length); j++) {
                const detail = this.config.details[j];
                const item = document.createElement('div');
                item.className = 'detail-item';

                const label = document.createElement('span');
                label.className = 'detail-label';
                label.textContent = detail.label;

                const value = document.createElement('span');
                value.className = 'detail-value';
                value.innerHTML = detail.value;

                item.appendChild(label);
                item.appendChild(value);
                row.appendChild(item);
            }

            detailsGrid.appendChild(row);
        }

        // CTA section
        const ctaSection = document.createElement('div');
        ctaSection.className = 'cta-section';

        this.config.actions.forEach(action => {
            const a = document.createElement('a');
            a.href = action.href;
            a.className = action.class;
            a.innerHTML = `<i class="${action.icon}"></i>${action.text}`;
            ctaSection.appendChild(a);
        });

        content.appendChild(sectionHeader);
        content.appendChild(description);
        content.appendChild(statsGrid);
        content.appendChild(detailsGrid);
        content.appendChild(ctaSection);

        return content;
    }

    render() {
        const section = document.createElement('section');
        section.id = 'about';
        section.className = 'about section';

        const container = document.createElement('div');
        container.className = 'container';
        container.setAttribute('data-aos', 'fade-up');
        container.setAttribute('data-aos-delay', '100');

        const row = document.createElement('div');
        row.className = 'row';

        const leftCol = document.createElement('div');
        leftCol.className = 'col-lg-5';
        leftCol.setAttribute('data-aos', 'zoom-in');
        leftCol.setAttribute('data-aos-delay', '200');
        leftCol.appendChild(this.createProfileCard());

        const rightCol = document.createElement('div');
        rightCol.className = 'col-lg-7';
        rightCol.setAttribute('data-aos', 'fade-left');
        rightCol.setAttribute('data-aos-delay', '300');
        rightCol.appendChild(this.createAboutContent());

        row.appendChild(leftCol);
        row.appendChild(rightCol);
        container.appendChild(row);
        section.appendChild(container);

        return section;
    }
}

window.AboutSection = AboutSection;