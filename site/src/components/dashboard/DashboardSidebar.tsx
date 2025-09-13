import React, { useEffect, useState } from 'react';
import { getDashboardNavigation, type NavigationItem } from '../../utils/navigationData';
import './DashboardSidebar.css';

interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    isActive?: boolean;
    onClick: () => void;
}

interface DashboardSidebarProps {
    activeSection: string;
    onSectionChange: (sectionId: string) => void;
    onBackToApp: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
    activeSection,
    onSectionChange,
    onBackToApp
}) => {
    const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                setIsLoading(true);
                const navItems = await getDashboardNavigation();
                setNavigationItems(navItems);
            } catch (error) {
                console.error('Failed to load dashboard navigation:', error);
                // Fallback navigation
                setNavigationItems([
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'projects', label: 'Projects', icon: '🎮' },
                    { id: 'articles', label: 'Articles', icon: '📰' }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadNavigation();
    }, []);

    const sidebarItems: SidebarItem[] = navigationItems.map(item => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        isActive: activeSection === item.id,
        onClick: () => onSectionChange(item.id)
    }));

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-sidebar__header">
                <div className="dashboard-sidebar__logo">
                    <span className="dashboard-sidebar__logo-icon">🎯</span>
                    <h2 className="dashboard-sidebar__logo-text">Dashboard</h2>
                </div>
                <button 
                    className="dashboard-sidebar__back-btn"
                    onClick={onBackToApp}
                    title="Back to Main App"
                >
                    ←
                </button>
            </div>

            <nav className="dashboard-sidebar__nav">
                <ul className="dashboard-sidebar__nav-list">
                    {sidebarItems.map((item) => (
                        <li key={item.id} className="dashboard-sidebar__nav-item">
                            <button
                                className={`dashboard-sidebar__nav-button ${
                                    item.isActive ? 'dashboard-sidebar__nav-button--active' : ''
                                }`}
                                onClick={item.onClick}
                            >
                                <span className="dashboard-sidebar__nav-icon">{item.icon}</span>
                                <span className="dashboard-sidebar__nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="dashboard-sidebar__footer">
                <div className="dashboard-sidebar__status">
                    <div className="dashboard-sidebar__status-indicator dashboard-sidebar__status-indicator--online"></div>
                    <span className="dashboard-sidebar__status-text">Online</span>
                </div>
            </div>
        </aside>
    );
};

export default DashboardSidebar;