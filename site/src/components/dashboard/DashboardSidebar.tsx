import React from 'react';
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
    const sidebarItems: SidebarItem[] = [
        {
            id: 'overview',
            label: 'Overview',
            icon: '📊',
            isActive: activeSection === 'overview',
            onClick: () => onSectionChange('overview')
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: '🎮',
            isActive: activeSection === 'projects',
            onClick: () => onSectionChange('projects')
        },
        {
            id: 'articles',
            label: 'Articles',
            icon: '📰',
            isActive: activeSection === 'articles',
            onClick: () => onSectionChange('articles')
        }
    ];

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