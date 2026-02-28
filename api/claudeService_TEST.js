// C:\Users\n0502\OneDrive\שולחן העבודה\עבודה על הערות מגי יום שלישי רמדאן\final_project-main (2)\final_project-main\api\claudeService_TEST.js

const claudeService = require('./services/claudeService');
// Analyzes a student's response using Claude AI and the CASEL 5 SEL framework
async function analyzeStudentResponse({ situation, question, studentResponse, studentName }) {
  console.log("\n================ analyzeStudentResponse START ================");
  console.log("INPUT situation length:", situation?.length);
  console.log("INPUT question length:", question?.length);
  console.log("INPUT studentResponse length:", studentResponse?.length);
  console.log("INPUT studentName:", studentName);
  console.log("=============================================================\n");

  // Prepare the prompt message for Claude AI with all required analysis instructions
  const messages = [
    {
      role: 'user',
      content: `Analyze the following student response to a social-emotional learning situation according to the CASEL 5 framework.
IMPORTANT LANGUAGE RULE:
- If the student's response is in Hebrew, do ALL analysis and text outputs in Hebrew.
- Otherwise, respond in English.
DATA QUALITY RULE:
- Avoid leaving any field empty or undefined. 
- Always provide meaningful content for every required field (e.g., use short feedback instead of an empty string, and at least one item in lists like strengths or areas for improvement).
IMPORTANT VOICE RULE:
- If studentName starts with "Anonymous", speak directly to the student ("you").
- Otherwise, describe the student in third-person ("the student").


Situation: "${situation}"
Question: "${question}"
Student Response: "${studentResponse}"
Student Name: "${studentName}"
Analyze across:
1. Self-awareness
2. Self-management
3. Social awareness
4. Relationship skills
5. Responsible decision-making


Return a JSON object with:
- selfAwareness: { score: 1-5, feedback: string }
- selfManagement: { score: 1-5, feedback: string }
- socialAwareness: { score: 1-5, feedback: string }
- relationshipSkills: { score: 1-5, feedback: string }
- responsibleDecisionMaking: { score: 1-5, feedback: string }
- Observed strengths (list of strings; if none, return an empty list [])
- Areas for improvement (list of strings; if none, return an empty list [])
- Overall score
- suggestedIntervention (string)
- redFlags (list)
- estimatedDepthLevel (string)
Return ONLY a valid JSON object without code fences, markdown, or extra text.
CRITICAL OUTPUT RULE:
Your response MUST be valid JSON only.
Do NOT write any text before the JSON.
Do NOT write any text after the JSON.
Do NOT include explanations, notes, or markdown.
Do NOT include code fences.
Start with { and end with } only.
If you violate this rule, the response will be rejected.
`
    }
  ];

  console.log("📤 Sending to Claude...");
  console.log("Messages preview:");
  console.dir(messages, { depth: null });

  const result = await claudeService.chat(messages, {
    maxTokens: 1500,
    temperature: 0.3
  });

  console.log("\n==============================");
  console.log("STEP 1 - FULL RESULT OBJECT");
  console.dir(result, { depth: null });

  console.log("\nSTEP 2 - SUCCESS FIELD");
  console.log(result.success);

  console.log("\nSTEP 3 - DATA FIELD");
  console.dir(result.data, { depth: null });

  console.log("\nSTEP 4 - CONTENT FIELD");
  console.dir(result.data?.content, { depth: null });

  console.log("\nSTEP 5 - FIRST CONTENT ITEM");
  console.dir(result.data?.content?.[0], { depth: null });

  console.log("\nSTEP 6 - RAW TEXT FROM CLAUDE:");
  console.log(result.data?.content?.[0]?.text);

  console.log("==============================\n");
  console.log("\n📥 Claude raw result:");
  console.dir(result, { depth: null });

  if (!result.success) {
    console.error("❌ Claude failed completely");
    console.error(result.error);

    console.log("================ analyzeStudentResponse END (FAIL) ================\n");
    return null;
  }

  // חשוב מאוד לבדוק שהמבנה קיים
  if (!result.data) {
    console.error("❌ result.data is missing");
    return null;
  }

  if (!result.data.content) {
    console.error("❌ result.data.content is missing");
    return null;
  }

  if (!result.data.content[0]) {
    console.error("❌ result.data.content[0] is missing");
    return null;
  }

  if (!result.data.content[0].text) {
    console.error("❌ result.data.content[0].text is missing");
    return null;
  }

  const aiText = result.data.content[0].text;

  console.log("\n========= RAW CLAUDE TEXT =========");
  console.log(aiText);
  console.log("===================================");

  console.log("\n🔍 Trying regex extraction...");

  const jsonMatch = aiText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("❌ REGEX FAILED — no JSON found");
    console.log("================ analyzeStudentResponse END (REGEX FAIL) ================\n");
    return null;
  }

  console.log("✅ REGEX SUCCESS");
  console.log("Extracted JSON:");
  console.log(jsonMatch[0]);

  try {
    console.log("\n🔄 Parsing JSON...");

    const parsed = JSON.parse(jsonMatch[0]);

    console.log("✅ JSON PARSE SUCCESS");
    console.log("Parsed keys:", Object.keys(parsed));
    console.log("================ analyzeStudentResponse END (SUCCESS) ================\n");

    return parsed;
  } catch (error) {
    console.error("❌ JSON PARSE FAILED");
    console.error(error.message);

    console.log("Bad JSON:");
    console.log(jsonMatch[0]);

    console.log("================ analyzeStudentResponse END (PARSE FAIL) ================\n");
    return null;
  }
}

