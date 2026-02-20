const express = require('express');
const studentsRouter = express.Router();
const Student = require('../models/AnonymousStudentSchema');
const { randomUUID } = require('crypto');
const { asIL } = require('../utils/dates');

// השתמשי בעזר המרכזי לפורמט מקומי
const toLocal = asIL;

const addLocalDates = (doc) => {
  if (!doc) return doc;
  return {
    ...doc,
    createdAtLocal: toLocal(doc.createdAt),
    lastSeenAtLocal: toLocal(doc.lastSeenAt),
  };
};

/** ✅ DEBUG GET all (לבדיקה מה באמת נשמר ב־DB) */
studentsRouter.get('/', async (req, res) => {
  try {
    console.log('[GET /] Fetching all students...');
    const students = await Student.find({}, { _id: 0 });
    console.log(`[GET /] Found ${students.length} students`);
    res.status(200).json(students);
  } catch (error) {
    console.error('[GET /] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

/** ✅ AUTH (אנונימי): השרת מנפיק anonId חדש */
studentsRouter.post('/auth/anonymous', async (req, res) => {
  try {
    const anonId = randomUUID();
    console.log('\n=== [AUTH /anonymous] START ===');
    console.log('Generated anonId:', anonId);

    const result = await Student.updateOne(
      { anonId },
      { 
        $setOnInsert: { anonId, createdAt: new Date() },
        $set: { lastSeenAt: new Date() }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    console.log('[AUTH] Mongo updateOne result:', result);
const user = await Student.findOne({ anonId }, { _id: 0 }).lean();
return res.status(200).json({ user: addLocalDates(user) });

  } catch (err) {
    console.error('❌ [AUTH ERROR]:', err);
    return res.status(500).json({ message: err.message, code: err.code });
  }
});
studentsRouter.post('/demographics', async (req, res) => {
  try {
    console.log('\n=== [POST /demographics] START ===');
    console.log('Request body:', req.body);

    const { anonId, email, gender, ageRange, fieldOfStudy, semester } = req.body || {};
    if (!anonId) {
      console.warn('[DEMOGRAPHICS] Missing anonId!');
      return res.status(400).json({ message: 'anonId is required' });
    }

    const user = await Student.findOneAndUpdate(
      { anonId },
      {
        $set: {
          email: (email || '').trim().toLowerCase(), // ✅ הוספה
          gender,
          ageRange,
          fieldOfStudy,
          semester: String(semester || ''),
          lastSeenAt: new Date(),
        },
      },
      { new: true, projection: { _id: 0 } }
    ).lean();

    if (!user) {
      console.warn(`[DEMOGRAPHICS] User with anonId ${anonId} not found!`);
      return res.status(404).json({ message: 'Anonymous user not found' });
    }

    console.log('[DEMOGRAPHICS] Updated user:', user);
    return res.status(200).json({ message: 'Demographics saved', user: addLocalDates(user) });

  } catch (err) {
    console.error('❌ [DEMOGRAPHICS ERROR]:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/** ✅ עדכון lastSeenAt בסיום סשן */
studentsRouter.patch('/update-last-seen/:anonId', async (req, res) => {
  try {
    const { anonId } = req.params;
    console.log(`\n[PATCH /update-last-seen] anonId: ${anonId}`);

    const updated = await Student.findOneAndUpdate(
      { anonId },
      { $currentDate: { lastSeenAt: true } },
      { new: true, projection: { _id: 0, anonId: 1, lastSeenAt: 1 } }
    ).lean();

    if (!updated) {
      console.warn(`[PATCH] Student not found for anonId: ${anonId}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('[PATCH] Updated lastSeenAt:', updated.lastSeenAt);
    res.json({ 
  success: true, 
  lastSeenAt: updated.lastSeenAt, 
  lastSeenAtLocal: toLocal(updated.lastSeenAt) 
});

  } catch (err) {
    console.error('❌ [PATCH ERROR updating lastSeenAt]:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** ✅ שליפה לפי anonId */
studentsRouter.get('/by-anon/:anonId', async (req, res) => {
  try {
    console.log(`[GET /by-anon] anonId: ${req.params.anonId}`);
    const student = await Student.findOne({ anonId: req.params.anonId }, { _id: 0 }).lean();
    if (!student) {
      console.warn(`[GET /by-anon] No student found for anonId: ${req.params.anonId}`);
      return res.status(404).json({ message: 'Anonymous student not found' });
    }
    console.log('[GET /by-anon] Found student:', student);
res.status(200).json(addLocalDates(student));
  } catch (error) {
    console.error('❌ [GET /by-anon ERROR]:', error);
    res.status(500).json({ message: error.message });
  }
});

/** ✅ שליפה מרובה לפי רשימת anonIds */
studentsRouter.post('/details-by-anon', async (req, res) => {
  try {
    console.log('[POST /details-by-anon] body:', req.body);
    const { anonIds } = req.body;
    if (!Array.isArray(anonIds) || !anonIds.length) {
      console.warn('[details-by-anon] Missing anonIds array');
      return res.status(400).json({ message: 'anonIds array is required' });
    }

    const students = await Student.find({ anonId: { $in: anonIds } }, { _id: 0 }).lean();
    console.log(`[details-by-anon] Found ${students.length} students`);
res.status(200).json(students.map(addLocalDates));
  } catch (error) {
    console.error('❌ [details-by-anon ERROR]:', error);
    res.status(500).json({ message: error.message });
  }
});
/** ✅ תקציר סשן להצגה בחלון "תודה" בזמן Logout */
studentsRouter.get('/:anonId/session-summary', async (req, res) => {
  try {
    const { anonId } = req.params;

    // מביאים את הסטודנט (רק את מה שצריך)
    const doc = await Student.findOne(
      { anonId },
      { _id: 1, anonId: 1, createdAt: 1, lastSeenAt: 1 }
    ).lean();

    if (!doc) {
      return res.status(404).json({ error: 'student not found' });
    }

    // fallback עדין אם מסיבה כלשהי createdAt לא קיים
    const createdAt = doc.createdAt || (doc._id?.getTimestamp?.() ?? null);
    const lastSeenAt = doc.lastSeenAt || new Date();

    const payload = {
      anonId: doc.anonId,
      createdAt,
      lastSeenAt,
      createdAtLocal: toLocal(createdAt),
      lastSeenAtLocal: toLocal(lastSeenAt),
      // תוספת נחמדה למחקר: משך הסשן בשניות
      sessionDurationSec: (createdAt && lastSeenAt)
        ? Math.max(0, Math.round((new Date(lastSeenAt) - new Date(createdAt)) / 1000))
        : null,
    };

    return res.json(payload);
  } catch (e) {
    console.error('❌ [GET /:anonId/session-summary] error:', e);
    return res.status(500).json({ error: 'server error' });
  }
});

module.exports = studentsRouter;
