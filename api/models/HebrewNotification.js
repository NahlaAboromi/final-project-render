// api/models/HebrewNotificationSchema.js
const mongoose = require('mongoose');

const HebrewNotificationSchema = new mongoose.Schema({
  // קישור אחד־על־אחד להתראה המקורית באנגלית
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
    unique: true
  },

  teacherId: { type: String, required: true },

  type: {
    type: String,
    enum: ['success', 'exam', 'message', 'schedule', 'warning'],
    required: true
  },

  // הכותרת בעברית
  title: { type: String, required: true },

  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('HebrewNotification', HebrewNotificationSchema);
