import React from 'react';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import ShowClasses from "./ShowClasses";
import { ThemeProvider } from '../DarkLightMood/ThemeContext';
import { useContext } from 'react';
import { ThemeContext } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import StudentRecentActivities from './StudentRecentActivities';
import StudentAIChat from '../AI/StudentAIChat'; 

const StudentContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext); 

  return (
    // Outer container applies dark or light background and text colors based on theme
    <div className={`flex flex-col min-h-screen w-screen ${
      isDark ? 'bg-slate-900 !important text-white !important' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Header section */}
      <div className="px-4 mt-4">
        <StudentHeader />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Container with different background colors for dark/light mode */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          {/* Welcome message with dynamic username */}
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-1`}>
            Welcome back, {user?.username} 👋
          </h1>
          
          {/* Component to show user's classes */}
          <ShowClasses />
          
          <div className="mt-8"></div>
          
          {/* Component to show student's recent activities */}
          <StudentRecentActivities />
        </div>
      </main>

      {/* Floating AI chat button shown only if user is logged in */}
      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

      {/* Footer section */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

// Wrap StudentContent inside ThemeProvider to supply theme context
const Student = () => {
  return (
    <ThemeProvider>
      <StudentContent />
    </ThemeProvider>
  );
};

export default Student;
