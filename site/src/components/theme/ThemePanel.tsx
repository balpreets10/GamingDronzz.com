import { useEffect, useRef, useCallback, useState } from 'react';
import { getAvailableThemes, getThemesByCategory, type Theme } from '../../config/themes';
import ThemeSwatch from './ThemeSwatch';
import './ThemePanel.css';

interface ThemePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentThemeId: string | null;
    onThemeSelect: (themeId: string) => void;
}

interface CategoryThemes {
    light: Theme[];
    dark: Theme[];
    colorful: Theme[];
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    light: { label: 'Light', icon: '☀️' },
    dark: { label: 'Dark', icon: '🌙' },
    colorful: { label: 'Colorful', icon: '🎨' }
};

const ThemePanel: React.FC<ThemePanelProps> = ({
    isOpen,
    onClose,
    currentThemeId,
    onThemeSelect
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const [themes, setThemes] = useState<CategoryThemes>({
        light: [],
        dark: [],
        colorful: []
    });
    const [isLoading, setIsLoading] = useState(true);

    // Load themes on mount
    useEffect(() => {
        const loadThemes = async () => {
            setIsLoading(true);
            try {
                const [light, dark, colorful] = await Promise.all([
                    getThemesByCategory('light'),
                    getThemesByCategory('dark'),
                    getThemesByCategory('colorful')
                ]);
                setThemes({ light, dark, colorful });
            } catch (error) {
                console.error('Failed to load themes:', error);
                // Fallback to all themes
                const allThemes = await getAvailableThemes();
                setThemes({
                    light: allThemes.filter(t => t.category === 'light'),
                    dark: allThemes.filter(t => t.category === 'dark'),
                    colorful: allThemes.filter(t => t.category === 'colorful')
                });
            } finally {
                setIsLoading(false);
            }
        };
        loadThemes();
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            // Delay to prevent immediate close on open click
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen, onClose]);

    // Focus management
    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [isOpen]);

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleThemeClick = useCallback((themeId: string) => {
        onThemeSelect(themeId);
    }, [onThemeSelect]);

    const panelClasses = [
        'theme-panel',
        isOpen && 'theme-panel--open'
    ].filter(Boolean).join(' ');

    const renderCategory = (category: keyof CategoryThemes) => {
        const categoryThemes = themes[category];
        if (categoryThemes.length === 0) return null;

        const { label, icon } = CATEGORY_LABELS[category];

        return (
            <div className="theme-panel__section" key={category}>
                <h3 className="theme-panel__section-title">
                    <span className="theme-panel__section-icon">{icon}</span>
                    {label}
                </h3>
                <div className="theme-panel__grid" role="listbox" aria-label={`${label} themes`}>
                    {categoryThemes.map(theme => (
                        <ThemeSwatch
                            key={theme.id}
                            theme={theme}
                            isSelected={currentThemeId === theme.id}
                            onClick={() => handleThemeClick(theme.id)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`theme-panel__backdrop ${isOpen ? 'theme-panel__backdrop--visible' : ''}`}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={panelClasses}
                role="dialog"
                aria-modal="true"
                aria-labelledby="theme-panel-title"
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className="theme-panel__header">
                    <h2 id="theme-panel-title" className="theme-panel__title">
                        Select Theme
                    </h2>
                    <button
                        ref={closeButtonRef}
                        className="theme-panel__close"
                        onClick={onClose}
                        aria-label="Close theme selector"
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="theme-panel__content">
                    {isLoading ? (
                        <div className="theme-panel__loading">Loading themes...</div>
                    ) : (
                        <>
                            {renderCategory('light')}
                            {renderCategory('dark')}
                            {renderCategory('colorful')}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ThemePanel;
