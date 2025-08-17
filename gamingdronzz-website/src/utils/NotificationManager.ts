// utils/NotificationManager.ts - Simple notification system
interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration: number;
    timestamp: number;
}

type NotificationSubscriber = (notifications: Notification[]) => void;

class NotificationManager {
    private static instance: NotificationManager;
    private notifications: Notification[] = [];
    private subscribers: Set<NotificationSubscriber> = new Set();
    private nextId = 1;

    static getInstance(): NotificationManager {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new NotificationManager();
        }
        return NotificationManager.instance;
    }

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 5000): string {
        const notification: Notification = {
            id: `notification-${this.nextId++}`,
            message,
            type,
            duration,
            timestamp: Date.now()
        };

        this.notifications.push(notification);
        this.notify();

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }

        return notification.id;
    }

    remove(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.notify();
    }

    clear(): void {
        this.notifications = [];
        this.notify();
    }

    subscribe(callback: NotificationSubscriber): () => void {
        this.subscribers.add(callback);
        callback(this.notifications); // Send current state
        return () => this.subscribers.delete(callback);
    }

    private notify(): void {
        this.subscribers.forEach(callback => callback([...this.notifications]));
    }

    // Helper methods
    success(message: string, duration = 5000): string {
        return this.show(message, 'success', duration);
    }

    error(message: string, duration = 8000): string {
        return this.show(message, 'error', duration);
    }

    info(message: string, duration = 5000): string {
        return this.show(message, 'info', duration);
    }

    warning(message: string, duration = 6000): string {
        return this.show(message, 'warning', duration);
    }
}

export default NotificationManager;