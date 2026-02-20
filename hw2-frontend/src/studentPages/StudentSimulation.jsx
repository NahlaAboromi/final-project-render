import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import StudentHeader from "../studentPages/StudentHeader";
import { UserContext } from '../context/UserContext';
import { StudentNotificationsContext } from '../context/StudentNotificationsContext';
import Footer from "../layout/Footer";

const StudentSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, classCode } = location.state || {};
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const { fetchNotifications } = useContext(StudentNotificationsContext);

  const [situation, setSituation] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoadingToSubmit, setIsLoadingToSubmit] = useState(false);

  const showSuccessToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-bounce z-50';
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
  };

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch(`/api/classes/get-class-by-code?classCode=${classCode}`);
        const data = await response.json();

        if (response.ok) {
          setSituation(data.situation);
          setQuestion(data.question);
        } else {
          console.error('❌ Error fetching class data:', data.message);
          alert('Class not found. Please try again.');
          navigate('/StudentHome');
        }
      } catch (error) {
        console.error('❌ Server error:', error);
        alert('Server error. Please try again later.');
        navigate('/StudentHome');
      } finally {
        setLoading(false);
      }
    };

    if (classCode) {
      fetchClassData();
    } else {
      navigate('/StudentHome');
    }
  }, [classCode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingToSubmit(true);
    try {
      console.log('[submit] payload:', { studentId, classCode, answerText: answer });

      const response1 = await fetch('/api/classes/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          classCode,
          answerText: answer
        }),
      });

      const data1 = await response1.json();

      const response2 = await fetch('/api/studentNotifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          type: 'submitted',
          title: `Simulation Submitted`,
          content: `Simulation of the class ${classCode} submitted successfully.`,
          time: new Date().toLocaleString(),
          read: false
        }),
      });

      fetchNotifications();

      const data2 = await response2.json();

      if (response1.ok && response2.ok) {
        setIsLoadingToSubmit(false);
        setTimeout(() => {
          showSuccessToast('✅ Your answer has been submitted successfully!');
          navigate('/simulation_result', { state: { classCode } });
        }, 400);
      } else {
        setIsLoadingToSubmit(false);
        console.error('❌ Error submitting answer:', data1.message, ' ', data2.message);
        alert('Error submitting answer. Please try again.');
      }
    } catch (error) {
      setIsLoadingToSubmit(false);
      console.error('❌ Server error:', error);
      alert('Server error. Please try again.');
    }
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-50">
      <svg className={`animate-spin h-20 w-20 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className={`mt-4 text-xl font-semibold animate-pulse ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        Loading simulation...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-900 text-white">
      <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'}`}>
        <div className="px-4 mt-4">
          <StudentHeader />
        </div>

        {loading && <LoadingOverlay />}

        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
          {!loading && (
            <div className="w-full max-w-2xl bg-slate-100 text-black dark:bg-slate-800 dark:text-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-500 ">🎯 Welcome to the Simulation!</h2>
              <p className={`mb-6 text-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
                Please read the situation carefully and submit your answer below.
              </p>

              <div className="bg-slate-100 text-black dark:bg-slate-800 dark:text-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-500 ">Simulation Situation</h3>
                <p className="text-gray-700 dark:text-gray-200 mb-6">{situation}</p>

                <h4 className="text-lg font-semibold mb-2 text-blue-500 ">Question:</h4>
                <p className="text-gray-700 dark:text-gray-200 mb-4">{question}</p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    className="w-full p-3 rounded bg-slate-200 text-black dark:bg-slate-600 dark:text-white mb-4 resize-none"
                    rows="5"
                    placeholder="Write your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full flex justify-center items-center ${isLoadingToSubmit ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isLoadingToSubmit}
                  >
                    {isLoadingToSubmit ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting Simulation</span>
                      </>
                    ) : (
                      'Submit Simulation'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>

        <div className="px-4 pb-4">
          <Footer />
        </div>
      </div>
    </div>
  );
};

const ViewStudentSimulation = () => (
  <ThemeProvider>
    <StudentSimulation />
  </ThemeProvider>
);

export default ViewStudentSimulation;
