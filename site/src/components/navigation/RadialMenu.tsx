import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavigationItem } from '../../types/navigation';
import './RadialMenu.css';

interface RadialMenuProps {
    isOpen: boolean;
    items: NavigationItem[];
    activeItem: string | null;
    onItemClick: (itemId: string) => void;
    onClose: () => void;
    centerIcon?: string;
    centerLabel?: string;
    className?: string;
}

interface ItemPosition {
    x: number;
    y: number;
    angle: number;
}

const RadialMenu: React.FC<RadialMenuProps> = ({
    isOpen,
    items,
    activeItem,
    onItemClick,
    onClose,
    centerIcon = '☰',
    centerLabel = 'Menu',
    className = ''
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Mount the component with a slight delay for smooth animation
    useEffect(() => {
        if (isOpen) {
            setIsMounted(true);
        } else {
            const timer = setTimeout(() => setIsMounted(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle escape key and outside clicks
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Calculate position for each navigation item in a circle
    const getItemPosition = useCallback((index: number, totalItems: number): ItemPosition => {
        const radius = 120; // Distance from center
        const startAngle = -90; // Start from top (-90 degrees)
        const angleSpread = 270; // Cover 270 degrees (3/4 of a circle)
        
        // Calculate angle for this item
        const angleStep = angleSpread / Math.max(totalItems - 1, 1);
        const angle = startAngle + (index * angleStep);
        const radian = (angle * Math.PI) / 180;

        return {
            x: Math.cos(radian) * radius,
            y: Math.sin(radian) * radius,
            angle
        };
    }, []);

    const handleItemClick = useCallback((itemId: string) => {
        onItemClick(itemId);
        onClose();
    }, [onItemClick, onClose]);

    const handleItemHover = useCallback((itemId: string | null) => {
        setHoveredItem(itemId);
    }, []);

    const containerClasses = [
        'radial-menu',
        className,
        isOpen && 'radial-menu--open',
        hoveredItem && 'radial-menu--item-hovered'
    ].filter(Boolean).join(' ');

    if (!isMounted) return null;

    return (
        <div className={containerClasses} role="menu" aria-hidden={!isOpen}>
            <div className="radial-menu__backdrop" />
            
            <div 
                ref={containerRef}
                className="radial-menu__container"
                role="none"
            >
                {/* Center button */}
                <button
                    className="radial-menu__center"
                    onClick={onClose}
                    aria-label="Close navigation menu"
                    type="button"
                >
                    <span className="radial-menu__center-icon" aria-hidden="true">
                        {centerIcon}
                    </span>
                    <span className="radial-menu__center-label">
                        {centerLabel}
                    </span>
                </button>

                {/* Navigation items */}
                {items.map((item, index) => {
                    const position = getItemPosition(index, items.length);
                    const isActive = activeItem === item.id;
                    const isHovered = hoveredItem === item.id;

                    const itemClasses = [
                        'radial-menu__item',
                        isActive && 'radial-menu__item--active',
                        isHovered && 'radial-menu__item--hovered'
                    ].filter(Boolean).join(' ');

                    return (
                        <div
                            key={item.id}
                            className={itemClasses}
                            style={{
                                '--item-x': `${position.x}px`,
                                '--item-y': `${position.y}px`,
                                '--item-delay': `${index * 0.05}s`,
                                '--item-angle': `${position.angle}deg`
                            } as React.CSSProperties}
                        >
                            <button
                                className="radial-menu__item-button"
                                onClick={() => handleItemClick(item.id)}
                                onMouseEnter={() => handleItemHover(item.id)}
                                onMouseLeave={() => handleItemHover(null)}
                                onFocus={() => handleItemHover(item.id)}
                                onBlur={() => handleItemHover(null)}
                                aria-label={`Navigate to ${item.label}`}
                                role="menuitem"
                                type="button"
                            >
                                <span className="radial-menu__item-label">
                                    {item.label}
                                </span>
                            </button>
                            
                            {/* Connection line to center */}
                            <div className="radial-menu__connection" />
                        </div>
                    );
                })}

                {/* Center glow effect */}
                <div className="radial-menu__glow" />
            </div>
        </div>
    );
};

export default RadialMenu;