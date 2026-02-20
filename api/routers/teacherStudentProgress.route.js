const express = require('express');
const router = express.Router(); // ✅ חובה!

const Class = require('../models/ClassSchema');
const Student = require('../models/StudentSchema');

router.get('/student-progress/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  try {
    // שלב 1: שלוף את כל הקורסים שהמורה יצר
    const classes = await Class.find({ createdBy: teacherId });

    const studentMap = new Map();

    for (const cls of classes) {
      for (const submission of cls.students) {
        const { studentId, submittedAt, analysisResult } = submission;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            studentId,
            totalAttempts: 0,
            latestActivity: submittedAt,
            totalScore: 0,
            scoreCount: 0,
            simulationKeys: new Set()
          });
        }

        const studentData = studentMap.get(studentId);
        studentData.totalAttempts += 1;
        studentData.latestActivity = new Date(submittedAt) > new Date(studentData.latestActivity)
          ? submittedAt : studentData.latestActivity;

        if (analysisResult?.overallScore) {
          studentData.totalScore += analysisResult.overallScore;
          studentData.scoreCount += 1;
        }

        // סימולציה ייחודית לפי classCode + subject
        studentData.simulationKeys.add(`${cls.classCode}-${cls.subject}`);
      }
    }

    const studentIds = Array.from(studentMap.keys());
    const studentProfiles = await Student.find({ id: { $in: studentIds } })
      .select('id username profilePic');

    // שלב 3: מיזוג נתונים לתשובה סופית
    const finalStudents = studentProfiles.map(profile => {
      const stats = studentMap.get(profile.id);
      return {
        id: profile.id,
        username: profile.username,
        profilePic: profile.profilePic,
        averageScore: stats.scoreCount ? (stats.totalScore / stats.scoreCount).toFixed(1) : '0.0',
        totalAttempts: stats.totalAttempts,
        uniqueSimulations: stats.simulationKeys.size,
        latestActivity: stats.latestActivity
      };
    });

    res.status(200).json(finalStudents);
  } catch (error) {
    console.error('❌ Error fetching student progress:', error);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

router.get('/teacher/:teacherId/student/:studentId/progress', async (req, res) => {
  const { teacherId, studentId } = req.params;

  try {
    // שלוף רק כיתות של המורה שבהן הסטודנט הזה קיים
    const classes = await Class.find({
      createdBy: teacherId,
      "students.studentId": studentId
    });

    if (classes.length === 0) {
      return res.status(404).json({ message: 'Student not found for this teacher' });
    }

    const studentClasses = classes.map(cls => {
      const studentAttempts = cls.students.filter(s => s.studentId === studentId);
      return {
        classCode: cls.classCode,
        className: cls.className,
        subject: cls.subject,
        situation: cls.situation,
        question: cls.question,
        attempts: studentAttempts
      };
    });

    res.json({
      studentId,
      classes: studentClasses
    });
  } catch (err) {
    console.error('Error fetching student progress:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
