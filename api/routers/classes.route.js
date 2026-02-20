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
  console.log('>>> CLASSES /submit-answer HIT');
  const t0 = Date.now();
  try {
    // INPUT
    const { studentId, classCode, answerText } = req.body || {};
    console.group('[CLASSES] POST /submit-answer');
    console.log('↘ body:', { studentId, classCode, answerLen: (answerText || '').length });

    // FIND CLASS
    const classDoc = await Class.findOne({ classCode });
    console.log('class found?', !!classDoc, classDoc ? { classCode: classDoc.classCode } : null);
    if (!classDoc) {
      console.warn('⛔ class not found:', classCode);
      console.groupEnd();
      return res.status(404).json({ message: 'Class not found' });
    }

    // AI ANALYSIS
    console.time('[analyzeStudentResponse]');
    const analysisResult = await analyzeStudentResponse({
      situation: classDoc.situation,
      question: classDoc.question,
      studentResponse: answerText,
      studentName: studentId
    });
    console.timeEnd('[analyzeStudentResponse]');
    console.log('analysisResult keys:', analysisResult ? Object.keys(analysisResult) : null);

    // PUSH ANSWER
    const beforeLen = Array.isArray(classDoc.students) ? classDoc.students.length : 'N/A';
    classDoc.students.push({
      studentId,
      answerText,
      analysisResult,
      submittedAt: new Date()
    });
    console.log('students length:', beforeLen, '→', classDoc.students.length);

    // SAVE
    await classDoc.save();
    console.log('✅ class saved');

    // NOTIFICATION
    // NOTIFICATION - EN (קיים כמו שהיה)
    const newNotification = new Notification({
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: `Student ${studentId} submitted an answer in class ${classCode}`,
      time: new Date().toLocaleString(),
      read: false
    });
    await newNotification.save();
    console.log('✅ teacher notification saved (EN)');

    // ⭐ NOTIFICATION - HE (חדש)
    const heTitle = `הסטודנט/ית ${studentId} הגיש/ה תשובה בכיתה ${classCode}`;
    const newHebrewNotification = new HebrewNotification({
      notificationId: newNotification._id,   // קישור אחד-על-אחד לאנגלית
      teacherId: classDoc.createdBy,
      type: 'exam',
      title: heTitle,
      read: false
    });
    await newHebrewNotification.save();
    console.log('✅ teacher notification saved (HE)');

    console.log('OK 200. elapsed(ms)=', Date.now() - t0);
    console.groupEnd();
    res.status(200).json({ message: 'Answer submitted successfully and notification saved' });

  } catch (error) {
    console.error('❌ [submit-answer] ERROR:', error?.message, '\nstack:', error?.stack);
    console.log('elapsed(ms)=', Date.now() - t0);
    console.groupEnd?.();
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