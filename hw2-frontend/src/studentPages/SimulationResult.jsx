// src/studentPages/SimulationResult.jsx

import React, { useContext, useEffect, useState } from 'react';
import StudentHeader from "./StudentHeader";
import Footer from "../layout/Footer";
import { ThemeContext,ThemeProvider } from '../DarkLightMood/ThemeContext';
import { UserContext } from '../context/UserContext';
import AnswerCard from './AnswerCard';
import { useLocation, useNavigate } from 'react-router-dom';
import StudentAIChat from '../AI/StudentAIChat';

import { useI18n } from '../utils/i18n'; // ✅ הוספה


const SimulationResult = () => {

  // Theme and user context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const { user } = useContext(UserContext);

  // ✅ i18n
  const { t, dir, lang, ready } = useI18n('simulationResult');


  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();

  const classCode = location.state?.classCode;


  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    if (!classCode || !user?.id) {

      setError(t('missingInfo'));
      setLoading(false);

      return;

    }


    const fetchAnswer = async () => {

      try {

        console.log('[FETCH ANSWER]', { classCode, userId: user?.id });

        const res = await fetch(
          `/api/classes/${encodeURIComponent(classCode)}/student/${encodeURIComponent(user.id)}`
        );

        if (!res.ok) throw new Error(t('fetchFailed'));

        const data = await res.json();

        setAnswer(data);

      }

      catch (err) {

        setError(err.message);

      }

      finally {

        setLoading(false);

      }

    };


    fetchAnswer();

  }, [classCode, user?.id, t]);


  if (!ready) return null;


  return (

    <>

      <StudentHeader />


      <div
        dir={dir}
        lang={lang}
        className={`w-full min-h-screen px-8 py-8 ${isDark ? 'bg-slate-900' : 'bg-gray-100'} text-black dark:text-white`}
      >


        <h2 className="text-2xl font-bold mb-6 text-center">

          {t('title')}

        </h2>


        {loading &&

          <p className="text-center">

            {t('loading')}

          </p>

        }


        {error && (

          <div className="text-center text-red-500 mb-4">

            {error}

            <br />

            <button

              onClick={() => navigate('/StudentHome')}

              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"

            >

              {t('returnDashboard')}

            </button>

          </div>

        )}


        {!loading && !error && answer && (

          <div className="w-full">

            <AnswerCard answer={answer} isDark={isDark} />

          </div>

        )}

      </div>


      {user?.id &&

        <StudentAIChat
          studentId={user.id}
          studentName={user.username}
        />

      }


      <Footer />

    </>

  );

};


const ShowSimulationResult = () => {

  return (

    <ThemeProvider>

      <SimulationResult />

    </ThemeProvider>

  );

};


export default ShowSimulationResult;