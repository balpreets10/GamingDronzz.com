import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './AdminHeader.css';

interface AdminHeaderProps {
  user: any;
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onToggleSidebar }) => {
  const { signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="breadcrumb">
          <span className="breadcrumb-item">Admin Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <div className="notifications">
          <button className="notification-btn" title="Notifications">
            <span className="notification-icon">🔔</span>
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="user-menu">
          <button 
            className="user-avatar"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <img 
              src={user.avatar_url || '/default-avatar.png'} 
              alt={user.full_name || user.email}
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
            <span className="user-info">
              <span className="user-name">{user.full_name || 'Admin'}</span>
              <span className="user-role">{user.role}</span>
            </span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-name">{user.full_name || user.email}</span>
                <span className="dropdown-email">{user.email}</span>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item">
                <span>⚙️</span>
                Settings
              </button>
              
              <button className="dropdown-item">
                <span>👤</span>
                Profile
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item danger" onClick={handleSignOut}>
                <span>🚪</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {showDropdown && (
        <div 
          className="dropdown-backdrop"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
};

export default AdminHeader;