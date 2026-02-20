import { createContext, useContext, useEffect, useState } from 'react'; // Import required hooks and utilities
import { UserContext } from './UserContext'; // Import UserContext for user data
import { LanguageContext } from './LanguageContext';

/**
 * NotificationsContext manages notifications for the current user.
 * It provides functions to fetch, mark as read, and count notifications.
 */

// Create context for notifications
const NotificationsContext = createContext();

// NotificationsProvider wraps the app or part of it and provides notification state and actions
export const NotificationsProvider = ({ children }) => {
  // Get current user from context
  const { user } = useContext(UserContext);
  const userId = user?.id;
const { lang } = useContext(LanguageContext);
  // State for notifications and unread count
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

const [isFetching, setIsFetching] = useState(false);
const [etag, setEtag] = useState(null);
const fetchNotifications = async () => {
  
  if (!userId) return;
  setIsLoading(true);
    setError(null);
  try {
    const response = await fetch(`/api/notifications/teacher/${userId}?lang=${lang}`);

    const data = await response.json();
    setNotifications(data || []);
    setNotificationCount(data.filter(n => !n.read).length);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};


  // Mark a single notification as read
  const markNotificationAsRead = async (notificationId) => {
      setIsLoading(true);
    setError(null);
    try {
      // Send request to mark notification as read
      await fetch(`/api/notifications/mark-as-read/${notificationId}`, {
        method: 'PATCH',
      });
      fetchNotifications(); // Refresh notifications
    }catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Send request to mark all notifications as read
      await fetch(`/api/notifications/mark-all-as-read/${userId}`, {
        method: 'PATCH',
      });
      fetchNotifications(); // Refresh notifications
    } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
  };

  // Fetch notifications when user ID changes
// Fetch notifications when user ID OR language changes
useEffect(() => {
  fetchNotifications();
}, [userId, lang]); // ⭐ הוספנו lang פה


  // Provide notifications, count, and actions to children via context
  return (
    <NotificationsContext.Provider value={{
      notifications,
      notificationCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllAsRead,
      isLoading,
      error
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom hook for easy access to notifications context
export const useNotifications = () => useContext(NotificationsContext);
