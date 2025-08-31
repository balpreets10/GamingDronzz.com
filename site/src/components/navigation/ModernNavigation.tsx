import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import NavigationManager from '../../managers/NavigationManager';
import ProfileDropdown from './ProfileDropdown';
import RadialMenu from './RadialMenu';
import { prefersReducedMotion } from '../../utils/helpers';
import { useThemeLogo } from '../../utils/logoUtils';
import './ModernNavigation.css';

interface ModernNavigationProps {
    className?: string;
    position?: 'top' | 'bottom' | 'fixed-top' | 'fixed-bottom';
    onNavigate?: (itemId: string) => void;
    onLoginClick?: () => void;
    brand?: string;
    brandHref?: string;
}

interface NavigationState {
    isOpen: boolean;
    activeItem: string | null;
    hoveredItem: string | null;
    focusedItem: string | null;
    keyboardMode: boolean;
}

const ModernNavigation: React.FC<ModernNavigationProps> = ({
    className = '',
    position = 'fixed-top',
    onNavigate,
    onLoginClick,
    brand = 'GamingDronzz',
    brandHref = '#hero'
}) => {
    const navRef = useRef<HTMLDivElement>(null);
    const onNavigateRef = useRef(onNavigate);
    const onLoginClickRef = useRef(onLoginClick);
    const managerRef = useRef<NavigationManager>();

    onNavigateRef.current = onNavigate;
    onLoginClickRef.current = onLoginClick;

    if (!managerRef.current) {
        managerRef.current = NavigationManager.getInstance();
    }

    const [config, setConfig] = useState(() => managerRef.current?.getConfig() ?? { items: [] });
    const [navState, setNavState] = useState<NavigationState>(() => ({
        isOpen: false,
        activeItem: 'hero',
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false
    }));

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const reducedMotion = useMemo(() => prefersReducedMotion(), []);
    const logoInfo = useThemeLogo();

    // Handle scroll effect for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initialize navigation manager
    useEffect(() => {
        const manager = managerRef.current!;

        if (navRef.current) {
            manager.setElement(navRef.current);
        }

        const unsubscribe = manager.subscribe(setNavState);
        setConfig(manager.getConfig());

        return () => {
            unsubscribe();
        };
    }, []);

    // Handle mobile menu close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobileMenuOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    // Handle escape key to close mobile menu
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMobileMenuOpen) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isMobileMenuOpen]);

    const handleItemClick = useCallback((itemId: string) => {
        onNavigateRef.current?.(itemId);
        managerRef.current!.navigate(itemId);
        setIsMobileMenuOpen(false);
    }, []);

    const handleItemKeyDown = useCallback((e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick(itemId);
        }
    }, [handleItemClick]);

    const handleItemMouseEnter = useCallback((itemId: string) => {
        managerRef.current!.setHoveredItem(itemId);
    }, []);

    const handleItemMouseLeave = useCallback(() => {
        managerRef.current!.setHoveredItem(null);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    const handleBrandClick = useCallback(() => {
        if (brandHref.startsWith('#')) {
            const homeItem = config.items.find(item => item.href === brandHref);
            if (homeItem) {
                handleItemClick(homeItem.id);
            }
        } else {
            window.location.href = brandHref;
        }
    }, [brandHref, config.items, handleItemClick]);

    const handleLoginClick = useCallback(() => {
        onLoginClickRef.current?.();
    }, []);

    const navClasses = useMemo(() => [
        'modern-nav',
        `modern-nav--${position}`,
        className,
        navState.keyboardMode && 'modern-nav--keyboard',
        reducedMotion && 'modern-nav--reduced-motion',
        isMobileMenuOpen && 'modern-nav--open',
        isScrolled && 'modern-nav--scrolled'
    ].filter(Boolean).join(' '), [
        position,
        className,
        navState.keyboardMode,
        reducedMotion,
        isMobileMenuOpen,
        isScrolled
    ]);

    return (
        <nav
            ref={navRef}
            className={navClasses}
            aria-label="Main navigation"
            role="navigation"
        >
            <div className="modern-nav__container">
                {/* Brand/Logo */}
                <button
                    className="modern-nav__brand"
                    onClick={handleBrandClick}
                    aria-label={`Go to ${brand} home page`}
                    type="button"
                >
                    <img 
                        src={logoInfo.src} 
                        alt={logoInfo.alt} 
                        className={`modern-nav__brand-logo ${logoInfo.isLightLogo ? 'modern-nav__brand-logo--light' : 'modern-nav__brand-logo--dark'}`}
                    />
                </button>

                {/* Desktop Navigation - Centered */}
                <ul className="modern-nav__list" role="menubar">
                    {config.items.map((item) => {
                        const isActive = navState.activeItem === item.id;
                        const isHovered = navState.hoveredItem === item.id;
                        const isFocused = navState.focusedItem === item.id;

                        const itemClasses = [
                            'modern-nav__item',
                            isActive && 'modern-nav__item--active',
                            isHovered && 'modern-nav__item--hovered',
                            isFocused && 'modern-nav__item--focused'
                        ].filter(Boolean).join(' ');

                        return (
                            <li key={item.id} className={itemClasses}>
                                <button
                                    className="modern-nav__link"
                                    data-nav-item={item.id}
                                    onClick={() => handleItemClick(item.id)}
                                    onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                                    onMouseEnter={() => handleItemMouseEnter(item.id)}
                                    onMouseLeave={handleItemMouseLeave}
                                    role="menuitem"
                                    aria-current={isActive ? 'page' : undefined}
                                    aria-label={`Navigate to ${item.label}`}
                                    type="button"
                                >
                                    <span className="modern-nav__label">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Right side - Profile Dropdown + Hamburger */}
                <div className="modern-nav__right">
                    {/* Profile Dropdown - Desktop */}
                    <ProfileDropdown
                        onLoginClick={handleLoginClick}
                        className="modern-nav__profile"
                    />

                    {/* Hamburger Menu Button */}
                    <button
                        className="modern-nav__hamburger"
                        onClick={toggleMobileMenu}
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-nav-menu"
                        type="button"
                    >
                        <span className="modern-nav__hamburger-line"></span>
                        <span className="modern-nav__hamburger-line"></span>
                        <span className="modern-nav__hamburger-line"></span>
                    </button>
                </div>
            </div>

            {/* Radial Menu for Mobile */}
            <RadialMenu
                isOpen={isMobileMenuOpen}
                items={config.items}
                activeItem={navState.activeItem}
                onItemClick={handleItemClick}
                onClose={() => setIsMobileMenuOpen(false)}
                centerIcon="✕"
                centerLabel="Close"
                className="modern-nav__radial-menu"
            />

            {/* Mobile Profile Overlay */}
            {isMobileMenuOpen && (
                <div className="modern-nav__mobile-profile-overlay">
                    <ProfileDropdown
                        onLoginClick={handleLoginClick}
                        className="modern-nav__profile--mobile"
                    />
                </div>
            )}
        </nav>
    );
};

export default ModernNavigation;