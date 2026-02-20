const express = require('express');
const router = express.Router();
const Notification = require('../models/NotificationSchema');
const HebrewNotification = require('../models/HebrewNotification');

//nahla
router.post('/create', async (req, res) => {
  try {
    // ⭐ נוסיף titleHe כדי שתוכלי בעתיד לשלוח טקסט עברי מהקליינט
    const { teacherId, type, title, read, titleHe } = req.body;

    // 1) שמירה רגילה באנגלית – כמו שהיה
    const newNotification = new Notification({
      teacherId,
      type,
      title,
      read
    });

    await newNotification.save();

const hebrewNotification = new HebrewNotification({
  notificationId: newNotification._id, // קישור לאנגלית
  teacherId,
  type,
  title: titleHe, // ⭐ כאן נשמרת רק עברית
  read
});
    await hebrewNotification.save();

    // 3) תשובה ללקוח – משאירים כמו שהיה (לא שוברים פרונט)
    res.status(201).json({
      message: '✅ Notification created successfully',
      notification: newNotification
      // אפשר להוסיף גם: heNotification: hebrewNotification אם תרצי בהמשך
    });
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieves all notifications for a specific teacher, sorted by newest first.
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { lang } = req.query || {}; // ⭐ נקרא שפה מה-URL (he/en)

    let notifications;

    if (lang === 'he') {
      // ⭐ אם השפה עברית – מביאים מהטבלה העברית
      notifications = await HebrewNotification
        .find({ teacherId })
        .sort({ createdAt: -1 });

      // אופציונלי: אם אין כלום בעברית – נ fallback לאנגלית
      if (!notifications || notifications.length === 0) {
        notifications = await Notification
          .find({ teacherId })
          .sort({ createdAt: -1 });
      }
    } else {
      // ברירת מחדל – אנגלית
      notifications = await Notification
        .find({ teacherId })
        .sort({ createdAt: -1 });
    }

    res.status(200).json(notifications || []);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Marks a single notification as read (both EN + HE if קיימים).
router.patch('/mark-as-read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    // קודם ננסה לעדכן באנגלית
    let updated = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (updated) {
      // אם מצאנו באנגלית – נסמן גם את המקבילה בעברית (אם יש)
      await HebrewNotification.updateOne(
        { notificationId: updated._id },
        { read: true }
      );

      return res.status(200).json({
        message: 'Notification marked as read',
        notification: updated
      });
    }

    // אם לא מצאנו באנגלית – ננסה בעברית
    const updatedHe = await HebrewNotification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!updatedHe) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // נסמן גם את האנגלית (אם יש קישור)
    if (updatedHe.notificationId) {
      await Notification.updateOne(
        { _id: updatedHe.notificationId },
        { read: true }
      );
    }

    res.status(200).json({
      message: 'Notification marked as read (HE)',
      notification: updatedHe
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Marks all notifications as read for a specific teacher.
// Marks all notifications as read for a specific teacher (EN + HE).
router.patch('/mark-all-as-read/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // אנגלית
    await Notification.updateMany(
      { teacherId, read: false },
      { read: true }
    );

    // עברית
    await HebrewNotification.updateMany(
      { teacherId, read: false },
      { read: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
