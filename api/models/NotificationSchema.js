const mongoose = require('mongoose');

// Define schema for teacher notifications
const NotificationSchema = new mongoose.Schema({
  teacherId: { type: String, required: true }, 
  type: { 
    type: String, 
    enum: ['success', 'exam', 'message', 'schedule', 'warning'], 
    required: true 
  },
  title: { type: String, required: true }, 
  read: { type: Boolean, default: false } 
}, { timestamps: true }); 

// Export the model
module.exports = mongoose.model('Notification', NotificationSchema);
