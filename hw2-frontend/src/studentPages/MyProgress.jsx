import React, { useContext, useEffect, useState ,useRef} from 'react';
import StudentHeader from './StudentHeader';
import Footer from '../layout/Footer';
import { UserContext } from '../context/UserContext';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import {
    LineChart,Line,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Legend
} from 'recharts';
import {StudentNotificationsContext} from '../context/StudentNotificationsContext';
import StudentAIChat from '../AI/StudentAIChat'; 

//Renders a line chart that visualizes student progress over time by attempt number and score.
function SimulationProgressChart({ submissions }) {
  const chartData = submissions.map((s, index) => ({
    attempt: index + 1,
    score: s.analysisResult?.overallScore || 0,
  }));

  return (
    <div className={`rounded-lg  p-6 mb-8 bg-slate-200 text-black dark:bg-slate-700 dark:text-white`}>
      <div
        className={`rounded-lg  p-6 mb-12 border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600`}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span role="img" aria-label="Chart">
            📊
          </span>{" "}
          Simulation Progress Chart
        </h3>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid
            stroke="#cbd5e1"           
            strokeDasharray="4 4"       
            strokeWidth={0.8}         
          />
    <XAxis 
      dataKey="attempt" 
      label={{ value: "Attempt Number", position: "insideBottom", offset: -5, fill: "#6b7280"}} 
      tick={{ fill: "#6b7280" }}
    />
    <YAxis 
      domain={[0, 5]} 
      label={{ value: "Score", angle: -90, position: "insideLeft", fill: "#6b7280" }}
      tick={{ fill: "#6b7280" }}
    />
        <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div>
                      <p className="font-semibold">Attempt {label}</p>
                      <p>
                        Score: <strong>{payload[0].value.toFixed(2)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
        <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1, fill: "#3b82f6" }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
    </ResponsiveContainer>
    </div>
  </div>

  );

}

// Custom button component to export charts as PDF
const CustomExportButton = ({ onExport, isExporting, isDark }) => {
  
  return (
    <button
      onClick={onExport}
      disabled={isExporting}
      className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
        isDark
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      title="Export to PDF"
    >
      {isExporting ? '📄 Exporting...' : '📄 Export PDF'}
    </button>
  );
};

// Generates a multi-page PDF by capturing given DOM elements as images using html2canvas and jsPDF
const generateMultiplePagePDF = async (elements, studentName) => {
  try {
    const html2canvas = await import('html2canvas');
    const jsPDF = await import('jspdf');

    const pdf = new jsPDF.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      if (!element) continue;
      if (i !== 0) pdf.addPage(); 
      // Render element to canvas
      const canvas = await html2canvas.default(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

    const imgData = canvas.toDataURL('image/png');    
    const imgWidth = pageWidth ;
    const imgHeight = (canvas.height * imgWidth) / canvas.width+40;

      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
    }
    pdf.save(`${studentName}_progress_report.pdf`);
    return true;
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    throw error;
  }
};

const MyProgress = () => {
  const combinedChartRef = useRef(null);
  const simulationsRefs = useRef([]);
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting,setIsExporting]=useState(false)
  const { fetchNotifications } = useContext(StudentNotificationsContext);
