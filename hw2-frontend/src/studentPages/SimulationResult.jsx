// src/studentPages/SimulationResult.jsx
import React, { useContext, useEffect, useState } from 'react';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import { ThemeContext,ThemeProvider } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import AnswerCard from './AnswerCard';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentAIChat from '../AI/StudentAIChat'; 

const SimulationResult = () => {
    // Theme and user context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
    // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  // Get class code from navigation state
  const classCode = location.state?.classCode;
    // Local state for answer data, error, and loading
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch the student's answer when component mounts
  useEffect(() => {
    // Validate required data before fetch
    if (!classCode || !user?.id) {
      setError('Missing class or user information.');
      setLoading(false);
      return;
    }
      
    const fetchAnswer = async () => {
      try {
        console.log('[FETCH ANSWER]', { classCode, userId: user?.id }); 
       const res = await fetch(`/api/classes/${encodeURIComponent(classCode)}/student/${encodeURIComponent(user.id)}`);

        if (!res.ok) throw new Error('Failed to fetch student answer.');
        const data = await res.json();
        setAnswer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [classCode, user?.id]);

  return (
    <>
      <StudentHeader />

      <div className={`w-full min-h-screen px-8 py-8 ${isDark ? 'bg-slate-900' : 'bg-gray-100'} text-black dark:text-white`}>
        <h2 className="text-2xl font-bold mb-6 text-center">
          Simulation Completed Successfully!
        </h2>

        {loading && <p className="text-center">Loading answer...</p>}

        {error && (
          <div className="text-center text-red-500 mb-4">
            {error}
            <br />
            {/* Button to return to dashboard on error */}
            <button
              onClick={() => navigate('/StudentHome')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Show fetched answer if no error */}
        {!loading && !error && answer && (
          <div className="w-full">
            <AnswerCard answer={answer} isDark={isDark} />
          </div>
        )}
      </div>

      {/* Floating AI chat button for logged-in users */}
      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username} />}

      <Footer />
    </>
  );
};

const ShowSimulationResult = () => {
  // Provide theme context wrapper
  return (
    <ThemeProvider>
      <SimulationResult />
    </ThemeProvider>
  );
};

export default ShowSimulationResult;
