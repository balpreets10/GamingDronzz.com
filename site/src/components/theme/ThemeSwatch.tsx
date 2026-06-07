import { useCallback } from 'react';
import type { Theme } from '../../config/themes';
import './ThemeSwatch.css';

interface ThemeSwatchProps {
    theme: Theme;
    isSelected: boolean;
    onClick: () => void;
}

const ThemeSwatch: React.FC<ThemeSwatchProps> = ({ theme, isSelected, onClick }) => {
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
        }
    }, [onClick]);

    const swatchClasses = [
        'theme-swatch',
        isSelected && 'theme-swatch--selected'
    ].filter(Boolean).join(' ');

    return (
        <button
            className={swatchClasses}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={`${theme.name} theme${isSelected ? ' (selected)' : ''}`}
        >
            <div className="theme-swatch__preview">
                <span
                    className="theme-swatch__color theme-swatch__color--primary"
                    style={{ backgroundColor: theme.colors.primary }}
                    title="Primary"
                />
                <span
                    className="theme-swatch__color theme-swatch__color--secondary"
                    style={{ backgroundColor: theme.colors.secondary }}
                    title="Secondary"
                />
                <span
                    className="theme-swatch__color theme-swatch__color--accent"
                    style={{ backgroundColor: theme.colors.accent }}
                    title="Accent"
                />
                <span
                    className="theme-swatch__color theme-swatch__color--background"
                    style={{ backgroundColor: theme.colors.background }}
                    title="Background"
                />
                <span
                    className="theme-swatch__color theme-swatch__color--text"
                    style={{ backgroundColor: theme.colors.text }}
                    title="Text"
                />
            </div>
            <div className="theme-swatch__info">
                <span className="theme-swatch__icon">{theme.icon}</span>
                <span className="theme-swatch__name">{theme.name}</span>
            </div>
            {isSelected && (
                <span className="theme-swatch__check" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                </span>
            )}
        </button>
    );
};

export default ThemeSwatch;
