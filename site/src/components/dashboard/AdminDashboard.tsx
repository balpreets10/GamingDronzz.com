import React, { useCallback, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import NavigationManager from '../../managers/NavigationManager';
import DashboardSidebar from './DashboardSidebar';
import DashboardOverview from './DashboardOverview';
import DashboardProjects from './DashboardProjects';
import DashboardArticles from './DashboardArticles';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const { isAdmin } = useAuth();
    const [activeSection, setActiveSection] = useState('overview');

    const handleBackToApp = useCallback(() => {
        const navManager = NavigationManager.getInstance();
        navManager.exitDashboard();
    }, []);

    const handleSectionChange = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <DashboardOverview />;
            case 'projects':
                return <DashboardProjects />;
            case 'articles':
                return <DashboardArticles />;
            default:
                return <DashboardOverview />;
        }
    };

    if (!isAdmin) {
        return (
            <div className="admin-dashboard admin-dashboard--unauthorized">
                <div className="admin-dashboard__unauthorized">
                    <div className="admin-dashboard__unauthorized-icon">🚫</div>
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to access this dashboard.</p>
                    <button 
                        className="admin-dashboard__back-btn"
                        onClick={handleBackToApp}
                    >
                        ← Back to Main App
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <DashboardSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onBackToApp={handleBackToApp}
            />
            
            <main className="admin-dashboard__main">
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;