const [openChartClassIndex, setOpenChartClassIndex] = useState(null);


  // Handles exporting the dashboard charts as PDF and notifies the user upon completion
 const handleExportPDF = async () => {
  if (!user) return;
    setIsExporting(true);
  try {
    const studentName = user.username; 
    // Delay to ensure DOM is fully rendered
    await new Promise(resolve => setTimeout(resolve, 150));
    await generateMultiplePagePDF([
      combinedChartRef.current,
      ...simulationsRefs.current.filter(Boolean)
    ], studentName);

  } catch (error) {
    console.error('PDF Export Error:', error);
  } finally {
    setIsExporting(false);
    // Create export notification for the student
     const response2=await fetch('/api/studentNotifications/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          type: 'export',
          title:`📄 PDF Report Generated`,
          content: `A detailed progress report containing charts and simulation results has been successfully exported as a PDF.`,
          time: new Date().toLocaleString(),
          read: false
        }),
      })
    fetchNotifications(); // רענון רשימת ההתראות
  }
};
  // Fetch classes data that include simulations done by the user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/classes/get-classes-done-simulation/${user.id}`);
        const data = await res.json();
        setClassesData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

    //format a date string to localized Hebrew format with date and time
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  //determine text color based on score thresholds
  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Calculate number of unique simulations based on class name and subject combination
  const calculateUniqueSimulations = (data) => {
    const uniqueKeys = new Set();
    data.forEach(cls => uniqueKeys.add(cls.code));
    return uniqueKeys.size;
  };

  // Calculate total attempts by counting user submissions in all classes
  const totalAttempts = classesData.reduce((acc, cls) => {
    return acc + cls.students.filter(s => s.studentId === user.id).length;
  }, 0);

    // Calculate sum of all user scores across submissions
  const totalScoreSum = classesData.reduce((acc, cls) => {
    const studentSubs = cls.students.filter(s => s.studentId === user.id);
    return acc + studentSubs.reduce((a, s) => a + (s.analysisResult?.overallScore || 0), 0);
  }, 0);


  // Calculate average score or return 'N/A' if no attempts
  const avgScore = totalAttempts > 0 ? (totalScoreSum / totalAttempts).toFixed(1) : 'N/A';


  // Handle missing profile pictures and provide default SVG avatar
   const getProfileImage = () => {
    if (!user?.profilePic || user.profilePic === "default_empty_profile_pic") {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      );
    }
    
    return (
      <img
        src={user.profilePic}
        alt={user?.username || "User"}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = '/default-profile.png';
        }}
      />
    );
  };

  // Calculate average scores per emotional skill across all user submissions
  const calculateAverageSkills = (data) => {
  const skillSums = {
    selfAwareness: 0,
    selfManagement: 0,
    socialAwareness: 0,
    relationshipSkills: 0,
    responsibleDecisionMaking: 0
  };
  let count = 0;

  data.forEach(cls => {
    cls.students
      .filter(s => s.studentId === user.id)
      .forEach(s => {
        const result = s.analysisResult;
        if (result) {
          Object.keys(skillSums).forEach(skill => {
            if (result[skill]) {
              skillSums[skill] += result[skill].score || 0;
            }
          });
          count++;
        }
      });
  });

  const averages = {};
  Object.keys(skillSums).forEach(skill => {
    averages[skill] = count > 0 ? (skillSums[skill] / count).toFixed(1) : 'N/A';
  });

  return averages;
 //     {
//  selfAwareness: "4.5",
 // selfManagement: "3.5",
//  socialAwareness: "N/A",
 // relationshipSkills: "N/A",
//  responsibleDecisionMaking: "N/A"
//}

};
const averageSkills = calculateAverageSkills(classesData);

const skillChartData = Object.entries(averageSkills).map(([skill, score]) => ({
  skill: skill.replace(/([A-Z])/g, ' $1'), // למשל "selfAwareness" → "self Awareness"
  score: parseFloat(score)
}));

const submissions = [];

// שלב 1: לאסוף את כל הסימולציות של הסטודנט
classesData.forEach(cls => {
  cls.students
    .filter(s => s.studentId === user.id)
    .forEach(sub => {
      if (sub.analysisResult && sub.submittedAt) {
        submissions.push(sub);
      }
    });
});

// שלב 2: מיון לפי התאריך בפועל
submissions.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

