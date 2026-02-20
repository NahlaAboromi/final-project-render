const express = require('express');
const teachersRouter = express.Router();
const Teacher = require('../models/TeacherSchema');
const sendVerificationEmail = require('../services/sendVerificationEmail');

const pendingCodes = new Map(); // Temporarily stores verification codes by email

// get all teachers from the database.
teachersRouter.get("/", async (req, res) => {
  try {
     // Query all teachers, excluding the MongoDB _id field
    const teachers = await Teacher.find({}, { _id: 0 });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Registers a new teacher with validation and duplicate checks.
teachersRouter.post("/register", async (req, res) => {
  try {
    const { id } = req.body;
        // Validate that the ID is exactly 9 digits
    if (!/^\d{9}$/.test(id)) {
      return res.status(400).json({ message: "ID must be exactly 9 digits." });
    }
    // Create and save the new teacher in the database
    const newTeacher = new Teacher(req.body);
    await newTeacher.save();
    res.status(201).json(newTeacher);
  } catch (error) {
        // Handle duplicate ID or email errors
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


// Authenticates a teacher by ID and password.
teachersRouter.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;
        // Find the teacher with the provided credentials
    const teacher = await Teacher.findOne({ id, password });
      // If not found, return unauthorized
    if (!teacher) {
      return res.status(401).json({ message: "Invalid ID or Password" });
    }
       // Respond with success and teacher data
    res.status(200).json({ message: "Login successful", teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Sends a verification code to the teacher's email for password reset.
teachersRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
        // Find the teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return res.status(404).json({ message: "Email not found" });
    }
      // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
      // Store the code temporarily in memory
    pendingCodes.set(email, code);
    // Send the code via email
    await sendVerificationEmail(email, code);

    res.status(200).json({ message: "Verification code sent to email." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Failed to send verification code." });
  }
});
// Verifies the code sent to the teacher's email.
teachersRouter.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
        // Retrieve the expected code from the map
    const expectedCode = pendingCodes.get(email);
        // Check if the code matches
    if (!expectedCode || expectedCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Optionally remove the code after successful verification
    pendingCodes.delete(email);

    res.status(200).json({ message: "Code verified" });
  } catch (error) {
    console.error("Verify Code Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Resets the teacher's password after successful code verification.
teachersRouter.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
        // Find the teacher by email
    const teacher = await Teacher.findOne({ email });
    // If teacher not found, respond with error
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
       // Update the password (consider hashing in production)
    teacher.password = newPassword;  
    teacher.verificationCode = null; 
    await teacher.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = teachersRouter;
