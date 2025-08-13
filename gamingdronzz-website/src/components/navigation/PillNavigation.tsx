import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import NavigationManager from '../../managers/NavigationManager';
import { prefersReducedMotion } from '../../utils/helpers';
import './PillNavigation.css';

interface PillNavigationProps {
    className?: string;
    position?: 'top' | 'bottom' | 'fixed-top' | 'fixed-bottom';
    onNavigate?: (itemId: string) => void;
}

interface NavigationState {
    isOpen: boolean;
    activeItem: string | null;
    hoveredItem: string | null;
    focusedItem: string | null;
    keyboardMode: boolean;
}

const PillNavigation: React.FC<PillNavigationProps> = ({
    className = '',
    position = 'fixed-top',
    onNavigate
}) => {
    const navRef = useRef<HTMLDivElement>(null);
    const onNavigateRef = useRef(onNavigate);
    const managerRef = useRef<NavigationManager>();

    // Update ref without causing re-render
    onNavigateRef.current = onNavigate;

    // Stable manager instance
    if (!managerRef.current) {
        managerRef.current = NavigationManager.getInstance();
    }

    const [config, setConfig] = useState(() => managerRef.current?.getConfig() ?? { items: [] });
    const [navState, setNavState] = useState<NavigationState>(() => ({
        isOpen: false,
        activeItem: 'home',
        hoveredItem: null,
        focusedItem: null,
        keyboardMode: false
    }));

    // Stable values
    const reducedMotion = useMemo(() => prefersReducedMotion(), []);

    // Initialize once
    useEffect(() => {
        const manager = managerRef.current!;

        if (navRef.current) {
            manager.setElement(navRef.current);
        }

        // Subscribe to navigation state changes
        const unsubscribe = manager.subscribe(setNavState);

        // Update config
        setConfig(manager.getConfig());

        // Listen for navigation events with stable callback
        const handleNavigate = (e: CustomEvent) => {
            onNavigateRef.current?.(e.detail.item.id);
        };

        document.addEventListener('navigation:navigate', handleNavigate as EventListener);

        return () => {
            unsubscribe();
            document.removeEventListener('navigation:navigate', handleNavigate as EventListener);
        };
    }, []); // No dependencies - initialize once

    // Stable event handlers
    const handleItemClick = useCallback((itemId: string) => {
        managerRef.current!.navigate(itemId);
    }, []);

    const handleItemKeyDown = useCallback((e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            managerRef.current!.navigate(itemId);
        }
    }, []);

    const handleItemMouseEnter = useCallback((itemId: string) => {
        managerRef.current!.setHoveredItem(itemId);
    }, []);

    const handleItemMouseLeave = useCallback(() => {
        managerRef.current!.setHoveredItem(null);
    }, []);

    // Memoized calculations
    const activeIndex = useMemo(() => {
        return config.items.findIndex(item => item.id === navState.activeItem);
    }, [config.items, navState.activeItem]);

    const pillClasses = useMemo(() => [
        'pill-nav',
        `pill-nav--${position}`,
        className,
        navState.keyboardMode && 'pill-nav--keyboard',
        reducedMotion && 'pill-nav--reduced-motion'
    ].filter(Boolean).join(' '), [position, className, navState.keyboardMode, reducedMotion]);

    const morphStyles = useMemo(() => ({
        '--active-index': activeIndex,
        '--total-items': config.items.length
    } as React.CSSProperties), [activeIndex, config.items.length]);

    return (
        <nav
            ref={navRef}
            className={pillClasses}
            style={morphStyles}
            aria-label="Main navigation"
            role="navigation"
        >
            <ul className="pill-nav__list" role="menubar">
                {config.items.map((item) => {
                    const isActive = navState.activeItem === item.id;
                    const isHovered = navState.hoveredItem === item.id;
                    const isFocused = navState.focusedItem === item.id;

                    const itemClasses = [
                        'pill-nav__item',
                        isActive && 'pill-nav__item--active',
                        isHovered && 'pill-nav__item--hovered',
                        isFocused && 'pill-nav__item--focused'
                    ].filter(Boolean).join(' ');

                    return (
                        <li key={item.id} className={itemClasses}>
                            <button
                                className="pill-nav__link"
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
                                {item.icon && (
                                    <span
                                        className="pill-nav__icon"
                                        aria-hidden="true"
                                    >
                                        {item.icon}
                                    </span>
                                )}
                                <span className="pill-nav__label">
                                    {item.label}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default PillNavigation;