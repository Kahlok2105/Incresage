import { useState } from "react";

/**
 * Notification type definition
 */
type NotificationType = "success" | "failure" | "info";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration?: number;
}

/**
 * Custom hook for managing notifications throughout the application.
 * Provides methods to show different types of notifications.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Show a new notification
   */
  const showNotification = (
    type: NotificationType,
    message: string,
    duration: number = 4000
  ) => {
    const id = Date.now(); // Simple unique ID
    setNotifications((prev) => [...prev, { id, type, message, duration }]);

    // Auto-remove after duration + fade-out time
    setTimeout(() => {
      dismissNotification(id);
    }, duration + 300);
  };

  /**
   * Dismiss a notification by ID
   */
  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  /**
   * Convenience methods for different notification types
   */
  const showSuccess = (message: string, duration?: number) => {
    showNotification("success", message, duration);
  };

  const showFailure = (message: string, duration?: number) => {
    showNotification("failure", message, duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showNotification("info", message, duration);
  };

  return {
    notifications,
    showNotification,
    showSuccess,
    showFailure,
    showInfo,
    dismissNotification,
  };
}