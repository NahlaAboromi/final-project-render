const mongoose = require("mongoose"); // Import mongoose to define MongoDB schemas and models

// Define schema for teacher data
const teacherSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Teacher's name or username
  id: {
    type: String,
    required: true,
    unique: true, // Each teacher must have a unique ID
    match: [/^\d{9}$/, "ID must be exactly 9 digits"] // Validates that ID is 9 digits
  },
  email: { type: String, required: true, unique: true }, // Unique email address
  password: { type: String, required: true }, // Password 
  subject: { type: String }, // Subject taught by the teacher 
  profilePic: { type: String }  // Optional: URL or path to the profile picture
}, { 
  collection: "lecturers", // Store documents in the "lecturers" collection
  versionKey: false        // Disables the automatic __v versioning field
});

// Export the model so it can be used throughout the app
module.exports = mongoose.model("lecturer", teacherSchema);