// שלב 3: בניית ה־skillTimeData עם תאריך + שעה
const skillTimeData = submissions.map(sub => {
  const result = sub.analysisResult;
  const date = new Date(sub.submittedAt);
  const label = date.toLocaleString('he-IL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  return {
    submission: label,
    selfAwareness: result.selfAwareness?.score || 0,
    selfManagement: result.selfManagement?.score || 0,
    socialAwareness: result.socialAwareness?.score || 0,
    relationshipSkills: result.relationshipSkills?.score || 0,
    responsibleDecisionMaking: result.responsibleDecisionMaking?.score || 0
  };
});


                  
              
  return (

    <div className={"flex flex-col min-h-screen w-screen bg-slate-100 text-black dark:bg-slate-600 dark:text-white p-6 }"}>
      <StudentHeader />
      
      <div className="w-full px-4 sm:px-10 py-8">
        <div className="flex justify-end mb-4">
          <CustomExportButton 
            onExport={handleExportPDF}
            isExporting={isExporting}
            isDark={isDark}
          />
        </div>
      <div  ref={combinedChartRef} >
        <div className={"rounded-lg shadow-md p-6 mb-8 bg-slate-200 text-slate-800  dark:bg-slate-700 dark:text-white }"}>
          <div className="flex items-center space-x-4 ">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center bg-white">
              {getProfileImage()}
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">

              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span role="img">📊</span>
                  {user.username} - Detailed Progress
                </h2>
                <p className="text-sm text-gray-400">Student ID: {user.id}</p>
              </div>

            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 text-center gap-6">
          
            <div>
              <p className="text-3xl font-bold text-blue-600">{totalAttempts}</p>
              <p>Total Submissions</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{calculateUniqueSimulations(classesData)}</p>
              <p>Unique Simulations</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-600">{avgScore}/5</p>
              <p>Average Score</p>
            </div>
          </div>
         
        </div>
        <div className={"rounded-lg shadow-md p-6 mb-8  bg-slate-200 text-black dark:bg-slate-700 dark:text-white"}>
        <div className={"rounded-lg shadow-md p-6 mb-12 border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"}>
        {/* Bar Chart */}
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span role="img">📊</span> Skills Average Chart
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={skillChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="skill" tick={{ fill: isDark ? "#fff" : "#000" }} />
            <YAxis domain={[0, 5]} tick={{ fill: isDark ? "#fff" : "#000" }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-blue-100 dark:bg-blue-900  text-black dark:text-white p-2 rounded shadow text-sm border border-gray-300 dark:border-slate-500">
                      <p className="font-semibold">{label}</p>
                      <p>Average Score: <strong>{payload[0].value.toFixed(2)}</strong></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" fill="#3b82f6" cursor={{ fill: "rgba(5, 150, 105, 0.2)" }}
/>
          </BarChart>
        </ResponsiveContainer>
      </div>

        <div className="rounded-lg shadow-md p-6 mb-8 border border-gray-300 dark:border-gray-500 bg-white dark:bg-slate-800">
      
  
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span role="img">📈</span> Skills Progress Over Submissions
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={skillTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="submission" tick={{ fill: isDark ? "#fff" : "#000" }} />
              <YAxis domain={[0, 5]} tick={{ fill: isDark ? "#fff" : "#000" }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow text-sm border border-gray-300 dark:border-gray-600">
                        <p className="font-semibold mb-2">{label}</p>
                         {payload.map((entry, index) => (
                          <p key={index}>
                            {entry.name}: <strong>{entry.value.toFixed(2)}</strong>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="selfAwareness" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="selfManagement" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="socialAwareness" stroke="#ffc658" strokeWidth={2} />
              <Line type="monotone" dataKey="relationshipSkills" stroke="#9b59b6" strokeWidth={2} />
              <Line type="monotone" dataKey="responsibleDecisionMaking" stroke="#e74c3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <span role="img">🎯</span>
          Simulations Progress
        </h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          classesData.map((cls, idx) => {
            const submissions = cls.students.filter(s => s.studentId === user.id);
            if (!submissions.length) return null;

            const latest = submissions[submissions.length - 1];
            const first = submissions[0];

            return (
              
              <div key={idx} ref={(el) => (simulationsRefs.current[idx] = el)}  className={`relative ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-black border border-gray-300'} mb-12 p-8 rounded shadow`}>
              <button
                className="absolute top-4 right-6 text-sm bg-slate-200 dark:bg-slate-600 rounded px-4 hover:bg-gray-400"
                onClick={() => setOpenChartClassIndex(idx)}
                aria-label={`Open progress chart for ${cls.name}`}
              >
                ...
              </button>
              {openChartClassIndex === idx && (
              <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={() => setOpenChartClassIndex(null)} // לסגור בלחיצה על הרקע
                  >
                    <div
                      className="bg-slate-200 dark:bg-slate-900 rounded-lg p-6 w-[90vw] max-w-2xl max-h-[75vh] relative shadow-lg text-white"
                      onClick={(e) => e.stopPropagation()} // למנוע סגירה בלחיצה בתוך החלון
                    >
                      <button
                        className="absolute top-3 right-3 text-xs hover:text-red-400 transition-colors"
                        onClick={() => setOpenChartClassIndex(null)}
                        aria-label="Close chart"
                      >
                        ❌
                      </button>
                      <SimulationProgressChart submissions={submissions} />
                    </div>
                  </div>
                )}
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                  <span role="img">🧠</span>
                  {cls.name} - {cls.subject}
                </h3>
           
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>{submissions.length} attempts</span>
                  {submissions.length > 1 ? (
                    <span>
                      First <span className="text-yellow-600">{first.analysisResult?.overallScore?.toFixed(1)}/5</span> → Latest <span className="text-yellow-600">{latest.analysisResult?.overallScore?.toFixed(1)}/5</span>
                    </span>
                  ) : (
                    <span>First <span className="text-yellow-600">{first.analysisResult?.overallScore?.toFixed(1)}/5</span></span>
                  )}
                </div>

                <div className="text-sm mb-2">
                  <span role="img">📅</span> <strong>Latest Attempt ({formatDate(latest.submittedAt)}):</strong>
                  <div className={`mt-2 p-3 rounded border-l-4 ${isDark ? 'bg-gray-600 text-white border border-blue-700' : 'bg-gray-300 text-black border border-gray-800'} `}>
                    {latest.answerText}
                  </div>
                </div>

                <p className="mt-2 text-sm">Latest Score: <span className={`font-bold ${getScoreColor(latest.analysisResult?.overallScore)}`}>{latest.analysisResult?.overallScore?.toFixed(1)}/5</span></p>

                <div className="mt-4">
                  <p className="font-semibold mb-2">CASEL Analysis:</p>
                  {["selfAwareness","selfManagement","socialAwareness","relationshipSkills","responsibleDecisionMaking"].map((cat, i) => {
                    const score = latest.analysisResult?.[cat]?.score || 0;
                    const colors = [
                      'from-blue-400 to-blue-600',
                      'from-green-400 to-green-600',
                      'from-yellow-400 to-yellow-600',
                      'from-purple-400 to-purple-600',
                      'from-red-400 to-red-600'
                    ];
                    return (

                      <div key={i} className="mb-3">
                        <p className="text-sm mb-1">{cat.replace(/([A-Z])/g, ' $1')}</p>
                        <div className="relative h-6 bg-gray-600 rounded-full overflow-hidden">
                          <div className={`absolute left-0 top-0 h-6 rounded-full bg-gradient-to-r ${colors[i]}`} style={{ width: `${(score / 5) * 100}%` }}></div>
                        </div>
                        <p className="text-right text-sm mt-1">{score.toFixed(1)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        
      </div>
       {/* ✅ הוספת כפתור ה-AI הצף */}
      {user?.id && <StudentAIChat studentId={user.id} studentName={user.username}/>}

      <Footer />
      </div>
  );
};

const ViewMyProgress = () => {
  return (
    <ThemeProvider>
      <MyProgress />
    </ThemeProvider>
  );
};

export default ViewMyProgress;
