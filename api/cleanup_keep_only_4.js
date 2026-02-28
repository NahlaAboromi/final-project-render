/**
 * api/cleanup_keep_only_4.js
 *
 * Keeps ONLY the given anonIds in:
 * - Trial
 * - SelAssessment
 * - UeqAssessment
 * - AnonymousStudent
 *
 * Usage:
 *   node cleanup_keep_only_4.js --dry
 *   node cleanup_keep_only_4.js --force
 *
 * Requirements:
 * - MONGO_URI must be available (same as your server uses)
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ✅ Update these paths if your project structure differs
const Trial = require("./models/Trial");
const SelAssessment = require("./models/SelAssessment");
const UeqAssessment = require("./models/UeqAssessment");
const AnonymousStudent = require("./models/AnonymousStudentSchema");

// ✅ Keep ONLY these anonIds
const KEEP_ANON_IDS = [
  "b5cdb689-9e3b-4d89-bfe0-ce0946cb2a5f",
  "614058aa-d455-4103-8f66-d5de75110f79",
  "8af7ebbc-ff5d-4668-91bf-eb6732429301",
  "c8a6f175-8c79-4da3-9d46-8881fd4b0596",
];

function hasArg(name) {
  return process.argv.includes(name);
}

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGO_URI (or MONGODB_URI). Put it in api/.env like: MONGO_URI=..."
    );
  }
  await mongoose.connect(uri);
}

async function countToDelete(Model, field = "anonId") {
  return Model.countDocuments({ [field]: { $nin: KEEP_ANON_IDS } });
}

async function deleteOthers(Model, field = "anonId") {
  return Model.deleteMany({ [field]: { $nin: KEEP_ANON_IDS } });
}

async function run() {
  const dry = hasArg("--dry");
  const force = hasArg("--force");

  if (!dry && !force) {
    console.log(
      "❗Choose a mode:\n  node cleanup_keep_only_4.js --dry   (preview)\n  node cleanup_keep_only_4.js --force (delete)"
    );
    process.exit(1);
  }

  await connectDB();
  console.log("✅ Connected to MongoDB");
  console.log("✅ Keeping ONLY these anonIds:", KEEP_ANON_IDS);

  const targets = [
    { name: "Trial", model: Trial, field: "anonId" },
    { name: "SelAssessment", model: SelAssessment, field: "anonId" },
    { name: "UeqAssessment", model: UeqAssessment, field: "anonId" },
    { name: "AnonymousStudent", model: AnonymousStudent, field: "anonId" },
  ];

  // Preview counts
  console.log("\n📌 Preview (how many will be deleted):");
  for (const t of targets) {
    const n = await countToDelete(t.model, t.field);
    console.log(`- ${t.name}: ${n}`);
  }

  if (dry) {
    console.log("\n🟡 DRY RUN only. No deletions performed.");
    return;
  }

  console.log("\n🚨 FORCE MODE: deleting...");
  for (const t of targets) {
    const res = await deleteOthers(t.model, t.field);
    console.log(`- ${t.name}: deleted ${res.deletedCount}`);
  }

  console.log("\n✅ Done. Only the 4 anonIds should remain in these collections.");
}

run()
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {}
  });