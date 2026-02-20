const mongoose = require("mongoose"); // Import mongoose for MongoDB interaction

// Define schema for student data
const studentSchema = new mongoose.Schema({
  username: { type: String, required: true }, // Student's username
  id: { type: String, required: true, unique: true }, // Unique student ID
  email: { type: String, required: true, unique: true }, // Unique email address
  password: { type: String, required: true }, // Hashed password (should be hashed before saving)
  profilePic: { type: String }  // Optional: URL or path to the profile picture
}, { 
  collection: "students", // Explicitly sets the MongoDB collection name to "students"
  versionKey: false       // Disables the automatic __v versioning field
});

// Export the model so it can be used in other parts of the application
module.exports = mongoose.model("student", studentSchema);
