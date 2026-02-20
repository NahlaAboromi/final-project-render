const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// --- CORS ---
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'https://modular-skills-assessment-tool-team11.vercel.app',
    'https://modular-skills-assessment-tool-team-two.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

// --- Mongo ---
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/modular_skills';
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // לוודא שהמודלים נטענים
    const SelQuestion = require('./models/SelQuestion');
    await SelQuestion.init();
// ➕ מודל עברית (קולקציה sel_questions_he)
const SelQuestionHe = require('./models/SelQuestion.he');
await SelQuestionHe.init();

    // 🌱 זריעת שאלון CASEL אם צריך
    try {
      const { seedSelQuestions } = require('./seed/seedSelQuestions');
      const enV1 = require('./seed/sel.questions.v1.en'); // הנתיב שאת הראית
      await seedSelQuestions({ data: enV1, version: 'v1', lang: 'en' });
      console.log('✅ SEL questions seeded/verified');
   // ➕ זריעת עברית
const { seedSelQuestionsHe } = require('./seed/seedSelQuestions.he');
const heV1 = require('./seed/sel.questions.v1.he');
await seedSelQuestionsHe({ data: heV1, version: 'v1' });
console.log('✅ SEL questions HE seeded/verified');

    } catch (e) {
      console.warn('⚠️ SEL seed skipped:', e.message);
    }
        // 🌱 זריעת סנריוים (4 המקרים שבחרת)
// 🌱 זריעת סנריוים (אנגלית + עברית)
try {
  // --- אנגלית ---
  require('./models/Scenario'); // לוודא שהמודל נטען
  const { seedScenarios } = require('./seed/seedScenarios');
  await seedScenarios();
  console.log('✅ Scenarios EN seeded/updated');

  // --- עברית ---
  const ScenarioHe = require('./models/Scenario.he');   // מודל קולקציה scenarios_he
  await ScenarioHe.init();

  const { seedScenariosHe } = require('./seed/seedScenarios.he'); // פונקציה לעברית
  const scenariosHe = require('./seed/scenarios.v1.he');          // הנתונים בעברית
  await seedScenariosHe({ data: scenariosHe, version: 'v1' });
  console.log('✅ Scenarios HE seeded/updated');

} catch (e) {
  console.warn('⚠️ Scenarios seed skipped:', e.message);
}
  // 🔽🔽🔽 *** כאן מוסיפים את UEQ-S *** 🔽🔽🔽
    // 🌱 UEQ-S – חוויית משתמש (EN + HE)
    try {
      const UeqQuestionEn = require('./models/UeqQuestion.en');
      const UeqQuestionHe = require('./models/UeqQuestion.he');

      await UeqQuestionEn.init();
      await UeqQuestionHe.init();

      const { seedUeqQuestionsEn } = require('./seed/seedUeqQuestions.en');
      const { seedUeqQuestionsHe } = require('./seed/seedUeqQuestions.he');

      const ueqEnV1 = require('./seed/ueq.s.v1.en');
      const ueqHeV1 = require('./seed/ueq.s.v1.he');

      await seedUeqQuestionsEn({ data: ueqEnV1, version: 'ueq-s-v1' });
      await seedUeqQuestionsHe({ data: ueqHeV1, version: 'ueq-s-v1' });

      console.log('✅ UEQ-S questions EN/HE seeded/verified');
    } catch (e) {
      console.warn('⚠️ UEQ-S seed skipped:', e.message);
    }

  })
  .catch(err => console.error('❌ MongoDB error:', err));

// --- Routers ---
const teachersRouter = require('./routers/teachers.route');
const studentsRouter = require('./routers/students.route');
const notificationsRouter = require('./routers/notifications.route');
const studentNotificationsRouter = require('./routers/studentNotifications.route');
const summaryRouter = require('./routers/summary.route');
const classesRouter = require('./routers/classes.route');
const claudeRoutes = require('./routers/claude.route');
const teacherStudentProgressRouter = require('./routers/teacherStudentProgress.route');
const anonymousStudentsRouter = require('./routers/anonymousStudents.route');
const assignRouter = require('./routers/assign.route');
const translateRouter = require('./routers/translate.route');
app.use('/api', translateRouter);
app.use('/api', assignRouter);
// ✅ זה מה שהיה חסר:
const selRouter = require('./routers/sel.route'); // כולל GET /questionnaires/casel ו-POST /assessments
app.use('/api', selRouter);
// ✅ נתיבי ניסוי (Trial)
const trialRouter = require('./routers/trial.route');   
const ueqRouter = require('./routers/ueq.route');  
app.use('/api', trialRouter);
 app.use('/api', ueqRouter);  
// שאר הראוטרים כרגיל
app.use('/api/teachers', teachersRouter);
app.use('/api/students', studentsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/studentNotifications', studentNotificationsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/claude', claudeRoutes);
app.use('/api', summaryRouter);
app.use('/api', teacherStudentProgressRouter);
app.use('/api/anonymous', anonymousStudentsRouter);

// Export for Vercel
module.exports = app;

// Local dev server
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running at http://localhost:${PORT}`);
  });
}