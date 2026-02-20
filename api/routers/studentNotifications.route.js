const express = require('express');
const router = express.Router();
const studentNotification = require('../models/StudentNotificationSchema');

// Create a new notification
router.post('/create', async (req, res) => {
  try {
    const { studentId, type, title, content, time, read } = req.body;

    const newNotification = new studentNotification({
      studentId,
      type,
      title,
      content,
      time,
      read
    });

    await newNotification.save();

    res.status(201).json({ message: '✅ Notification created successfully', notification: newNotification });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notifications for a specific student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const notifications = await studentNotification.find({ studentId });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a single notification as read
router.patch('/mark-as-read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    const updated = await studentNotification.findByIdAndUpdate(notificationId, { read: true });

    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read for a specific student
router.patch('/mark-all-as-read/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    await studentNotification.updateMany({ studentId, read: false }, { read: true });

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
