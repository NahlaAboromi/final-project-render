// src/Research/ValidatedQuestionnairePOST.jsx
import React, { useContext } from 'react';
import { ThemeProvider, ThemeContext } from '../DarkLightMood/ThemeContext';
import AnonymousHeader from './AnonymousHeader';
import Footer from '../layout/Footer';
import AssessmentContainer from './assessment/AssessmentContainer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnonymousStudent as useStudent } from '../context/AnonymousStudentContext';

function ValidatedQuestionnaireContent() {
  const location = useLocation();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { student } = (typeof useStudent === 'function' ? useStudent() : {}) || {};
  const anonId = student?.anonId || null;
const phase = (location.state?.phase) || 'post';
  // ✅ בודק קבוצה ומנווט בהתאם
const handleFinish = async () => {
  const ok = window.confirm("Are you sure you want to finish? You won’t be able to continue.");
  if (!ok) return;

  try {
      // אפשר לקבל group מה־state בעתיד; אם לא — ננסה להביא מהשרת
      let group = (student?.group || '').toString().toUpperCase();

      if (!group && anonId) {
        const r = await fetch(`${import.meta.env.VITE_API_URL}/api/trial/${anonId}`);
        if (r.ok) {
          const t = await r.json();
          group = (t?.group || '').toString().toUpperCase();
        }
      }

      // 🔀 ניווט: A/B/C → דף רפלקציה; D → שאלון חוויית משתמש (UEQ)
      try { localStorage.setItem('lastAssessmentPhase', 'post'); } catch {}

      if (group && group !== 'D') {
        // קבוצות ניסוי → דף רפלקציה
        navigate('/reflection-end', { state: { anonId, group } });
      } else {
        // קבוצת ביקורת D → שאלון UEQ
        navigate('/ueq-questionnaire', { state: { anonId, group: group || 'D' } });
      }

    } catch {
      // fallback בטוח
      navigate('/thanks', { state: { anonId } });
    }
  };

  return (
    <div className={`flex flex-col min-h-screen w-screen ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}>
      <div className="px-4 mt-4">
        <AnonymousHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6">
        <section className={`${isDark ? 'bg-slate-700' : 'bg-slate-200'} p-6 rounded`}>
          <div className={`rounded-lg shadow-md p-6 ${isDark ? 'bg-slate-600' : 'bg-white'} max-w-6xl mx-auto`}>
            <AssessmentContainer
              phase={phase} 
              skipAssign
              onFinish={handleFinish}  
            />
          </div>
        </section>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
}

export default function ValidatedQuestionnaire() {
  return (
    <ThemeProvider>
      <ValidatedQuestionnaireContent />
    </ThemeProvider>
  );
}
