import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Teacher from './components/dashboardForTeacher/Teacher.jsx';
import Create_New_Class from "./components/dashboardForTeacher/Create_New_Class.jsx";
import AllReports from './components/StudentProgressForTeacher/AllReports.jsx';
import ClassManager from './components/manage_classesForTeacher/ClassManager.jsx';
import ClassCard from './components/manage_classesForTeacher/ClassCard.jsx';
import ViewClasses from './components/manage_classesForTeacher/ViewClasses.jsx';
import ClassDetails from './components/manage_classesForTeacher/ClassDetails.jsx'; 
import ClassStudentReports from './components/manage_classesForTeacher/ClassStudentReports.jsx'; 
import LoginPage from './components/teacherLoginRegister/LoginPage.jsx';
import RegisterPage from "./components/teacherLoginRegister/RegisterPage";
import ForgotPassword from "./components/teacherLoginRegister/ForgotPassword";
import StudentLoginPage from './studentPages/StudentLogin.jsx';
import ViewStudentSimulation from "./studentPages/StudentSimulation.jsx";
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './DarkLightMood/ThemeContext';
import { NotificationsProvider } from "./context/NotificationsContext";
import { StudentNotificationsProvider } from "./context/StudentNotificationsContext";
import StudentHome from './studentPages/StudentHome';
import StudentRecentActivites from './studentPages/StudentRecentActivities';
import MyReports from './studentPages/MyReports';
import ClassesDoneSimulation from './studentPages/ClassesDoneSimulation';
import SimulationResult from './studentPages/SimulationResult';
import MyProgress from './studentPages/MyProgress';
import AnonymousStart from './Research/AnonymousStart';
import AnonymousHome from './Research/AnonymousHome';
import VerifyCode from "./components/teacherLoginRegister/VerifyCode";
import ResetPassword from "./components/teacherLoginRegister/ResetPassword";
import { AnonymousStudentProvider } from './context/AnonymousStudentContext';
import Homepage from './layoutForEducatorsAndStudents/Homepage';
import ProgressOfChosenStudent from './components/StudentProgressForTeacher/ProgressOfChosenStudent.jsx';
import AssignmentConfirm from './Research/AssignmentConfirm'; 
import Simulation from './Research/Simulation';
import FinalSummary from './Research/FinalSummary';
import ValidatedQuestionnaire from './Research/ValidatedQuestionnairePOST';
import SocraticReflectionEnd from './Research/SocraticReflectionFeedback';
import { LanguageProvider } from './context/LanguageContext';
import Thanks from './Research/Thanks/Thanks';
import AnonymousSimulationResult from './Research/AnonymousSimulationResult';
import AssessmentContainer from './Research/assessment/AssessmentContainer';
import UeqQuestionnaire from './Research/UeqQuestionnaire';

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <AnonymousStudentProvider>
      <UserProvider>
        <NotificationsProvider>
          <StudentNotificationsProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Homepage />} />

                <Route path="/teacher-login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} /> 
                <Route path="/teacher/Teacher" element={<Teacher />} />
                <Route path="/teacher/Create_New_Class" element={<Create_New_Class />} />
                <Route path="/all-reports" element={<AllReports />} />
                <Route path="/all-reports/:studentId" element={<AllReports />} />
                <Route path="/manage_classes" element={<ClassManager />} />
                <Route path="/class-card" element={<ClassCard />} />
                <Route path="/view-classes" element={<ViewClasses />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/progress-of-chosen-student/:studentId" element={<ProgressOfChosenStudent />} />
                {/* ✅ חדשים לכפתורים */}                {/* ✅ חדשים לכפתורים */}
                <Route path="/teacher/class/:classCode" element={<ClassDetails />} />
                <Route path="/teacher/class/:classCode/reports" element={<ClassStudentReports />} />
              
                {/* לסטודנט */}
                <Route path="/StudentHome" element={<StudentHome />} />
                <Route path="/student-login" element={<StudentLoginPage />} />
                <Route path="/student-simulation" element={<ViewStudentSimulation />} />
                <Route path="/studentRecentActivites" element={<StudentRecentActivites />} />
                <Route path="/classesDoneSimulation" element={<ClassesDoneSimulation />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/simulation_result" element={<SimulationResult />} />
                <Route path="/my_progress" element={<MyProgress />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />

<Route
  path="/simulation/final-summary"
  element={
    <AnonymousStudentProvider>
      <FinalSummary />
    </AnonymousStudentProvider>
  }
/>

<Route
  path="/simulation/:scenarioId"
  element={
    <AnonymousStudentProvider>
      <Simulation />
    </AnonymousStudentProvider>
  }
/>
 <Route path="/assignment" element={
  <AnonymousStudentProvider>
     <AssignmentConfirm />
   </AnonymousStudentProvider>
 } />


<Route
  path="/ueq-questionnaire"
  element={
    <AnonymousStudentProvider>
      <UeqQuestionnaire />
    </AnonymousStudentProvider>
  }
/>


 <Route path="/simulation/analysis" element={
  <AnonymousStudentProvider>
     <AnonymousSimulationResult />
   </AnonymousStudentProvider>
 } />

 <Route path="/validated-questionnaire" element={
  <AnonymousStudentProvider>
     <ValidatedQuestionnaire />
   </AnonymousStudentProvider>
 } />

 <Route path="/thanks" element={
  <AnonymousStudentProvider>
     <Thanks />
   </AnonymousStudentProvider>
 } />


 <Route path="/reflection-end" element={
  <AnonymousStudentProvider>
     <SocraticReflectionEnd />
   </AnonymousStudentProvider>
 } />



 <Route path="/experiment/start" element={
   <AnonymousStudentProvider><AnonymousStart /></AnonymousStudentProvider>
 } /> 
                 <Route path="/study/home" element={
   <AnonymousStudentProvider><AnonymousHome /></AnonymousStudentProvider>
} />
  <Route path="/assessment" element={<AssessmentContainer />} />
  {/* רשות: תאימות לכתובות ישנות */}
  <Route path="/assessment/pre"  element={<Navigate to="/assessment" state={{ phase: 'pre'  }}  replace />} />
  <Route path="/assessment/post" element={<Navigate to="/assessment" state={{ phase: 'post' }}  replace />} />


              </Routes>
            </Router>
          </StudentNotificationsProvider>
        </NotificationsProvider>
      </UserProvider>
      </AnonymousStudentProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
