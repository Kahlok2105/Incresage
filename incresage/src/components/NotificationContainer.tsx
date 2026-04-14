import React from "react";
import { Notification } from "./Notification";

interface NotificationContainerProps {
  notifications: Array<{
    id: number;
    type: "success" | "failure" | "info";
    message: string;
    duration?: number;
  }>;
  onDismiss: (id: number) => void;
}

/**
 * Container component that renders all active notifications in the top right corner.
 * Notifications are stacked vertically with proper spacing.
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          duration={notification.duration}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  );
};