import React, { useState, useEffect, useContext } from 'react';
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const ClassManagerContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classCodeFilter, setClassCodeFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    // Fetch classes from server
    const fetchClasses = async () => {
      try {
        if (!user?.id) {
          setError('No user ID found.');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/classes/get-all-classes`);
        const data = await response.json();

        if (response.ok) {
          // Normalize and map server data to expected format
          const formattedData = data.map((item) => ({
            _id: item._id,
            classCode: item.code || '',
            className: item.name || '',
            subject: item.subject || '',
            createdAt: item.createdAt || item.createdDate || '',
            createdBy: item.createdBy || '',
            studentsTaken: item.students || []
          }));

          setClasses(formattedData);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch classes.');
        }
      } catch (err) {
        // Handle network/server errors
        setError('Server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  // Filter classes by search term and class code
  const filteredClasses = classes.filter(classData => {
    const matchesSearch = searchTerm === '' ||
      classData.className.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassCode = classCodeFilter === '' || classData.classCode.includes(classCodeFilter);
    return matchesSearch && matchesClassCode;
  });

  return (
    <main className="flex-1 w-full px-4 py-6">
      <p className={`text-grau-500 dark:text-white mb-2`}>
        Here's Some Classes To Join:
      </p>
      <div className="bg-slate-100 text-black dark:bg-slate-600 dark:text-white p-6 rounded">
        {/* Search and filter inputs */}
        <div className="bg-white dark:bg-slate-700 p-4 rounded shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search classes by name..."
                className="w-full py-2 px-4 pr-10 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {/* Search icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-4 flex-wrap md:flex-nowrap">
              <input
                type="text"
                placeholder="Class Code..."
                className="py-2 px-4 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={classCodeFilter}
                onChange={(e) => setClassCodeFilter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Class list or status messages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="text-center py-10">Loading classes...</div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-500 p-5 rounded text-center">
              <p>{error}</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded text-center">
              <p>No classes found.</p>
            </div>
          ) : (
            filteredClasses
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by creation date descending
              .slice(0, visibleCount) // Show only visibleCount items
              .map((classData) => (
                <div key={classData._id} className="bg-white dark:bg-slate-700 dark:text-white rounded-md shadow-sm p-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold mb-1">{classData.className}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-300"><strong>Code:</strong> {classData.classCode}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300"><strong>Subject:</strong> {classData.subject}</p>
                  </div>
                  {/* Button to start simulation, navigates passing user and class info */}
                  <button
                    onClick={() => navigate('/student-simulation', { state: { studentId: user.id, classCode: classData.classCode } })}
                    className="ml-4 px-3 py-2 bg-slate-100 border-gray-800 dark:bg-slate-600 dark:text-white hover:border-blue-700 border border-transparent transition"
                  >
                    Start Simulation
                  </button>
                </div>
              ))
          )}
        </div>

        {/* Load More / Show Less buttons */}
        {filteredClasses.length > 6 && (
          <div className="text-center mt-4 flex flex-col sm:flex-row justify-center gap-4">
            {visibleCount < filteredClasses.length && (
              <button
                onClick={() => setVisibleCount(visibleCount + 6)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-white hover:border-blue-700 border border-transparent transition"
              >
                Load More
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {visibleCount > 6 && (
              <button
                onClick={() => setVisibleCount(6)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 dark:text-white hover:border-blue-700 border border-transparent transition"
              >
                Show Less
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

const ClassManager = () => (
  // Wrap component with ThemeProvider to provide theme context
  <ThemeProvider>
    <ClassManagerContent />
  </ThemeProvider>
);

export default ClassManager;
