// components/ui/NotificationContainer.tsx
import React, { useState, useEffect } from 'react';
import NotificationManager from '../../utils/NotificationManager';
import './NotificationContainer.css';

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
    timestamp: number;
}

const NotificationContainer: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = NotificationManager.getInstance().subscribe(setNotifications);
        return unsubscribe;
    }, []);

    const handleClose = (id: string) => {
        const notification = document.querySelector(`[data-notification-id="${id}"]`);
        if (notification) {
            notification.classList.add('notification--leaving');
            setTimeout(() => {
                NotificationManager.getInstance().remove(id);
            }, 200);
        } else {
            NotificationManager.getInstance().remove(id);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': return 'ℹ';
            default: return 'ℹ';
        }
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="notifications-container">
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    data-notification-id={notification.id}
                    className={`notification notification--${notification.type}`}
                    role="alert"
                    aria-live="polite"
                >
                    <div className="notification__icon">
                        {getIcon(notification.type)}
                    </div>
                    <div className="notification__content">
                        <p className="notification__message">
                            {notification.message}
                        </p>
                    </div>
                    <button
                        className="notification__close"
                        onClick={() => handleClose(notification.id)}
                        aria-label="Close notification"
                        type="button"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M9 3L3 9M3 3L9 9"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationContainer;