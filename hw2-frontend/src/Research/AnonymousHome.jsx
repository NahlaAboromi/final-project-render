// src/Research/AnonymousHome.jsx
import React, { useContext } from 'react';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import ShowClasses from '../studentPages/ShowClasses';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";
import StudentRecentActivities from '../studentPages/StudentRecentActivities';
import StudentAIChat from '../AI/StudentAIChat';
import AssessmentContainer from "./assessment/AssessmentContainer";
const AnonymousHomeContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { student } = useStudent();

  const isSubmitted = false; // תחברי בהמשך לסטטוס אמיתי

  if (!isSubmitted) {
    return (
      <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
        <div className="px-4 mt-4">
          <AnonymousHeader />
        </div>
        <main className="flex-1 w-full px-4 py-6">
          <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
            <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'} max-w-6xl mx-auto`}>
              <AssessmentContainer compact />
            </div>
          </section>
        </main>
        <div className="px-4 pb-4">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>
      <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 md:p-7 rounded`}>
          <div className={`rounded-lg shadow-md p-6 md:p-8 ${isDark ? 'bg-slate-600' : 'bg-white'} max-w-6xl mx-auto`}>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
              Welcome back 👋
            </h1>
            <p className={`${isDark ? 'text-gray-300' : 'text-slate-600'} text-sm mb-6`}>
              Anon ID: {student?.anonId || '—'}
            </p>
            <ShowClasses />
            <div className="mt-8" />
            <StudentRecentActivities />
          </div>
        </section>
      </main>
      {student?.anonId && <StudentAIChat studentId={student.anonId} />}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AnonymousHome = () => (
  <ThemeProvider>
    <AnonymousHomeContent />
  </ThemeProvider>
);

export default AnonymousHome;
