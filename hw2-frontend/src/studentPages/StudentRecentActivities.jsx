import React, { useEffect,useContext } from 'react';
import { StudentNotificationsContext } from '../context/StudentNotificationsContext';
import { useLocation } from 'react-router-dom';

const RecentActivity = () => {
  const { notifications, fetchNotifications } = useContext(StudentNotificationsContext);
  const location = useLocation();

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Parse custom date string into a JavaScript Date object
  function parseCustomDate(dateStr) {
    const [datePart, timePart] = dateStr.split(',').map(s => s.trim());
    const [day, month, year] = datePart.split('.').map(Number);
    return new Date(year, month - 1, day, ...timePart.split(':').map(Number));
  }
  // Sort notifications by date, newest first
  const sortedNotifications = [...notifications].sort((a, b) => parseCustomDate(b.time) - parseCustomDate(a.time));
  // Take the 3 most recent notifications
  const recentNotifications = sortedNotifications.slice(0, 3);


  // Return styling classes based on notification type
  const getTypeStyle = (type) => {
    switch (type) {
      case 'submitted': return 'bg-green-500 text-white';
      case 'exam': return 'bg-yellow-400 text-black';
      case 'export': return 'bg-blue-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };
  // Return icon emoji based on notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'submitted': return '✔️';
      case 'exam': return '📝';
      case 'export': return '📄';
      default: return '🔔';
    }
  };

  // Show message if no notifications are available
  if (!notifications.length) {
    return <div className="text-center text-gray-500 dark:text-gray-300">No activities found.</div>;
  }
  // Render the recent notifications list with styling and icons
  return (
    <div className="bg-white dark:bg-slate-600 dark:text-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
      <ul className="space-y-4">
        {recentNotifications.map((activity) => (
          <li
            key={activity.id || activity.time} 
            className="border-b pb-2 border-gray-200 dark:border-gray-500 flex items-start gap-3"
          >
            <div
              className={`flex-shrink-0 mt-1 w-8 h-8 ${getTypeStyle(activity.type)} rounded-full flex items-center justify-center`}
            >
              <span>{getTypeIcon(activity.type)}</span>
            </div>
            <div>
              <div className="font-medium">{activity.content}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">{activity.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default RecentActivity;
