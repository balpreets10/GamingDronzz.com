// src/components/ui/ThemeSwitcher.tsx
import { useState, useEffect } from 'react';
import {
    availableThemes,
    applyTheme,
    getCurrentTheme,
    getAutoSelectedTheme,
    isAutoThemeEnabled,
    setAutoThemeMode,
    rotateToNewTheme,
    ThemeOption
} from '../../utils/helpers';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
    const [currentTheme, setCurrentTheme] = useState<string>('default');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

    // Load current theme and mode on component mount
    useEffect(() => {
        const autoModeEnabled = isAutoThemeEnabled();
        setIsAutoMode(autoModeEnabled);

        if (autoModeEnabled) {
            const autoTheme = getAutoSelectedTheme() || 'default';
            setCurrentTheme(autoTheme);
        } else {
            const savedTheme = localStorage.getItem('gd-theme') || 'default';
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
        }
    }, []);

    // Handle manual theme selection
    const handleThemeSelect = (themeId: string) => {
        setCurrentTheme(themeId);
        applyTheme(themeId);

        // Switch to manual mode when user manually selects a theme
        setAutoThemeMode(false);
        setIsAutoMode(false);
        localStorage.setItem('gd-theme', themeId);
        setIsOpen(false);

        // Analytics tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'theme_switch', {
                theme_name: themeId,
                custom_parameter: 'manual_selection'
            });
        }
    };

    // Toggle between auto and manual mode
    const handleModeToggle = () => {
        const newAutoMode = !isAutoMode;
        setIsAutoMode(newAutoMode);
        setAutoThemeMode(newAutoMode);

        if (newAutoMode) {
            // Switching to auto mode - rotate to a new theme
            const newTheme = rotateToNewTheme();
            setCurrentTheme(newTheme.id);
        }

        setIsOpen(false);
    };

    // Manually rotate theme (only available in auto mode)
    const handleRotateTheme = () => {
        if (isAutoMode) {
            const newTheme = rotateToNewTheme();
            setCurrentTheme(newTheme.id);
            setIsOpen(false);
        }
    };

    const currentThemeData = availableThemes.find(t => t.id === currentTheme) || availableThemes[0];

    return (
        <div className="theme-switcher">
            <button
                className="theme-switcher__trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Switch theme"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="theme-switcher__icon">
                    {currentThemeData.icon}
                </span>
                <span className="theme-switcher__label">
                    {isAutoMode ? `Auto: ${currentThemeData.name}` : currentThemeData.name}
                </span>
                <span className={`theme-switcher__arrow ${isOpen ? 'theme-switcher__arrow--open' : ''}`}>
                    ▼
                </span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="theme-switcher__backdrop"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />
                    <div
                        className="theme-switcher__dropdown"
                        role="listbox"
                        aria-label="Available themes"
                    >
                        <div className="theme-switcher__header">
                            <h3 className="theme-switcher__title">Theme Settings</h3>
                            <p className="theme-switcher__subtitle">
                                {isAutoMode
                                    ? 'Auto mode: New theme every refresh'
                                    : 'Manual mode: Choose your preferred theme'
                                }
                            </p>
                        </div>

                        {/* Mode Controls */}
                        <div className="theme-switcher__controls">
                            <button
                                className={`theme-switcher__mode-btn ${isAutoMode ? 'theme-switcher__mode-btn--active' : ''}`}
                                onClick={handleModeToggle}
                            >
                                <span className="theme-switcher__mode-icon">
                                    {isAutoMode ? '🎲' : '👤'}
                                </span>
                                <div className="theme-switcher__mode-info">
                                    <span className="theme-switcher__mode-title">
                                        {isAutoMode ? 'Auto Rotation' : 'Manual Selection'}
                                    </span>
                                    <span className="theme-switcher__mode-desc">
                                        {isAutoMode
                                            ? 'New theme every page refresh'
                                            : 'Choose and keep your favorite'
                                        }
                                    </span>
                                </div>
                                <span className="theme-switcher__mode-toggle">
                                    {isAutoMode ? 'Switch to Manual' : 'Switch to Auto'}
                                </span>
                            </button>

                            {isAutoMode && (
                                <button
                                    className="theme-switcher__rotate-btn"
                                    onClick={handleRotateTheme}
                                >
                                    <span>🔄</span>
                                    Rotate to New Theme
                                </button>
                            )}
                        </div>

                        {!isAutoMode && (
                            <div className="theme-switcher__grid">
                                {availableThemes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={`theme-switcher__option ${currentTheme === theme.id ? 'theme-switcher__option--active' : ''}`}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        role="option"
                                        aria-selected={currentTheme === theme.id}
                                        aria-label={`Switch to ${theme.name} theme`}
                                    >
                                        <div className="theme-switcher__preview">
                                            <div
                                                className="theme-switcher__color-sample"
                                                style={{
                                                    background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                                                }}
                                            />
                                            <div
                                                className="theme-switcher__bg-sample"
                                                style={{ backgroundColor: theme.colors.bg }}
                                            />
                                        </div>

                                        <div className="theme-switcher__info">
                                            <div className="theme-switcher__name">
                                                <span className="theme-switcher__emoji">{theme.icon}</span>
                                                {theme.name}
                                            </div>
                                            <p className="theme-switcher__description">
                                                {theme.description}
                                            </p>
                                        </div>

                                        {currentTheme === theme.id && (
                                            <div className="theme-switcher__checkmark">✓</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="theme-switcher__footer">
                            <p className="theme-switcher__note">
                                {isAutoMode
                                    ? 'Auto mode applies a random theme on each page refresh for a fresh experience'
                                    : 'Theme preference is saved to your browser'
                                }
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ThemeSwitcher;