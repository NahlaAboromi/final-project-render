//C:\Users\n0502\OneDrive\שולחן העבודה\עבודה על הערות מגי יום שלישי רמדאן\final_project-main (2)\final_project-main\api\routers\admin.route.js
const express = require("express");


const router = express.Router();

const Trial = require("../models/Trial");
const AnonymousStudent = require("../models/AnonymousStudentSchema");
const SelAssessment = require("../models/SelAssessment");
const UeqAssessment = require("../models/UeqAssessment");
const Scenario = require("../models/Scenario");
const ScenarioHe = require("../models/Scenario.he");

const SelQuestion = require("../models/SelQuestion");
const SelQuestionHe = require("../models/SelQuestion.he");

const UeqQuestionEn = require("../models/UeqQuestion.en");
const UeqQuestionHe = require("../models/UeqQuestion.he");

// GET /api/admin/participants?groupType=experimental|control&from=2026-02-01&to=2026-02-27
router.get("/admin/participants", async (req, res) => {
  try {
    const { groupType, from, to } = req.query;

    // ✅ Filters
    const match = {};

    if (groupType && ["experimental", "control"].includes(groupType)) {
      match.groupType = groupType;
    }

    // assignedAt range filter
    if (from || to) {
      match.assignedAt = {};
      if (from) match.assignedAt.$gte = new Date(from);
      if (to) match.assignedAt.$lte = new Date(to);
    }

    const rows = await Trial.aggregate([
      { $match: match },

      // ✅ Join demographics by anonId
      {
        $lookup: {
          from: "anonymous_students", // collection name
          localField: "anonId",
          foreignField: "anonId",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },

      // ✅ Total Time (seconds): endedAt-startedAt if both exist, else 0
      {
        $addFields: {
          totalTimeSec: {
            $cond: [
              {
                $and: [
                  { $ne: ["$startedAt", null] },
                  { $ne: ["$endedAt", null] },
                ],
              },
              { $divide: [{ $subtract: ["$endedAt", "$startedAt"] }, 1000] },
              0,
            ],
          },
        },
      },

      // ✅ Shape response for table
      {
        $project: {
          _id: 0,
          anonId: 1,
          email: { $ifNull: ["$student.email", "—"] },

          groupType: 1,
          assignedAt: 1,
          totalTimeSec: 1,

          demographics: {
            gender: "$student.gender",
            ageRange: "$student.ageRange",
            fieldOfStudy: "$student.fieldOfStudy",
            semester: "$student.semester",
          },

          // placeholder for later page
          resultsUrl: { $concat: ["/admin/participants/", "$anonId", "/results"] },
        },
      },

      { $sort: { assignedAt: -1 } },
    ]);

    return res.json(rows);
  } catch (e) {
    console.error("❌ /api/admin/participants error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});
// GET admin stats
router.get("/admin/stats", async (req, res) => {
  try {

    const total = await Trial.countDocuments();

    const experimental = await Trial.countDocuments({
      groupType: "experimental"
    });

    const control = await Trial.countDocuments({
      groupType: "control"
    });

    res.json({
      total,
      experimental,
      control
    });

  } catch (err) {

    console.error("Admin stats error:", err);

    res.status(500).json({
      message: "Failed to load admin stats"
    });

  }
});
// ✅ router.get("/admin/results/:anonId", ...)
// (ודאי שלמעלה בקובץ יש את ה-require הבאים:)
// const Scenario = require("../models/Scenario");
// const ScenarioHe = require("../models/Scenario.he");
// const SelQuestion = require("../models/SelQuestion");
// const SelQuestionHe = require("../models/SelQuestion.he");
// const UeqQuestionEn = require("../models/UeqQuestion.en");
// const UeqQuestionHe = require("../models/UeqQuestion.he");

router.get("/admin/results/:anonId", async (req, res) => {
  try {
    const { anonId } = req.params;

    // 1) בסיס: Trial
    const trial = await Trial.findOne({ anonId }).lean();
    if (!trial) return res.status(404).json({ message: "Trial not found" });

    // 2) דמוגרפיה/אימייל (אופציונלי)
    const student = await AnonymousStudent.findOne({ anonId })
      .select("anonId email gender ageRange fieldOfStudy semester createdAt lastSeenAt")
      .lean();

    // 3) CASEL PRE/POST
    const [caselPre, caselPost] = await Promise.all([
      SelAssessment.findOne({ anonId, phase: "pre" }).lean(),
      SelAssessment.findOne({ anonId, phase: "post" }).lean(),
    ]);

    // 4) UEQ (האחרון אם יש כמה)
    const ueq = await UeqAssessment.findOne({ anonId }).sort({ createdAt: -1 }).lean();

    // ✅ קביעת שפה "אפקטיבית" (לפי מה שקיים בפועל)
    const effectiveLang = caselPost?.lang || caselPre?.lang || ueq?.lang || "he";
    const isHebrew = effectiveLang === "he";

    // ✅ שליפת הסימולציה עצמה לפי שפה (Scenario text/title/reflection)
    const scenarioDoc = isHebrew
      ? await ScenarioHe.findOne({ scenarioId: trial.scenarioId }).lean()
      : await Scenario.findOne({ scenarioId: trial.scenarioId }).lean();

    // ✅ שליפת שאלות CASEL לפי שפה (כדי שתוכלי להציג טקסט שאלון ולא רק questionKey)
    const caselVersion = caselPre?.version || caselPost?.version || "v1";
    const selQuestions = isHebrew
      ? await SelQuestionHe.find({ active: true, version: caselVersion }).sort({ order: 1 }).lean()
      : await SelQuestion.find({ active: true, version: caselVersion, lang: "en" })
          .sort({ order: 1 })
          .lean();

    // ✅ שליפת שאלות UEQ לפי שפה
    const ueqVersion = "ueq-s-v1";
    const ueqQuestions = isHebrew
      ? await UeqQuestionHe.find({ active: true, version: ueqVersion }).sort({ order: 1 }).lean()
      : await UeqQuestionEn.find({ active: true, version: ueqVersion }).sort({ order: 1 }).lean();

    // ---- חישובי זמנים ----
    const toMs = (d) => (d ? new Date(d).getTime() : null);

    const processStartedAt = trial.startedAt || null;
    const processEndedAt = trial.endedAt || null;

    const processDurationSec =
      processStartedAt && processEndedAt
        ? Math.max(0, Math.floor((toMs(processEndedAt) - toMs(processStartedAt)) / 1000))
        : 0;

    const simulationDurationSec =
      trial.simulationStartedAt && trial.simulationEndedAt
        ? Math.max(
            0,
            Math.floor((toMs(trial.simulationEndedAt) - toMs(trial.simulationStartedAt)) / 1000)
          )
        : 0;

    // צ'אט — רק לניסוי
    const isExperimental = trial.groupType === "experimental";
    const chatLog = Array.isArray(trial.chatLog) ? trial.chatLog : [];

    const chatStartedAt = isExperimental && chatLog.length ? chatLog[0].timestamp : null;
    const chatEndedAt = isExperimental && chatLog.length ? chatLog[chatLog.length - 1].timestamp : null;

    const chatDurationSec =
      isExperimental && chatStartedAt && chatEndedAt
        ? Math.max(0, Math.floor((toMs(chatEndedAt) - toMs(chatStartedAt)) / 1000))
        : 0;

    // ---- החזרת JSON מסודר ----
    return res.json({
      anonId,

      participant: {
        email: student?.email || null,
        demographics: student
          ? {
              gender: student.gender || null,
              ageRange: student.ageRange || null,
              fieldOfStudy: student.fieldOfStudy || null,
              semester: student.semester || null,
            }
          : null,
      },

      trialInfo: {
        groupType: trial.groupType,
        group: trial.group,
        scenarioId: trial.scenarioId,
        assignedAt: trial.assignedAt || null,
      },

      timeline: {
        processStartedAt,
        processEndedAt,
        processDurationSec,

        simulationStartedAt: trial.simulationStartedAt || null,
        simulationEndedAt: trial.simulationEndedAt || null,
        simulationDurationSec,

        // צ'אט רק לניסוי
        chatStartedAt: isExperimental ? chatStartedAt : null,
        chatEndedAt: isExperimental ? chatEndedAt : null,
        chatDurationSec: isExperimental ? chatDurationSec : 0,
      },

      // ✅ שאלות (כדי להציג את הטקסטים לפי שפה)
      questions: {
        lang: effectiveLang,
        casel: (selQuestions || []).map((q) => ({
          key: q.key,
          category: q.category,
          text: q.text,
          order: q.order,
          options: q.options || [],
        })),
        ueq: (ueqQuestions || []).map((q) => ({
          key: q.key,
          category: q.category,
          text: q.text,
          order: q.order,
          options: q.options || [],
        })),
      },

      casel: {
        pre: caselPre
          ? {
              startedAt: caselPre.startedAt || null,
              endedAt: caselPre.endedAt || null,
              completedAt: caselPre.completedAt || null,
              lang: caselPre.lang || null,
              version: caselPre.version || "v1",
              answers: caselPre.answers || [],
            }
          : null,

        post: caselPost
          ? {
              startedAt: caselPost.startedAt || null,
              endedAt: caselPost.endedAt || null,
              completedAt: caselPost.completedAt || null,
              lang: caselPost.lang || null,
              version: caselPost.version || "v1",
              answers: caselPost.answers || [],
            }
          : null,
      },

      // ✅ כאן מגיעה "הסימולציה עצמה" + תשובות + ניתוח
      simulation: {
        scenario: scenarioDoc
          ? {
              scenarioId: scenarioDoc.scenarioId,
              title: scenarioDoc.title,
              text: scenarioDoc.text,
              reflection: scenarioDoc.reflection || [],
            }
          : null,

        answers: trial.answers || [],
        aiAnalysis: trial.aiAnalysis || "",
        aiAnalysisJson: trial.aiAnalysisJson || {},
      },

      // ✅ רק לניסוי: צ'אט + סיכום/המלצות + רפלקציה
      socraticChat: isExperimental
        ? {
            chatStats: trial.chatStats || null,
            messages: chatLog.map((m) => ({
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
            })),
            aiConversationSummary: trial.aiConversationSummary || "",
            aiRecommendations: trial.aiRecommendations || [],
            finalReflection: trial.finalReflection || null,
          }
        : null,

      // UEQ (לשתי הקבוצות אם נאסף)
      ueq: ueq
        ? {
            createdAt: ueq.createdAt || null,
            lang: ueq.lang || null,
            responses: ueq.responses || {},
            scores: ueq.scores || null,
          }
        : null,
    });
  } catch (e) {
    console.error("❌ /api/admin/results/:anonId error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;