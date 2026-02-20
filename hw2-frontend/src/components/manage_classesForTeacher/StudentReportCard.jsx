import React, { useContext, useState, useEffect, useRef } from 'react';
import { ThemeContext } from '../../DarkLightMood/ThemeContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import StudentHeader from './StudentHeader';
import SimulationChart from './SimulationChart';
import ExportButton from './ExportButton';

// ✅ i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * StudentReportCard renders a detailed report card for a single student.
 */
const StudentReportCard = ({ studentGroup }) => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [imageError, setImageError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fullStudent, setFullStudent] = useState(null);
  const reportRef = useRef(null);

  // ---- language / rtl ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('studentReportCard');

  // main student
  const mainStudent = studentGroup[0];
  const { studentId, username, profilePic } = mainStudent;

  useEffect(() => {
    const fetchFullStudentData = async () => {
      const missingUsername = !username || username === 'Unknown';
      const missingPic = !profilePic || profilePic === 'default_empty_profile_pic';

      if (missingUsername || missingPic) {
        try {
          const res = await fetch(`/api/students/${studentId}`);
          const data = await res.json();
          if (res.ok && data) {
            setFullStudent({ ...mainStudent, ...data });
          } else {
            setFullStudent(mainStudent);
          }
        } catch (err) {
          console.error('❌ Failed to fetch full student data:', err);
          setFullStudent(mainStudent);
        }
      } else {
        setFullStudent(mainStudent);
      }
    };

    fetchFullStudentData();
  }, [mainStudent, studentId, username, profilePic]);

  const getStudentProfilePic = () => {
    const currentStudent = fullStudent || mainStudent;
    const currentProfilePic = currentStudent.profilePic;

    const needsDefaultImage =
      !currentProfilePic ||
      currentProfilePic === 'default_empty_profile_pic' ||
      imageError;

    if (needsDefaultImage) {
      return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;
    }

    if (currentProfilePic.startsWith('data:image')) {
      return currentProfilePic;
    }

    const separator = currentProfilePic.includes('?') ? '&' : '?';
    return `${currentProfilePic}${separator}t=${new Date().getTime()}`;
  };

  const handleImageError = () => setImageError(true);

  const exportToPDF = async () => {
    if (!reportRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: isDark ? '#334155' : '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20; // margins
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      const fileName = `${t('filePrefix')}_${(fullStudent && fullStudent.username) || username || studentId}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert(t('exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  // אפשר להמתין למילון כדי למנוע הבהוב (תואם שאר הקומפוננטות)
  if (!ready) return null;

  return (
    <div className="relative" dir={dir} lang={lang}>
      {/* Export PDF Button - יישאר כמו שהוא */}
      <ExportButton
        onExport={exportToPDF}
        isExporting={isExporting}
        isDark={isDark}
      />

      {/* Main Content: report card - רספונסיבי */}
      <div
        ref={reportRef}
        data-pdf-export
        className={`w-full h-full p-3 sm:p-4 rounded-md shadow-sm ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800'}`}
      >
        {/* Student Info Header - יישאר כמו שהוא */}
        <StudentHeader
          profilePic={getStudentProfilePic()}
          onImageError={handleImageError}
          username={fullStudent?.username || username}
          studentId={studentId}
          simulationCount={studentGroup.length}
          isDark={isDark}
        />

        {/* Charts for each simulation - יישארו כמו שהם */}
        {studentGroup.map((simulation, index) => (
          <SimulationChart
            key={index}
            simulation={simulation}
            index={index}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
};

export default StudentReportCard;