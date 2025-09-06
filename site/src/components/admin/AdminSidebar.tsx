import React from 'react';
import './AdminSidebar.css';

interface AdminSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onViewChange,
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onToggleMobile
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'articles', label: 'Articles', icon: '📝' },
    { id: 'inquiries', label: 'Inquiries', icon: '📬' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">🎮</div>
          {!collapsed && <h2 className="logo-text">Gaming Dronzz</h2>}
        </div>
        <button 
          className="collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  onViewChange(item.id);
                  // Close mobile sidebar when navigating on mobile
                  if (window.innerWidth <= 1024) {
                    onToggleMobile();
                  }
                }}
                title={collapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-status">
          <div className="status-indicator active"></div>
          {!collapsed && <span>Admin Panel</span>}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;