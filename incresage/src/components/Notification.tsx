import React, { useEffect, useState } from "react";

/**
 * Notification types with their corresponding styles and icons
 */
type NotificationType = "success" | "failure" | "info";

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onDismiss: () => void;
}

/**
 * Generic notification component that appears in the top right corner.
 * Supports different types (success, failure, info) with appropriate styling.
 */
export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  duration = 4000,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Auto-dismiss after duration
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // Wait for fade-out animation
    }, duration);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress > 0 ? newProgress : 0;
      });
    }, 100);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressInterval);
    };
  }, [duration, onDismiss]);

  // Get styling based on notification type
  const getNotificationStyle = () => {
    switch (type) {
      case "success":
        return {
          background: "linear-gradient(135deg, #10b981, #059669)",
          icon: "✅",
        };
      case "failure":
        return {
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          icon: "❌",
        };
      case "info":
        return {
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          icon: "ℹ️",
        };
      default:
        return {
          background: "linear-gradient(135deg, #6b7280, #4b5563)",
          icon: "📢",
        };
    }
  };

  const style = getNotificationStyle();

  if (!visible) return null;

  return (
    <div className={`notification ${type}`} role="alert">
      <div className="notification-content">
        <span className="notification-icon">{style.icon}</span>
        <span className="notification-message">{message}</span>
      </div>
      <div
        className="notification-progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};