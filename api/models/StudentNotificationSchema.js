const mongoose = require('mongoose'); // Import mongoose for MongoDB interaction

// Define schema for student notifications
const StudentNotificationSchema = new mongoose.Schema({
  studentId: { type: String, required: true }, // ID of the student receiving the notification
  type: { 
    type: String, 
    enum: ['submitted', 'exam','export'], // Type of notification (submission, exam, export)
    required: true 
  },
  title: { type: String, required: true }, // Notification title
  content: { type: String, required: true }, // Notification message content
  time: { type: String, required: true }, // Time of the notification (as a string)
  read: { type: Boolean, default: false } // Has the student read the notification? Default: false
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the model for use in other files
module.exports = mongoose.model('studentNotification', StudentNotificationSchema);
