import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/SupabaseService';
import './AnalyticsView.css';

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ page: string; views: number }>;
  recentViews: Array<{ page: string; timestamp: string; referrer?: string }>;
  articleViews: Array<{ title: string; views: number }>;
  projectViews: Array<{ title: string; views: number }>;
  referrers: Array<{ referrer: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
}

const AnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPageViews: 0,
    uniqueVisitors: 0,
    topPages: [],
    recentViews: [],
    articleViews: [],
    projectViews: [],
    referrers: [],
    dailyViews: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get page views data
      const pageViews = await SupabaseService.getPageViews();
      const articles = await SupabaseService.getArticles();
      const projects = await SupabaseService.getProjects();
      
      if (!pageViews) {
        setLoading(false);
        return;
      }

      // Filter data based on time range
      const now = new Date();
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      const filteredViews = pageViews.filter((view: any) => 
        new Date(view.created_at) >= startDate
      );

      // Calculate total page views
      const totalPageViews = filteredViews.length;
      
      // Calculate unique visitors (based on session_id or ip_address)
      const uniqueSessions = new Set(filteredViews.map((view: any) => 
        view.session_id || view.ip_address
      ));
      const uniqueVisitors = uniqueSessions.size;

      // Top pages
      const pageViewCounts: { [key: string]: number } = {};
      filteredViews.forEach((view: any) => {
        pageViewCounts[view.page_path] = (pageViewCounts[view.page_path] || 0) + 1;
      });
      
      const topPages = Object.entries(pageViewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([page, views]) => ({ page, views }));

      // Recent views (last 20)
      const recentViews = filteredViews
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
        .map((view: any) => ({
          page: view.page_path,
          timestamp: view.created_at,
          referrer: view.referrer
        }));

      // Article views
      const articleViews = articles?.map((article: any) => ({
        title: article.title,
        views: article.view_count || 0
      })).sort((a: any, b: any) => b.views - a.views).slice(0, 10) || [];

      // Project views (simulate based on page views to project pages)
      const projectViews = projects?.map((project: any) => {
        const projectPageViews = filteredViews.filter((view: any) => 
          view.page_path.includes(project.slug)
        ).length;
        return {
          title: project.title,
          views: projectPageViews
        };
      }).sort((a: any, b: any) => b.views - a.views).slice(0, 10) || [];

      // Top referrers
      const referrerCounts: { [key: string]: number } = {};
      filteredViews.forEach((view: any) => {
        if (view.referrer && view.referrer !== 'direct') {
          const domain = new URL(view.referrer).hostname;
          referrerCounts[domain] = (referrerCounts[domain] || 0) + 1;
        }
      });
      
      const referrers = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count }));

      // Daily views for the time period
      const dailyViewCounts: { [key: string]: number } = {};
      filteredViews.forEach((view: any) => {
        const date = new Date(view.created_at).toISOString().split('T')[0];
        dailyViewCounts[date] = (dailyViewCounts[date] || 0) + 1;
      });
      
      const dailyViews = Object.entries(dailyViewCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, views]) => ({ date, views }));

      setAnalyticsData({
        totalPageViews,
        uniqueVisitors,
        topPages,
        recentViews,
        articleViews,
        projectViews,
        referrers,
        dailyViews
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageDisplayName = (path: string) => {
    if (path === '/') return 'Homepage';
    if (path.startsWith('/projects/')) return `Project: ${path.split('/').pop()}`;
    if (path.startsWith('/articles/')) return `Article: ${path.split('/').pop()}`;
    return path;
  };

  if (loading) {
    return (
      <div className="analytics-view loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="analytics-view">
      <div className="analytics-header">
        <div className="header-left">
          <h1>Analytics Dashboard</h1>
          <p>Website traffic and engagement metrics</p>
        </div>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="analytics-stats">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-value">{analyticsData.totalPageViews.toLocaleString()}</h3>
            <p className="stat-label">Total Page Views</p>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3 className="stat-value">{analyticsData.uniqueVisitors.toLocaleString()}</h3>
            <p className="stat-label">Unique Visitors</p>
          </div>
        </div>
        
        <div className="stat-card accent">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">
              {analyticsData.totalPageViews > 0 ? 
                (analyticsData.totalPageViews / analyticsData.uniqueVisitors).toFixed(1) : '0'
              }
            </h3>
            <p className="stat-label">Avg. Pages per Visit</p>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3 className="stat-value">{analyticsData.referrers.length}</h3>
            <p className="stat-label">Referral Sources</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section chart-section">
          <div className="section-header">
            <h2>Daily Page Views</h2>
          </div>
          <div className="simple-chart">
            {analyticsData.dailyViews.length > 0 ? (
              <div className="chart-bars">
                {analyticsData.dailyViews.map((day, index) => {
                  const maxViews = Math.max(...analyticsData.dailyViews.map(d => d.views));
                  const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
                  return (
                    <div key={index} className="chart-bar" title={`${day.date}: ${day.views} views`}>
                      <div 
                        className="bar-fill" 
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="bar-label">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="bar-value">{day.views}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>No data available for the selected period</p>
              </div>
            )}
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2>Top Pages</h2>
            <span className="section-count">{analyticsData.topPages.length} pages</span>
          </div>
          <div className="data-list">
            {analyticsData.topPages.map((page, index) => (
              <div key={index} className="data-item">
                <div className="data-rank">#{index + 1}</div>
                <div className="data-content">
                  <h4 className="data-title">{getPageDisplayName(page.page)}</h4>
                  <p className="data-subtitle">{page.page}</p>
                </div>
                <div className="data-value">{page.views}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2>Top Articles</h2>
            <span className="section-count">{analyticsData.articleViews.length} articles</span>
          </div>
          <div className="data-list">
            {analyticsData.articleViews.map((article, index) => (
              <div key={index} className="data-item">
                <div className="data-rank">#{index + 1}</div>
                <div className="data-content">
                  <h4 className="data-title">{article.title}</h4>
                </div>
                <div className="data-value">{article.views}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <div className="section-header">
            <h2>Top Referrers</h2>
            <span className="section-count">{analyticsData.referrers.length} sources</span>
          </div>
          <div className="data-list">
            {analyticsData.referrers.map((referrer, index) => (
              <div key={index} className="data-item">
                <div className="data-rank">#{index + 1}</div>
                <div className="data-content">
                  <h4 className="data-title">{referrer.referrer}</h4>
                </div>
                <div className="data-value">{referrer.count}</div>
              </div>
            ))}
            {analyticsData.referrers.length === 0 && (
              <div className="no-data">
                <p>No referral traffic in the selected period</p>
              </div>
            )}
          </div>
        </div>

        <div className="analytics-section recent-activity">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <span className="section-count">Last 20 visits</span>
          </div>
          <div className="activity-list">
            {analyticsData.recentViews.map((view, index) => (
              <div key={index} className="activity-item">
                <div className="activity-content">
                  <h5 className="activity-page">{getPageDisplayName(view.page)}</h5>
                  <p className="activity-meta">
                    {formatDate(view.timestamp)}
                    {view.referrer && (
                      <span className="activity-referrer">
                        from {new URL(view.referrer).hostname}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;