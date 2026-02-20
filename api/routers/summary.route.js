const express = require('express');
const router = express.Router();
const Class = require('../models/ClassSchema'); // מביא את הכיתות

// Returns a summary dashboard for a specific teacher.
router.get('/teacher/:teacherId/summary', async (req, res) => {
  try {
        // Extract teacherId from the request parameters
    const { teacherId } = req.params;
 // Fetch all classes created by the teacher
    const classes = await Class.find({ createdBy: teacherId });
    // Count the number of active classes
    let activeClasses = classes.length;
      // Use a Set to store unique student IDs
    const uniqueStudentIds = new Set();
    const topicCount = {};

  // Iterate through each class to gather student and topic data
    classes.forEach((classItem) => {
          // Count unique students by their studentId
      classItem.students?.forEach(student => {
        if (student.studentId) {
          uniqueStudentIds.add(student.studentId);
        }
      });

       // Count the number of classes per subject
      if (classItem.subject) {
        topicCount[classItem.subject] = (topicCount[classItem.subject] || 0) + 1;
      }
    });
  // Calculate the total number of unique students
    const totalStudents = uniqueStudentIds.size;

 // Determine the most common topic (subject) among the classes
    let mostCommonTopic = 'N/A';
    if (Object.keys(topicCount).length > 0) {
      mostCommonTopic = Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])[0][0];
    }
    // Respond with the summary data
    res.json({
      activeClasses,
      totalStudents,
      mostCommonTopic
    });

  } catch (error) {
    console.error('❌ Error getting dashboard summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