/* =========================
   MAIN (runs the analysis)
   ========================= */
async function main() {
  const situation = `כמנהלת צוות סטודנטים בפרויקט קהילתי, שמת לב שאחד מחברי הצוות מתקשה להשמיע את דעותיו בפגישות. למרות שבשיחות פרטיות הוא מציע רעיונות מצוינים, בדיונים קבוצתיים הוא נשאר שקט ומתכנס בעצמו.`;

  const question = `כיצד תיצור/י סביבת מנהיגות שמעודדת השתתפות שוויונית ומעצימה גם את הקולות השקטים בצוות, תוך שמירה על התקדמות יעילה של הפרויקט?`;

  const studentResponse = `כמנהלת צוות, חשוב לי ליצור סביבה שבה כל חבר צוות מרגיש בטוח, מוערך ובעל משמעות. קודם כל, אקפיד לבסס נורמות של הקשבה, כבוד הדדי ואי-שיפוטיות, ואבהיר שכל רעיון הוא חשוב ותורם להתקדמות המשותפת.

בנוסף, אשתמש בשיטות שמקדמות השתתפות שוויונית, כמו סבב דיבור שבו כל אחד מקבל הזדמנות להביע את דעתו, או עבודה בקבוצות קטנות לפני הדיון הכללי. כך חבר הצוות שמתקשה לדבר בפני כולם יוכל להרגיש יותר בנוח לשתף את רעיונותיו.

אני גם אפנה אליו באופן אישי בגישה תומכת ומעודדת, אחזק את הביטחון שלו ואציע לו לשתף את רעיונותיו בקבוצה, תוך הדגשת הערך שלהם. חשוב לי לעשות זאת ברגישות, כדי שלא ירגיש לחץ אלא תמיכה.

לבסוף, אאפשר דרכי השתתפות נוספות, כמו כתיבת רעיונות מראש או שיתוף בצ'אט, כדי לתת מקום גם למי שמעדיף להתבטא בצורה אחרת. כך ניתן להעצים את כל חברי הצוות, לעודד תחושת שייכות, ובמקביל לשמור על התקדמות יעילה של הפרויקט באמצעות שילוב מגוון רעיונות ונקודות מבט.`;

  const studentName = "AnonymousStudent";

  const parsed = await analyzeStudentResponse({
    situation,
    question,
    studentResponse,
    studentName,
  });

  console.log("\n================ FINAL PARSED RESULT ================");
  console.dir(parsed, { depth: null });
  console.log("====================================================\n");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("MAIN ERROR:", err);
  });
}

// Export (optional) in case you want to import it elsewhere later
module.exports = { analyzeStudentResponse };