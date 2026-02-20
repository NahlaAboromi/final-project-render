const express = require('express');
const studentsRouter = express.Router();
const Student = require('../models/StudentSchema');
const sendVerificationEmail = require('../services/sendVerificationEmail');
const pendingCodes = new Map(); // Temporary in-memory storage for email -> verification code

// Get all students 
studentsRouter.get("/", async (req, res) => {
  try {
    const students = await Student.find({}, { _id: 0 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single student by studentId
studentsRouter.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ id: studentId }, { _id: 0, password: 0 });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("❌ Error fetching student by ID:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get multiple students by an array of IDs
studentsRouter.post("/details", async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds array is required" });
    }

    console.log('🔍 Searching for students with IDs:', studentIds);
    
    const students = await Student.find(
      { id: { $in: studentIds } },
      { _id: 0, password: 0 } // Exclude sensitive fields
    );

    console.log('✅ Found students:', students.length);
    
    res.status(200).json(students);
  } catch (error) {
    console.error('❌ Error fetching student details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register a new student
studentsRouter.post("/register", async (req, res) => {
   try {
      const { id } = req.body;
  
       const newStudent = new Student(req.body);
      await newStudent.save();
      res.status(201).json(newStudent);
    }
    catch (error) {
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern)[0];
        const friendlyMessage = duplicatedField === 'id'
          ? "This ID is already registered."
          : duplicatedField === 'email'
          ? "This email is already registered."
          : "Duplicate value detected.";
  
        return res.status(400).json({ message: friendlyMessage });
      }
  
      res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// Log in a student using ID and password
studentsRouter.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
    const student = await Student.findOne({ id, password });

    if (!student) {
      return res.status(401).json({ message: "Invalid ID or Password" });
    }

    res.status(200).json({ message: "Login successful", student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot password – send a verification code to student's email
studentsRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Email not found" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    pendingCodes.set(email, code);

    await sendVerificationEmail(email, code);

    res.status(200).json({ message: "Verification code sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send verification code." });
  }
});

// Verify email code
studentsRouter.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    const expectedCode = pendingCodes.get(email);

    if (!expectedCode || expectedCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    pendingCodes.delete(email);

    res.status(200).json({ message: "Code verified" });
  } catch (error) {
    console.error("Verify Code Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Reset password for a student by email
studentsRouter.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.password = newPassword;  
    student.verificationCode = null; // Clear any verification-related field
    await student.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = studentsRouter;
