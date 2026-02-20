import { createContext, useContext, useEffect, useState } from 'react';
import { UserContext } from './UserContext';

export const StudentNotificationsContext = createContext();
 // Fetch notifications
export const StudentNotificationsProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from server for current user

  const fetchNotifications = async () => {
     setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/studentNotifications/student/${userId}`);
      const data = await response.json();
      if (!response.ok) {
           setError(`Request failed with status ${response.status}`);
        console.warn(`Request failed with status ${response.status}`);
        return;
      }
        setNotifications(data);
        setNotificationCount(data.filter(n => !n.read).length);  
    } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
  };
  
  // Fetch notifications once userId is available and whenever it changes
 useEffect(() => {
  if (!userId) return;
      fetchNotifications();
}, [userId]);

  // Mark single notification as read and refresh list
  const markNotificationAsRead = async (notificationId) => {
     setIsLoading(true);
    setError(null);
    try {
      await fetch(`/api/studentNotifications/mark-as-read/${notificationId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    }catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
  };

  // Mark all notifications as read and refresh list
  const markAllNotificationsAsRead = async () => {
     setIsLoading(true);
    setError(null);
    if (!userId) return; // safety check
    try {
      await fetch(`/api/studentNotifications/mark-all-as-read/${userId}`, {
        method: 'PATCH',
      });
      await fetchNotifications();
    } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
  };

  
  return (
    <StudentNotificationsContext.Provider value={{
      notifications,
      notificationCount,
      fetchNotifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
     isLoading,
     error
    }}>
      {children}
    </StudentNotificationsContext.Provider>
  );
};

