//C:\Users\n0502\OneDrive\שולחן העבודה\final_project-main\final_project-main\api\models\ClassSchema.js
const mongoose = require('mongoose');

// Schema for a single student's answer
const StudentAnswerSchema = new mongoose.Schema({
  studentId: { type: String, ref: 'Student' }, // ID of the student
  answerText: { type: String },                // The text of the student's answer
  analysisResult: { type: Object },            // Analysis result (e.g., CASSEL analysis)
  submittedAt: { type: Date, default: Date.now } // Timestamp of when the answer was submitted
});

// Schema for a class
const ClassSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true }, // Unique code for the class
  className: { type: String, required: true },               // Name of the class
  subject: { type: String, required: true },                 // Subject of the class
  situation: { type: String, required: true },               // Situation/context for the question
  question: { type: String, required: true },                // Main question for the class
  createdBy: { type: String, ref: 'Teacher', required: true }, // ID of the teacher who created the class
  createdAt: { type: Date, default: Date.now },              // Timestamp of class creation

  // Array of student answers
  students: [StudentAnswerSchema]
});

// Method to count how many times a specific student submitted answers in this class
ClassSchema.methods.getStudentAnswerCount = function(studentId) {
  return this.students.filter(s => s.studentId === studentId).length;
};

module.exports = mongoose.model('Class', ClassSchema);
