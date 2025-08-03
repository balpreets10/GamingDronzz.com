/**
 * Footer Section - Copyright and credits
 */
class FooterSection {
    constructor() {
        this.config = {
            copyright: {
                text: 'Copyright',
                siteName: 'Balpreet Singh 2025',
                rightsText: 'All Rights Reserved'
            },
            credits: {
                text: 'Designed by',
                link: 'https://linkedin.com/in/balpreets7',
                linkText: 'Balpreet Singh'
            }
        };
    }

    render() {
        const footer = document.createElement('footer');
        footer.id = 'footer';
        footer.className = 'footer position-relative';

        const container = document.createElement('div');
        container.className = 'container';

        const copyright = document.createElement('div');
        copyright.className = 'copyright text-center';

        const p = document.createElement('p');
        p.innerHTML = `© <span>${this.config.copyright.text}</span> <strong class="px-1 sitename">${this.config.copyright.siteName}</strong> <span>${this.config.copyright.rightsText}</span>`;

        copyright.appendChild(p);

        const credits = document.createElement('div');
        credits.className = 'credits';
        credits.innerHTML = `${this.config.credits.text} <a href="${this.config.credits.link}">${this.config.credits.linkText}</a>`;

        container.appendChild(copyright);
        container.appendChild(credits);
        footer.appendChild(container);

        return footer;
    }
}

window.FooterSection = FooterSection;