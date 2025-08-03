/**
 * Header Section - Navigation and social links with Gaming Icons
 */
class HeaderSection {
    constructor() {
        this.navigationItems = [
            { href: '#hero', icon: 'bi-controller', text: 'Home' },
            { href: '#game', icon: 'bi-person-gear', text: 'Game' },
            { href: '#portfolio', icon: 'bi-collection-play', text: 'Portfolio' },
            { href: '#skills', icon: 'bi-gear', text: 'Skills' },
            { href: '#experience', icon: 'bi-trophy', text: 'Experience' },
            // { href: '#testimonials', icon: 'bi-people', text: 'Testimonials' },
            { href: '#testimonials', icon: 'bi-star-fill  ', text: 'Testimonials' },
            // {
            //     href: '#',
            //     icon: 'bi-grid-3x3-gap',
            //     text: 'Dropdown',
            //     isDropdown: true,
            //     children: [
            //         { href: '#', text: 'Dropdown 1' },
            //         {
            //             href: '#',
            //             text: 'Deep Dropdown',
            //             children: [
            //                 { href: '#', text: 'Deep Dropdown 1' },
            //                 { href: '#', text: 'Deep Dropdown 2' },
            //                 { href: '#', text: 'Deep Dropdown 3' },
            //                 { href: '#', text: 'Deep Dropdown 4' },
            //                 { href: '#', text: 'Deep Dropdown 5' }
            //             ]
            //         },
            //         { href: '#', text: 'Dropdown 2' },
            //         { href: '#', text: 'Dropdown 3' },
            //         { href: '#', text: 'Dropdown 4' }
            //     ]
            // },
            { href: '#contact', icon: 'bi-chat-left-text', text: 'Contact' }
        ];
    }

    createNavigationItem(item) {
        const li = document.createElement('li');

        if (item.isDropdown) {
            li.className = 'dropdown';
            li.innerHTML = `
                <a href="${item.href}">
                    <i class="${item.icon} navicon"></i> 
                    <span>${item.text}</span> 
                    <i class="bi bi-chevron-down toggle-dropdown"></i>
                </a>
            `;

            if (item.children) {
                const ul = document.createElement('ul');
                item.children.forEach(child => {
                    if (child.children) {
                        const childLi = document.createElement('li');
                        childLi.className = 'dropdown';
                        childLi.innerHTML = `
                            <a href="${child.href}">
                                <span>${child.text}</span> 
                                <i class="bi bi-chevron-down toggle-dropdown"></i>
                            </a>
                        `;

                        const subUl = document.createElement('ul');
                        child.children.forEach(subChild => {
                            const subLi = document.createElement('li');
                            subLi.innerHTML = `<a href="${subChild.href}">${subChild.text}</a>`;
                            subUl.appendChild(subLi);
                        });

                        childLi.appendChild(subUl);
                        ul.appendChild(childLi);
                    } else {
                        const childLi = document.createElement('li');
                        childLi.innerHTML = `<a href="${child.href}">${child.text}</a>`;
                        ul.appendChild(childLi);
                    }
                });
                li.appendChild(ul);
            }
        } else {
            const a = document.createElement('a');
            a.href = item.href;
            if (item.active) a.className = 'active';
            a.innerHTML = `<i class="${item.icon} navicon"></i><div class=navlabel>${item.text}</div>`;
            li.appendChild(a);
        }

        return li;
    }

    render() {
        const header = document.createElement('header');
        header.id = 'header';
        header.className = 'header dark-background d-flex flex-column justify-content-center';

        header.innerHTML = '<i class="header-toggle d-xl-none bi bi-list"></i>';

        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-container d-flex flex-column align-items-start';

        // Create navigation
        const nav = document.createElement('nav');
        nav.id = 'navmenu';
        nav.className = 'navmenu';

        const ul = document.createElement('ul');
        this.navigationItems.forEach(item => {
            ul.appendChild(this.createNavigationItem(item));
        });

        nav.appendChild(ul);
        headerContainer.appendChild(nav);

        header.appendChild(headerContainer);

        return header;
    }
}

window.HeaderSection = HeaderSection;