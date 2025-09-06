import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminOverview from '../../components/admin/AdminOverview';
import ProjectsManager from '../../components/admin/ProjectsManager';
import ArticlesManager from '../../components/admin/ArticlesManager';
import InquiriesManager from '../../components/admin/InquiriesManager';
import MediaManager from '../../components/admin/MediaManager';
import AnalyticsView from '../../components/admin/AnalyticsView';
import './AdminDashboard.css';

type AdminView = 'overview' | 'projects' | 'articles' | 'inquiries' | 'media' | 'analytics';

const AdminDashboard: React.FC = () => {
  const { user, profile, loading, isAdmin, isAuthenticated } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  console.log('🏠 AdminDashboard render:', { user: !!user, profile: !!profile, loading, isAdmin, isAuthenticated });

  // Handle auth timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set a timeout for auth loading (8 seconds)
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && loading) {
          console.warn('⚠️ AdminDashboard: Auth timeout reached, showing timeout state');
          setAuthTimeout(true);
        }
      }, 8000);
    } else {
      // Clear timeout when loading completes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setAuthTimeout(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading]);

  // Set dashboard ready when auth resolves - simplified logic
  useEffect(() => {
    if (!loading && !authTimeout) {
      if (mountedRef.current) {
        // Small delay to ensure all state updates are complete
        const readyTimer = setTimeout(() => {
          if (mountedRef.current) {
            setDashboardReady(true);
          }
        }, 100);
        
        return () => clearTimeout(readyTimer);
      }
    } else if (authTimeout) {
      // Set ready state for timeout handling
      setDashboardReady(true);
    }
  }, [loading, authTimeout]);

  // Reset dashboard state when user logs out or auth state changes
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      console.log('🔄 AdminDashboard: Resetting state due to logout');
      setDashboardReady(false);
      setActiveView('overview');
      setSidebarCollapsed(false);
      setSidebarMobileOpen(false);
    }
  }, [isAuthenticated, loading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show auth timeout state
  if (authTimeout && !isAuthenticated) {
    return (
      <div className="admin-loading">
        <div className="loading-error">
          <h3>Authentication Timeout</h3>
          <p>Unable to verify authentication. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading && !authTimeout) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
        <small>This shouldn't take more than a few seconds</small>
      </div>
    );
  }

  // Redirect if not authenticated
  if (dashboardReady && !user) {
    console.log('❌ AdminDashboard: No user found, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (dashboardReady && !isAuthenticated) {
    console.log('❌ AdminDashboard: User not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (dashboardReady && !isAdmin) {
    console.log('❌ AdminDashboard: User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Don't render dashboard until auth is resolved
  if (!dashboardReady) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Preparing dashboard...</p>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <AdminOverview />;
      case 'projects':
        return <ProjectsManager />;
      case 'articles':
        return <ArticlesManager />;
      case 'inquiries':
        return <InquiriesManager />;
      case 'media':
        return <MediaManager />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar 
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onToggleMobile={() => setSidebarMobileOpen(!sidebarMobileOpen)}
      />
      
      {sidebarMobileOpen && <div className="sidebar-overlay" onClick={() => setSidebarMobileOpen(false)} />}
      
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <AdminHeader 
          user={user}
          onToggleSidebar={() => setSidebarMobileOpen(!sidebarMobileOpen)}
        />
        
        <main className="admin-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;