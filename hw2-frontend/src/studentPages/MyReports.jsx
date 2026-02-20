
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentHeader from './StudentHeader';
import Footer from '../layout/Footer';
import { UserContext } from '../context/UserContext';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import StudentSimulationBox from './StudentSimulationBox';
import AnswerCard from './AnswerCard';
import { useLocation } from 'react-router-dom';
import StudentAIChat from '../AI/StudentAIChat'; 


const ClassDetailsContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const location = useLocation();
  const { classCode } = location.state || {};
  const { user } = useContext(UserContext); 

  const [classInfo, setClassInfo] = useState(null);
  const [searchDate, setSearchDate] = useState('');

  
  
  // Fetch class information from backend when component mounts or classCode changes
  useEffect(() => {
    const fetchClassInfo = async () => {
      try {
        // Fetch class data by classCode
        const res = await fetch(`/api/classes/get-class-by-code?classCode=${classCode}`);
        const data = await res.json();
        setClassInfo(data); // Save class data in state
      } catch (error) {
        console.error("❌ Failed to fetch class data:", error);
      }
    };

    fetchClassInfo();
  }, [classCode]);


  // Convert any date string to Israel local date in format YYYY-MM-DD
  const formatDateToIsraelTime = (dateString) => {
    const date = new Date(dateString);
    const israelOffsetMs = 3 * 60 * 60 * 1000; // UTC+3 offset in ms
    const israelTime = new Date(date.getTime() + israelOffsetMs);

    // Extract year, month, day with padding
    const year = israelTime.getUTCFullYear();
    const month = String(israelTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(israelTime.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      {/* Header */}
      <div className="px-4 mt-4">
        <StudentHeader />
      </div>

      {/* Main content */}
      <main className="flex-1 w-full px-4 py-6">
        {/* Class header info */}
        <div className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded mb-4`}>
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span role="img" aria-label="book">📘</span> Class Details
          </h1>
          <p className="text-lg">
            Class Code: <span className="bg-gray-100 dark:bg-slate-600 px-3 py-1 rounded font-mono">{classCode}</span>
          </p>
        </div>

        {/* Show class details once loaded */}
        {classInfo ? (
          <>
            {/* Simulation question & situation component */}
            <StudentSimulationBox
              simulationText={classInfo.question}
              situation={classInfo.situation}
            />

            {/* Filter submissions by date */}
            <div className={`${isDark ? 'bg-slate-700' : 'bg-white'} p-4 rounded-lg shadow mb-6`}>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <span role="img" aria-label="filter">🔍</span> Filter Submissions
              </h2>

              {/* Date input for filtering */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <label htmlFor="searchDate" className="font-medium">
                  Filter by submission date:
                </label>

                <input
                  type="date"
                  id="searchDate"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className={`${isDark ? 'bg-slate-800 text-white border-slate-600' : 'bg-slate-100 text-slate-800 border-slate-300'} border p-2 rounded-md`}
                />

                {/* Clear date filter button */}
                {searchDate && (
                  <button
                    onClick={() => setSearchDate('')}
                    className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Show current user's filtered submissions */}
              {classInfo.students && (() => {
                // Filter to current user's answers only
                const studentAnswers = classInfo.students.filter((s) => s.studentId === user.id);

                // Further filter answers by selected date if set
                const filteredAnswers = searchDate
                  ? studentAnswers.filter(answer => {
                      const submittedDate = formatDateToIsraelTime(answer.submittedAt);
                      return submittedDate === searchDate;
                    })
                  : studentAnswers;
                  console.log(filteredAnswers);

                // Render answers or message if none found
                return filteredAnswers.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredAnswers.map((answer) => (
                      <AnswerCard key={answer._id} answer={answer} />
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No simulation submissions found for the selected date.</p>
                );
              })()}
            </div>
          </>
        ) : (
          <p>Loading class information...</p>
        )}
      </main>

      {/* Floating AI chat button for logged-in users */}
      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username}/>}

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const ViewClassDetails = () => {
  // Wrap main content with theme provider
  return (
    <ThemeProvider>
      <ClassDetailsContent />
    </ThemeProvider>
  );
};

export default ViewClassDetails;
