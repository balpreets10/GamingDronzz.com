import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import './DashboardOverview.css';

interface DashboardStats {
    projects: {
        total: number;
        published: number;
        drafts: number;
        featured: number;
    };
    articles: {
        total: number;
        published: number;
        drafts: number;
        featured: number;
    };
    inquiries: {
        total: number;
        new: number;
        pending: number;
        resolved: number;
    };
    analytics: {
        total_page_views: number;
        recent_page_views: number;
    };
    users: {
        total: number;
        admins: number;
        active: number;
    };
    media: {
        total_files: number;
    };
    generated_at: string;
}

const DashboardOverview: React.FC = () => {
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAdmin) {
            fetchDashboardStats();
        }
    }, [isAdmin]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: rpcError } = await supabase
                .rpc('get_admin_dashboard_stats');

            if (rpcError) {
                throw rpcError;
            }

            setStats(data);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const getStatusColor = (value: number, total: number): string => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        if (percentage >= 70) return 'success';
        if (percentage >= 40) return 'warning';
        return 'error';
    };

    if (!isAdmin) {
        return (
            <div className="dashboard-overview dashboard-overview--unauthorized">
                <div className="dashboard-overview__error">
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to view this dashboard.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="dashboard-overview dashboard-overview--loading">
                <div className="dashboard-overview__loading">
                    <div className="dashboard-overview__spinner"></div>
                    <p>Loading dashboard statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-overview dashboard-overview--error">
                <div className="dashboard-overview__error">
                    <h2>Error Loading Dashboard</h2>
                    <p>{error}</p>
                    <button 
                        className="dashboard-overview__retry-btn"
                        onClick={fetchDashboardStats}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="dashboard-overview dashboard-overview--no-data">
                <div className="dashboard-overview__error">
                    <h2>No Data Available</h2>
                    <p>Dashboard statistics could not be loaded.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-overview">
            <header className="dashboard-overview__header">
                <div className="dashboard-overview__title">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome to your admin dashboard. Here's a quick overview of your site's performance.</p>
                </div>
                <button 
                    className="dashboard-overview__refresh-btn"
                    onClick={fetchDashboardStats}
                >
                    🔄 Refresh
                </button>
            </header>

            <div className="dashboard-overview__stats">
                {/* Projects Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">🎮</span>
                        Projects
                    </h2>
                    <div className="dashboard-overview__stat-grid">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.projects.total)}</div>
                            <div className="dashboard-overview__stat-label">Total Projects</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className={`dashboard-overview__stat-value dashboard-overview__stat-value--${getStatusColor(stats.projects.published, stats.projects.total)}`}>
                                {formatNumber(stats.projects.published)}
                            </div>
                            <div className="dashboard-overview__stat-label">Published</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.projects.drafts)}</div>
                            <div className="dashboard-overview__stat-label">Drafts</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.projects.featured)}</div>
                            <div className="dashboard-overview__stat-label">Featured</div>
                        </div>
                    </div>
                </div>

                {/* Articles Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">📝</span>
                        Articles
                    </h2>
                    <div className="dashboard-overview__stat-grid">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.articles.total)}</div>
                            <div className="dashboard-overview__stat-label">Total Articles</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className={`dashboard-overview__stat-value dashboard-overview__stat-value--${getStatusColor(stats.articles.published, stats.articles.total)}`}>
                                {formatNumber(stats.articles.published)}
                            </div>
                            <div className="dashboard-overview__stat-label">Published</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.articles.drafts)}</div>
                            <div className="dashboard-overview__stat-label">Drafts</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.articles.featured)}</div>
                            <div className="dashboard-overview__stat-label">Featured</div>
                        </div>
                    </div>
                </div>

                {/* Inquiries Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">📧</span>
                        Inquiries
                    </h2>
                    <div className="dashboard-overview__stat-grid">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.inquiries.total)}</div>
                            <div className="dashboard-overview__stat-label">Total Inquiries</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value dashboard-overview__stat-value--warning">{formatNumber(stats.inquiries.new)}</div>
                            <div className="dashboard-overview__stat-label">New</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.inquiries.pending)}</div>
                            <div className="dashboard-overview__stat-label">Pending</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value dashboard-overview__stat-value--success">{formatNumber(stats.inquiries.resolved)}</div>
                            <div className="dashboard-overview__stat-label">Resolved</div>
                        </div>
                    </div>
                </div>

                {/* Analytics Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">📊</span>
                        Analytics
                    </h2>
                    <div className="dashboard-overview__stat-grid dashboard-overview__stat-grid--wide">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.analytics.total_page_views)}</div>
                            <div className="dashboard-overview__stat-label">Total Page Views</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value dashboard-overview__stat-value--success">{formatNumber(stats.analytics.recent_page_views)}</div>
                            <div className="dashboard-overview__stat-label">Recent Views (30d)</div>
                        </div>
                    </div>
                </div>

                {/* Users Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">👥</span>
                        Users
                    </h2>
                    <div className="dashboard-overview__stat-grid">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.users.total)}</div>
                            <div className="dashboard-overview__stat-label">Total Users</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.users.admins)}</div>
                            <div className="dashboard-overview__stat-label">Admins</div>
                        </div>
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value dashboard-overview__stat-value--success">{formatNumber(stats.users.active)}</div>
                            <div className="dashboard-overview__stat-label">Active</div>
                        </div>
                    </div>
                </div>

                {/* Media Stats */}
                <div className="dashboard-overview__stat-section">
                    <h2 className="dashboard-overview__section-title">
                        <span className="dashboard-overview__section-icon">📁</span>
                        Media
                    </h2>
                    <div className="dashboard-overview__stat-grid dashboard-overview__stat-grid--single">
                        <div className="dashboard-overview__stat-card">
                            <div className="dashboard-overview__stat-value">{formatNumber(stats.media.total_files)}</div>
                            <div className="dashboard-overview__stat-label">Total Media Files</div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="dashboard-overview__footer">
                <p>Last updated: {new Date(stats.generated_at).toLocaleString()}</p>
            </footer>
        </div>
    );
};

export default DashboardOverview;