// src/studentPages/StudentSimulation.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import StudentHeader from "../studentPages/StudentHeader";
import { UserContext } from '../context/UserContext';
import { StudentNotificationsContext } from '../context/StudentNotificationsContext';
import Footer from "../layout/Footer";
import { useI18n } from '../utils/i18n'; // ✅ i18n

const StudentSimulation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, classCode } = location.state || {};
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const { user } = useContext(UserContext);
  const { fetchNotifications } = useContext(StudentNotificationsContext);

  // ✅ i18n (שם חדש כדי לא להתנגש)
  const { t, dir, lang, ready } = useI18n('studentSimulationPage');

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
          alert(t('errors.classNotFound'));
          navigate('/StudentHome');
        }
      } catch (error) {
        console.error('❌ Server error:', error);
        alert(t('errors.serverError'));
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

  console.log('\n==============================');
  console.log('>>> HANDLE SUBMIT START');
  console.log('timestamp:', new Date().toISOString());

  e.preventDefault();

  setIsLoadingToSubmit(true);

  try {

    // =====================
    // STEP 1: INPUT DEBUG
    // =====================

    console.group('[STEP 1] FRONTEND INPUT DEBUG');

    console.log('studentId:', studentId, '| type:', typeof studentId);

    console.log('classCode:', classCode, '| type:', typeof classCode);

    console.log('answer exists?', !!answer);

    console.log('answer length:', (answer || '').length);

    console.log('answer preview (first 200 chars):');
    console.log((answer || '').substring(0, 200));

    console.log('answer full text:');
    console.log(answer);

    console.log('user.id:', user?.id);

    console.groupEnd();



    // =====================
    // STEP 2: PREPARE BODY
    // =====================

    const requestBody = {
      studentId,
      classCode,
      answerText: answer
    };

    console.group('[STEP 2] REQUEST BODY');

    console.log('requestBody object:');
    console.dir(requestBody, { depth: 5 });

    console.log('requestBody JSON:');
    console.log(JSON.stringify(requestBody, null, 2));

    console.groupEnd();



    // =====================
    // STEP 3: SEND ANSWER
    // =====================

    console.group('[STEP 3] FETCH /submit-answer');

    console.time('submit-answer fetch time');

    const response1 = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
    });

    console.timeEnd('submit-answer fetch time');

    console.log('response1.status:', response1.status);

    console.log('response1.ok:', response1.ok);

    console.log('response1.headers:');

    for (const pair of response1.headers.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const data1 = await response1.json();

    console.log('response1 JSON data:');
    console.dir(data1, { depth: 10 });

    console.groupEnd();



    // =====================
    // STEP 4: NOTIFICATION
    // =====================

    console.group('[STEP 4] FETCH /studentNotifications/create');

    const notificationBody = {
      studentId: user.id,
      type: 'submitted',
      title: t('notif.title'),
      content: t('notif.content', '').replace('{classCode}', classCode),
      time: new Date().toLocaleString(),
      read: false
    };

    console.log('notification body:');
    console.dir(notificationBody, { depth: 5 });

    console.time('notification fetch time');

    const response2 = await fetch(`${import.meta.env.VITE_API_URL}/api/studentNotifications/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationBody),
    });

    console.timeEnd('notification fetch time');

    console.log('response2.status:', response2.status);

    console.log('response2.ok:', response2.ok);

    const data2 = await response2.json();

    console.log('response2 JSON data:');
    console.dir(data2, { depth: 10 });

    console.groupEnd();



    // =====================
    // STEP 5: REFRESH NOTIFICATIONS
    // =====================

    console.group('[STEP 5] REFRESH NOTIFICATIONS');

    console.log('Calling fetchNotifications()...');

    await fetchNotifications();

    console.log('fetchNotifications DONE');

    console.groupEnd();



    // =====================
    // STEP 6: FINAL RESULT
    // =====================

    console.group('[STEP 6] FINAL RESULT CHECK');

    console.log('response1.ok:', response1.ok);

    console.log('response2.ok:', response2.ok);

    console.groupEnd();



    if (response1.ok && response2.ok) {

      console.log('✅ BOTH REQUESTS OK');

      setIsLoadingToSubmit(false);

      setTimeout(() => {

        console.log('Showing success toast...');

        showSuccessToast(t('toast.success'));

        console.log('Navigating to /simulation_result');

        navigate('/simulation_result', {
          state: { classCode }
        });

        console.log('Navigation done');

      }, 400);

    } else {

      setIsLoadingToSubmit(false);

      console.error('❌ Error submitting answer');

      console.error('data1.message:', data1?.message);

      console.error('data2.message:', data2?.message);

      alert(t('errors.submitError'));

    }


    console.log('<<< HANDLE SUBMIT END SUCCESS');
    console.log('==============================\n');


  } catch (error) {

    setIsLoadingToSubmit(false);

    console.error('\n❌ HANDLE SUBMIT CRASH');

    console.error('error message:', error?.message);

    console.error('error stack:', error?.stack);

    console.error('<<< HANDLE SUBMIT END ERROR');
    console.error('==============================\n');

    alert(t('errors.serverErrorShort'));

  }
};

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center z-50">
      <svg className={`animate-spin h-20 w-20 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className={`mt-4 text-xl font-semibold animate-pulse ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        {t('loading')}
      </p>
    </div>
  );

  if (!ready) return null;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-slate-900 text-white">
      <div
        dir={dir}
        lang={lang}
        className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-900'}`}
      >
        <div className="px-4 mt-4">
          <StudentHeader />
        </div>

        {loading && <LoadingOverlay />}

        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
          {!loading && (
            <div className="w-full max-w-2xl bg-slate-100 text-black dark:bg-slate-800 dark:text-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-extrabold mb-4 text-center text-blue-500 ">
                🎯 {t('welcome')}
              </h2>

              <p className={`mb-6 text-center ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {t('instructions')}
              </p>

              <div className="bg-slate-100 text-black dark:bg-slate-800 dark:text-white rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-blue-500 ">
                  {t('simulationSituation')}
                </h3>

                <p className="text-gray-700 dark:text-gray-200 mb-6">{situation}</p>

                <h4 className="text-lg font-semibold mb-2 text-blue-500 ">
                  {t('questionLabel')}
                </h4>

                <p className="text-gray-700 dark:text-gray-200 mb-4">{question}</p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    className="w-full p-3 rounded bg-slate-200 text-black dark:bg-slate-600 dark:text-white mb-4 resize-none"
                    rows="5"
                    placeholder={t('placeholder')}
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
                        <span>{t('submitting')}</span>
                      </>
                    ) : (
                      t('submit')
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