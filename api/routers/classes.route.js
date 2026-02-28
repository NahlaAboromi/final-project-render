const express = require('express');
const router = express.Router();
const Class = require('../models/ClassSchema');
const Notification = require('../models/NotificationSchema'); // ✅ מוסיפים ייבוא Notification
const HebrewNotification = require('../models/HebrewNotification'); // ⭐ חדש

const { analyzeStudentResponse } = require('../services/studentAnalysisService');

//  Create a new class
router.post('/create', async (req, res) => {
  try {
    const { classCode, className, subject, situation, question, createdBy } = req.body;
    // Check if a class with the same code already exists
    const existingClass = await Class.findOne({ classCode });
    if (existingClass) {
      return res.status(400).json({ message: 'Class Code already exists. Please choose a different code.' });
    }
    // Create and save new class
    const newClass = new Class({
      classCode,
      className,
      subject,
      situation,
      question,
      createdBy
    });

    await newClass.save();

    res.status(201).json({ 
      message: '✅ Class created successfully', 
      classData: newClass, 
      classId: newClass._id
    });
  } catch (error) {
    console.error('❌ Error creating class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//  Get all classes created by a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const classes = await Class.find({ createdBy: teacherId });

    const mappedClasses = classes.map(classItem => ({
      id: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdDate: classItem.createdAt,
      status: 'Active',
      active: true,
      students: classItem.students || [] 
    }));

    res.status(200).json(mappedClasses);

  } catch (error) {
    console.error('❌ Error fetching classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/submit-answer', async (req, res) => {
  console.log('\n==============================');
  console.log('>>> CLASSES /submit-answer HIT');
  console.log('timestamp:', new Date().toISOString());
  const t0 = Date.now();

  try {

    // =====================
    // INPUT
    // =====================

    const { studentId, classCode, answerText } = req.body || {};

    console.group('[STEP 1] INPUT');
    console.log('raw body:', req.body);
    console.log('studentId:', studentId, '| type:', typeof studentId);
    console.log('classCode:', classCode, '| type:', typeof classCode);
    console.log('answerText exists?', !!answerText);
    console.log('answerText length:', (answerText || '').length);
    console.log('answerText preview:', (answerText || '').substring(0, 100));
    console.groupEnd();


    // =====================
    // FIND CLASS
    // =====================

    console.group('[STEP 2] FIND CLASS');

    const classDoc = await Class.findOne({ classCode });

    console.log('classDoc found?', !!classDoc);

    if (classDoc) {
      console.log('classDoc._id:', classDoc._id.toString());
      console.log('classDoc.classCode:', classDoc.classCode);
      console.log('classDoc.createdBy:', classDoc.createdBy);

      console.log('classDoc.situation exists?', !!classDoc.situation);
      console.log('classDoc.question exists?', !!classDoc.question);

      console.log('classDoc.students exists?', Array.isArray(classDoc.students));
      console.log('classDoc.students length:', classDoc.students?.length);
    }

    if (!classDoc) {
      console.warn('⛔ class not found:', classCode);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    console.groupEnd();


    // =====================
    // AI ANALYSIS
    // =====================

    console.group('[STEP 3] AI ANALYSIS');

    console.log('Calling analyzeStudentResponse with:');

    console.log({
      situationLen: classDoc.situation?.length,
      questionLen: classDoc.question?.length,
      studentResponseLen: answerText?.length,
      studentName: studentId
    });

    console.time('[analyzeStudentResponse TIME]');

    const analysisResult = await analyzeStudentResponse({
      situation: classDoc.situation,
      question: classDoc.question,
      studentResponse: answerText,
      studentName: studentId
    });

    console.timeEnd('[analyzeStudentResponse TIME]');

    console.log('analysisResult is null?', analysisResult === null);
    console.log('analysisResult is undefined?', analysisResult === undefined);
    console.log('analysisResult type:', typeof analysisResult);

    if (analysisResult) {

      console.log('analysisResult keys:', Object.keys(analysisResult));

      console.log('analysisResult full object:');
      console.dir(analysisResult, { depth: 10 });

      console.log('analysisResult JSON:');
      console.log(JSON.stringify(analysisResult, null, 2));

    } else {

      console.warn('⚠️ analysisResult returned EMPTY:', analysisResult);

    }

    console.groupEnd();


    // =====================
    // PUSH ANSWER
    // =====================

    console.group('[STEP 4] PUSH ANSWER');

    const beforeLen = Array.isArray(classDoc.students)
      ? classDoc.students.length
      : 'N/A';

    console.log('students length BEFORE push:', beforeLen);

    classDoc.students.push({
      studentId,
      answerText,
      analysisResult,
      submittedAt: new Date()
    });

    console.log('students length AFTER push:', classDoc.students.length);

    console.log('last pushed student object:');
    console.dir(classDoc.students[classDoc.students.length - 1], { depth: 10 });

    console.groupEnd();


    // =====================
    // SAVE
    // =====================

    console.group('[STEP 5] SAVE');

    console.log('Saving classDoc...');

    await classDoc.save();

    console.log('✅ classDoc saved');

    console.groupEnd();


    // =====================
    // VERIFY SAVE
    // =====================

    console.group('[STEP 6] VERIFY FROM DB');

    const verifyDoc = await Class.findOne({ classCode });

    const lastStudent =
      verifyDoc.students[verifyDoc.students.length - 1];

    console.log('Last student from DB:');

    console.dir(lastStudent, { depth: 10 });

    console.log('analysisResult in DB is null?',
      lastStudent.analysisResult === null);

    console.log('analysisResult in DB:',
      lastStudent.analysisResult);

    console.groupEnd();


    // =====================
    // NOTIFICATIONS
    // =====================

    console.group('[STEP 7] NOTIFICATIONS');

    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: `Student ${studentId} submitted an answer in class ${classCode}`,
      time: new Date().toLocaleString(),
      read: false
    });

    await newNotification.save();

    console.log('EN notification saved, id:', newNotification._id.toString());

    const heTitle =
      `הסטודנט/ית ${studentId} הגיש/ה תשובה בכיתה ${classCode}`;

    const newHebrewNotification = new HebrewNotification({
      notificationId: newNotification._id,
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: heTitle,
      read: false
    });

    await newHebrewNotification.save();

    console.log('HE notification saved, id:',
      newHebrewNotification._id.toString());

    console.groupEnd();


    console.log('OK 200. elapsed(ms)=', Date.now() - t0);

    console.log('<<< END /submit-answer');
    console.log('==============================\n');


    res.status(200).json({
      message: 'Answer submitted successfully and notification saved'
    });


  } catch (error) {

    console.error('\n❌❌❌ CRASH IN /submit-answer ❌❌❌');

    console.error('error message:', error?.message);

    console.error('error stack:');
    console.error(error?.stack);

    console.error('elapsed(ms)=', Date.now() - t0);

    console.error('<<< END /submit-answer WITH ERROR');
    console.error('==============================\n');

    res.status(500).json({ message: 'Server error' });

  }
});

//  Get class by class code
router.get('/get-class-by-code', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode } = req.query || {};
    console.group('[CLASSES] GET /get-class-by-code');
    console.log('↘ query.classCode:', classCode);

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode, 'elapsed(ms)=', Date.now() - t0);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentsLen = Array.isArray(classDoc.students) ? classDoc.students.length : 0;
    console.log('students length:', studentsLen);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json({
      classCode: classDoc.classCode,
      className: classDoc.className,
      subject: classDoc.subject,
      situation: classDoc.situation,
      question: classDoc.question,
      createdBy: classDoc.createdBy,
      students: classDoc.students
    });
  } catch (error) {
    console.error('❌ [get-class-by-code] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});


// Get all classes in which a student submitted simulations
router.get('/get-classes-done-simulation/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }
    // Find classes where this student has submitted answers
    const classes = await Class.find({ "students.studentId": studentId });
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      createdAt: classItem.createdAt,
      students: classItem.students
    }));
    res.status(200).json(mappedClasses);  
  } catch (error) {
    console.error('❌ Error fetching class by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all classes in the system
router.get('/get-all-classes', async (req, res) => {
  try {
    const classes = await Class.find();
    const mappedClasses = classes.map(classItem => ({
      _id: classItem._id,
      code: classItem.classCode,
      name: classItem.className,
      subject: classItem.subject,
      situation: classItem.situation,
      question: classItem.question,
      createdBy: classItem.createdBy,
      createdAt: classItem.createdAt,
      students: classItem.students
    }));

    res.status(200).json(mappedClasses);  
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  Delete a class by classCode and notify the teacher
router.delete('/delete/:classCode', async (req, res) => {
  try {
    const { classCode } = req.params;

    //  Find the class before deletion
    const classDoc = await Class.findOne({ classCode });
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Create a notification before deletion
    // EN notification (קיים)
    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'warning',
      title: `The class "${classDoc.className}" has been deleted.`,
      time: new Date().toLocaleString(),
      read: false
    });
    await newNotification.save();
    console.log('✅ delete notification saved (EN)');

    // ⭐ HE notification (חדש)
    const heTitle = `הכיתה "${classDoc.className}" נמחקה.`;
    const newHebrewNotification = new HebrewNotification({
      notificationId: newNotification._id,
      teacherId: classDoc.createdBy,
      type: 'warning',
      title: heTitle,
      read: false
    });
    await newHebrewNotification.save();
    console.log('✅ delete notification saved (HE)');

    //  Delete the class
    await Class.deleteOne({ classCode });

    res.status(200).json({ message: 'Class deleted and notification saved' });

  } catch (error) {
    console.error('❌ Error deleting class:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


const { generateClassInsightFromClaude } = require('../services/classInsightService');

// Generate AI-based insight for a class using previous student analyses
router.post('/ai-class-insight', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode } = req.body || {};
    console.group('[CLASSES] POST /ai-class-insight');
    console.log('↘ body.classCode:', classCode);

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentAnalyses = (classDoc.students || [])
      .filter(s => s.analysisResult)
      .map(s => s.analysisResult);

    console.log('analyses count:', studentAnalyses.length);

    if (studentAnalyses.length === 0) {
      console.warn('⛔ no analyzed data in class');
      console.groupEnd();
      return res.status(400).json({ message: 'No analyzed data in this class' });
    }

    console.time('[generateClassInsightFromClaude]');
    const insight = await generateClassInsightFromClaude({
      situation: classDoc.situation,
      question: classDoc.question,
      studentAnalyses
    });
    console.timeEnd('[generateClassInsightFromClaude]');
    console.log('insight length:', (insight || '').length);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json({ insight });
  } catch (error) {
    console.error('❌ [ai-class-insight] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:classCode/student/:studentId', async (req, res) => {
  const t0 = Date.now();
  try {
    const { classCode, studentId } = req.params || {};
    console.group('[CLASSES] GET /:classCode/student/:studentId');
    console.log('↘ params:', { classCode, studentId });

    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode, 'elapsed(ms)=', Date.now() - t0);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    const totalStudents = Array.isArray(classDoc.students) ? classDoc.students.length : 0;
    console.log('total students in class:', totalStudents);

    const allAnswers = (classDoc.students || []).filter(s => s.studentId === studentId);
    console.log('answers for student:', allAnswers.length);

    if (allAnswers.length === 0) {
      console.warn('⛔ no answers for student in this class');
      console.groupEnd();
      return res.status(404).json({ message: 'Student answer not found in this class' });
    }

    const latestAnswer = allAnswers.reduce((latest, current) =>
      new Date(current.submittedAt) > new Date(latest.submittedAt) ? current : latest
    );
    console.log('latest submittedAt:', latestAnswer?.submittedAt);

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json(latestAnswer);
  } catch (error) {
    console.error('❌ [get-student-latest] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;