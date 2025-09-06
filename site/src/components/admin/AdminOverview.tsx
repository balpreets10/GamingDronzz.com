import React, { useState, useEffect, useRef } from 'react';
import SupabaseService from '../../services/SupabaseService';
import './AdminOverview.css';

interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalArticles: number;
  publishedArticles: number;
  totalInquiries: number;
  newInquiries: number;
  totalPageViews: number;
  totalMediaFiles: number;
}

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    publishedProjects: 0,
    totalArticles: 0,
    publishedArticles: 0,
    totalInquiries: 0,
    newInquiries: 0,
    totalPageViews: 0,
    totalMediaFiles: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const maxRetries = 3;

  useEffect(() => {
    loadDashboardData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [retryCount]);

  const loadDashboardData = async () => {
    if (!mountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 AdminOverview: Starting to load dashboard data...');
      
      // Create promises with timeouts
      const timeout = (ms: number) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      );
      
      const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => 
        Promise.race([promise, timeout(ms)]) as Promise<T>;

      // Load all data in parallel with timeout (10 seconds each)
      const [projectsData, articlesData, inquiriesData, pageViewsData, mediaData] = await Promise.allSettled([
        withTimeout(SupabaseService.getProjects().catch(() => []), 10000),
        withTimeout(SupabaseService.getArticles().catch(() => []), 10000),
        withTimeout(SupabaseService.getInquiries().catch(() => []), 10000),
        withTimeout(SupabaseService.getPageViews().catch(() => []), 10000),
        withTimeout(SupabaseService.getMediaFiles().catch(() => []), 10000)
      ]);

      // Extract successful data or use empty arrays
      const projects = projectsData.status === 'fulfilled' ? projectsData.value : [];
      const articles = articlesData.status === 'fulfilled' ? articlesData.value : [];
      const inquiries = inquiriesData.status === 'fulfilled' ? inquiriesData.value : [];
      const pageViews = pageViewsData.status === 'fulfilled' ? pageViewsData.value : [];
      const media = mediaData.status === 'fulfilled' ? mediaData.value : [];

      // Check for failures but don't block the UI
      const failures = [projectsData, articlesData, inquiriesData, pageViewsData, mediaData]
        .filter(result => result.status === 'rejected').length;
      
      if (failures > 0) {
        console.warn(`⚠️ AdminOverview: ${failures} data sources failed to load`);
      }

      if (!mountedRef.current) return;

      console.log('✅ Dashboard data processed:', {
        projects: projects?.length || 0,
        articles: articles?.length || 0,
        inquiries: inquiries?.length || 0,
        pageViews: pageViews?.length || 0,
        media: media?.length || 0,
        failures
      });

      setStats({
        totalProjects: projects?.length || 0,
        publishedProjects: projects?.filter((p: any) => p.published)?.length || 0,
        totalArticles: articles?.length || 0,
        publishedArticles: articles?.filter((a: any) => a.published)?.length || 0,
        totalInquiries: inquiries?.length || 0,
        newInquiries: inquiries?.filter((i: any) => i.status === 'new')?.length || 0,
        totalPageViews: pageViews?.length || 0,
        totalMediaFiles: media?.length || 0
      });

      // Load recent activity (simplified and safe)
      const recentItems = [
        ...(articles?.slice(0, 3).map((article: any) => ({
          type: 'article',
          title: article?.title || 'Untitled Article',
          date: article?.created_at || new Date().toISOString(),
          status: article?.published ? 'Published' : 'Draft'
        })) || []),
        ...(inquiries?.slice(0, 3).map((inquiry: any) => ({
          type: 'inquiry',
          title: inquiry?.subject || 'No Subject',
          date: inquiry?.created_at || new Date().toISOString(),
          status: inquiry?.status || 'pending'
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

      if (mountedRef.current) {
        setRecentActivity(recentItems);
      }
    } catch (error) {
      console.error('❌ AdminOverview: Critical error loading dashboard data:', error);
      if (mountedRef.current) {
        setError('Failed to load dashboard data. Some features may be unavailable.');
        
        // Set basic stats so the UI doesn't break
        setStats({
          totalProjects: 0,
          publishedProjects: 0,
          totalArticles: 0,
          publishedArticles: 0,
          totalInquiries: 0,
          newInquiries: 0,
          totalPageViews: 0,
          totalMediaFiles: 0
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="admin-overview loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
        <small>This may take a moment on first load</small>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      subtitle: `${stats.publishedProjects} published`,
      icon: '🚀',
      color: 'blue'
    },
    {
      title: 'Total Articles',
      value: stats.totalArticles,
      subtitle: `${stats.publishedArticles} published`,
      icon: '📝',
      color: 'green'
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      subtitle: `${stats.newInquiries} new`,
      icon: '📬',
      color: 'orange'
    },
    {
      title: 'Page Views',
      value: stats.totalPageViews.toLocaleString(),
      subtitle: 'Total visits',
      icon: '👥',
      color: 'purple'
    }
  ];

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your admin dashboard. Here's what's happening with your site.</p>
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            {retryCount < maxRetries && (
              <button onClick={handleRetry} className="retry-btn">
                Retry ({maxRetries - retryCount} attempts left)
              </button>
            )}
          </div>
        )}
      </div>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3 className="stat-value">{card.value}</h3>
              <p className="stat-title">{card.title}</p>
              <p className="stat-subtitle">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-grid">
        <div className="overview-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-btn">View All</button>
          </div>
          
          <div className="activity-list">
            {recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {item.type === 'article' ? '📝' : '📬'}
                </div>
                <div className="activity-content">
                  <h4>{item.title}</h4>
                  <p className="activity-meta">
                    {item.type} • {item.status} • {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <button className="action-btn primary">
              <span className="action-icon">➕</span>
              New Project
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">📝</span>
              New Article
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">📊</span>
              View Analytics
            </button>
            <button className="action-btn secondary">
              <span className="action-icon">🖼️</span>
              Media Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;