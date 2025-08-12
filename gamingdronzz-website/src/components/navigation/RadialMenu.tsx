
import { useEffect, useRef, useState } from 'react';
import NavigationManager from '../../managers/NavigationManager';
import { prefersReducedMotion } from '../../utils/helpers';
import './RadialMenu.css';

interface RadialMenuProps {
    className?: string;
    centerIcon?: string;
    onNavigate?: (itemId: string) => void;
}

interface NavigationState {
    isOpen: boolean;
    activeItem: string | null;
    hoveredItem: string | null;
    focusedItem: string | null;
    keyboardMode: boolean;
}

const RadialMenu: React.FC<RadialMenuProps> = ({
    className = '',
    centerIcon = '☰',
    onNavigate
}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const [navState, setNavState] = useState<NavigationState>({
        isOpen: false,
        activeItem: null,
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false
    });

    const navManager = NavigationManager.getInstance();
    const config = navManager.getConfig();
    const reducedMotion = prefersReducedMotion();

    useEffect(() => {
        if (menuRef.current) {
            navManager.setElement(menuRef.current);
        }

        // Subscribe to navigation state changes
        const unsubscribe = navManager.subscribe(setNavState);

        // Listen for navigation events
        const handleNavigate = (e: CustomEvent) => {
            if (onNavigate) {
                onNavigate(e.detail.item.id);
            }
        };

        document.addEventListener('navigation:navigate', handleNavigate as EventListener);

        return () => {
            unsubscribe();
            document.removeEventListener('navigation:navigate', handleNavigate as EventListener);
        };
    }, [onNavigate, navManager]);

    const handleCenterClick = () => {
        navManager.toggle();
    };

    const handleCenterKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navManager.toggle();
        }
    };

    const handleCenterMouseEnter = () => {
        if (!navState.isOpen) {
            navManager.open();
        }
    };

    const handleCenterMouseLeave = () => {
        // Auto-close handled by manager
    };

    const handleItemClick = (itemId: string) => {
        navManager.navigate(itemId);
    };

    const handleItemKeyDown = (e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navManager.navigate(itemId);
        }
    };

    const handleItemMouseEnter = (itemId: string) => {
        navManager.setHoveredItem(itemId);
    };

    const handleItemMouseLeave = () => {
        navManager.setHoveredItem(null);
    };

    const getItemStyle = (position: number) => {
        const pos = navManager.getItemPosition(position);
        const duration = reducedMotion ? 0 : config.animationDuration;

        return {
            '--item-x': `${pos.x}px`,
            '--item-y': `${pos.y}px`,
            '--animation-duration': `${duration}ms`,
            '--animation-delay': `${position * 50}ms`
        } as React.CSSProperties;
    };

    const menuClasses = [
        'radial-menu',
        className,
        navState.isOpen && 'radial-menu--open',
        navState.keyboardMode && 'radial-menu--keyboard',
        reducedMotion && 'radial-menu--reduced-motion'
    ].filter(Boolean).join(' ');

    return (
        <nav
            ref={menuRef}
            className={menuClasses}
            aria-label="Main navigation"
            role="navigation"
        >
            {/* Center Button */}
            <button
                className="radial-menu__center"
                data-nav-center
                onClick={handleCenterClick}
                onKeyDown={handleCenterKeyDown}
                onMouseEnter={handleCenterMouseEnter}
                onMouseLeave={handleCenterMouseLeave}
                aria-expanded={navState.isOpen}
                aria-haspopup="menu"
                aria-label={navState.isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                type="button"
            >
                <span className="radial-menu__center-icon" aria-hidden="true">
                    {centerIcon}
                </span>
                <span className="radial-menu__center-text">
                    {navState.isOpen ? 'Close' : 'Menu'}
                </span>
            </button>

            {/* Navigation Items */}
            <ul
                className="radial-menu__items"
                role="menu"
                aria-hidden={!navState.isOpen}
            >
                {config.items.map((item) => {
                    const isActive = navState.activeItem === item.id;
                    const isHovered = navState.hoveredItem === item.id;
                    const isFocused = navState.focusedItem === item.id;

                    const itemClasses = [
                        'radial-menu__item',
                        isActive && 'radial-menu__item--active',
                        isHovered && 'radial-menu__item--hovered',
                        isFocused && 'radial-menu__item--focused'
                    ].filter(Boolean).join(' ');

                    return (
                        <li
                            key={item.id}
                            className={itemClasses}
                            style={getItemStyle(item.position)}
                        >
                            <button
                                className="radial-menu__item-button"
                                data-nav-item={item.id}
                                onClick={() => handleItemClick(item.id)}
                                onKeyDown={(e) => handleItemKeyDown(e, item.id)}
                                onMouseEnter={() => handleItemMouseEnter(item.id)}
                                onMouseLeave={handleItemMouseLeave}
                                role="menuitem"
                                tabIndex={navState.isOpen ? 0 : -1}
                                aria-label={`Navigate to ${item.label}`}
                                type="button"
                            >
                                {item.icon && (
                                    <span
                                        className="radial-menu__item-icon"
                                        aria-hidden="true"
                                    >
                                        {item.icon}
                                    </span>
                                )}
                                <span className="radial-menu__item-label">
                                    {item.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* Backdrop for click-to-close */}
            {navState.isOpen && (
                <div
                    className="radial-menu__backdrop"
                    onClick={() => navManager.close()}
                    aria-hidden="true"
                />
            )}
        </nav>
    );
};

export default RadialMenu;