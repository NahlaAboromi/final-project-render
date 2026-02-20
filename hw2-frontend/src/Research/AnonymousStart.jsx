import React, { useContext, useRef, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { useAnonymousStudent as useStudent } from "../context/AnonymousStudentContext";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../layout/Footer";
import Button from "../components/Button";
import Alert from "../components/Alert";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const AnonymousStartContent = () => {
  const { theme } = useContext(ThemeContext);
    // 🔹 cache keys ל-UEQ-S
  const UEQ_CACHE_KEY_HE = "ueq_questions_he_v1";
  const UEQ_CACHE_KEY_EN = "ueq_questions_en_v1";

  // 🔹 Prefetch לשאלון UEQ-S (HE+EN) כשנכנסים למסך הראשון
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        // אם כבר קיים ב-localStorage – לא נביא שוב
        const hasHe = localStorage.getItem(UEQ_CACHE_KEY_HE);
        const hasEn = localStorage.getItem(UEQ_CACHE_KEY_EN);
        if (hasHe && hasEn) {
          console.log("UEQ-S cached in localStorage – skipping prefetch");
          return;
        }

        console.log("🔄 Prefetch UEQ-S HE+EN from server...");

        const [heRes, enRes] = await Promise.all([
          fetch("/api/questionnaires/ueq?lang=he", { signal: controller.signal }),
          fetch("/api/questionnaires/ueq?lang=en", { signal: controller.signal }),
        ]);

        if (heRes.ok) {
          const heData = await heRes.json();
          localStorage.setItem(UEQ_CACHE_KEY_HE, JSON.stringify(heData));
          console.log("✅ UEQ-S HE cached");
        } else {
          console.warn("⚠️ UEQ-S HE fetch failed:", heRes.status);
        }

        if (enRes.ok) {
          const enData = await enRes.json();
          localStorage.setItem(UEQ_CACHE_KEY_EN, JSON.stringify(enData));
          console.log("✅ UEQ-S EN cached");
        } else {
          console.warn("⚠️ UEQ-S EN fetch failed:", enRes.status);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("⚠️ UEQ-S prefetch error:", err);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  const isDark = theme === "dark";
  const { lang } = useContext(LanguageContext);
  const isRTL = lang === "he";
  const { t } = useI18n("anonymousStart");
  const navigate = useNavigate();
  const { setStudent, startSessionTimer, loadQuestionnaire } = useStudent();

  // 🔹 סטייטים
const [form, setForm] = useState({
  email: "",
  gender: "",
  ageRange: "",
  fieldOfStudy: "",
  customFieldOfStudy: "",
  semester: "",
});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const refs = {
    fieldOfStudy: useRef(null),
    customFieldOfStudy: useRef(null),
    semester: useRef(null),
    gender: useRef(null),
    ageRange: useRef(null),
    email: useRef(null),
  };

  const SEMESTER_VALUES_EN = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester",
    "5th Semester", "6th Semester", "7th Semester", "8th Semester or higher"
  ];

  const friendlyMissingMessage = useMemo(() => t("missing"), [t]);

  // 🟦 שינוי ערך
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setOkMsg("");
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[name];
      if (name === "fieldOfStudy" && value !== "other") delete copy.customFieldOfStudy;
      return copy;
    });
  };

  // ✅ בדיקה
const validate = () => {
  const errs = {};

  const email = (form.email || "").trim().toLowerCase();
  if (!email) errs.email = t("v_email");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t("v_emailFormat");
  else if (!email.endsWith("@e.braude.ac.il")) errs.email = t("v_emailBraude");

  const finalField =
    form.fieldOfStudy === "other"
      ? (form.customFieldOfStudy || "").trim()
      : form.fieldOfStudy;

  if (!form.fieldOfStudy) errs.fieldOfStudy = t("v_field");
  if (form.fieldOfStudy === "other" && !finalField) errs.customFieldOfStudy = t("v_fieldOther");
  if (!form.semester) errs.semester = t("v_semester");
  if (!form.gender) errs.gender = t("v_gender");
  if (!form.ageRange) errs.ageRange = t("v_age");

  return { errs, finalField };
};


  const focusFirstError = (errs) => {
const order = ["email", "fieldOfStudy", "customFieldOfStudy", "semester", "gender", "ageRange"];
    const first = order.find((f) => errs[f]);
    if (first && refs[first]?.current) {
      refs[first].current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => refs[first].current?.focus?.(), 250);
    }
  };

  // 🟢 שליחה
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setOkMsg("");

    const { errs, finalField } = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      focusFirstError(errs);
      setIsLoading(false);
      return;
    }

    try {
      // 1️⃣ יצירת משתמש אנונימי
      const authRes = await fetch("/api/anonymous/auth/anonymous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!authRes.ok) throw new Error(t("err_auth"));
      const { user } = await authRes.json();
      const serverAnonId = user?.anonId;
      if (!serverAnonId) throw new Error(t("err_noAnon"));

      // 2️⃣ שליחת דמוגרפיה
      const payload = {
        anonId: serverAnonId,
        email: (form.email || "").trim().toLowerCase(),
        gender: form.gender,
        ageRange: form.ageRange,
        fieldOfStudy: finalField,
        semester: String(form.semester || "").trim(),
      };

      const demoRes = await fetch("/api/anonymous/demographics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!demoRes.ok) throw new Error(t("err_demo"));
      await demoRes.json();

      // 3️⃣ שמירת פרטי סטודנט
      setStudent({
        anonId: serverAnonId,
        demographics: payload,
        assessmentStatus: "not-started",
        uiLang: lang,
      });
      startSessionTimer();

      // 4️⃣ טעינת שאלון
      await loadQuestionnaire({ lang });

      // 5️⃣ שיוך לקבוצה
      const asgRes = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anonId: serverAnonId }),
      });
      if (!asgRes.ok) throw new Error(t("err_assign"));
      const assignment = await asgRes.json();

      setStudent((s) => ({ ...s, assignment }));

      // ✅ מעבר למסך הבא
      navigate("/assignment", { state: { assignment } });
    } catch (err) {
      console.error("❌ Anonymous start error:", err);
      setError(err.message || t("err_generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const baseFieldClass =
    "mt-1 block w-full rounded-md border p-2 md:p-3 text-sm md:text-base bg-white dark:bg-gray-700 dark:text-white transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const errorBorder = "border-red-500";
  const normalBorder = "border-gray-300 dark:border-gray-600";

  // 🖥️ ממשק
  return (
<div
  dir={isRTL ? "rtl" : "ltr"}
  lang={lang}
  style={{ fontFamily: lang === "he" ? "Heebo, Rubik, Arial, sans-serif" : "inherit" }}
  className={`flex flex-col min-h-screen w-screen ${

        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Header - מינימלי */}
      <div className="px-2 md:px-4 py-1 md:py-2">
        <SharedHeader />
      </div>

      {/* Main - גמיש ומותאם */}
      <main className="flex-1 w-full px-2 md:px-4 py-1 md:py-3 overflow-auto">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-2 md:p-4 rounded max-w-4xl mx-auto`}>
          
          {/* כותרת - קומפקטית יותר */}
          <div className="mb-2 md:mb-3 text-center">
            <h1
              className={`text-xl md:text-3xl font-extrabold bg-gradient-to-r ${
                isDark ? "from-blue-400 to-purple-400" : "from-blue-600 to-purple-600"
              } bg-clip-text text-transparent mb-0.5 md:mb-1`}
            >
              {t("brandTitle")}
            </h1>
            <p
              className={`text-xs md:text-base ${
                isDark ? "text-gray-300" : "text-slate-600"
              } flex items-center justify-center gap-1 md:gap-2`}
            >
              <span className="text-sm md:text-base">💡</span>
              <span>{t("brandSubtitle")}</span>
              <span className="text-sm md:text-base">🎓</span>
            </p>
          </div>

          {/* כרטיס */}
          <div className={`rounded-lg shadow-md p-3 md:p-5 ${isDark ? "bg-slate-600" : "bg-white"}`}>
            
            {/* כותרת פנימית - עוד יותר קומפקטית */}
            <div className="mb-2 md:mb-3 text-center">
              <div className="text-2xl md:text-3xl mb-1">🤖💡</div>
              <h2 className={`text-lg md:text-xl font-bold ${isDark ? "text-white" : "text-slate-800"} mb-0.5 md:mb-1`}>
                {t("welcomeTitle")}
              </h2>
              <p className={`text-xs md:text-sm ${isDark ? "text-gray-300" : "text-slate-600"} leading-tight`}>
                {t("welcomeDesc")}
                <br />
                <span className="text-xs italic opacity-80 flex items-center justify-center gap-1 mt-0.5">
                  <span>🔒</span>
                  <span>{t("welcomeNote")}</span>
                </span>
              </p>
            </div>

            {/* הודעות */}
            {error && <Alert type="error" message={error} />}
            {okMsg && <Alert type="success" message={okMsg} />}
{Object.keys(fieldErrors).length > 0 && (
  <Alert
    type="warning"
    message={
      fieldErrors.email
        ? t("invalidEmailTop")
        : t("missing")
    }
  />
)}


            {/* טופס - grid של 2 עמודות במובייל */}
            <form className="mt-2 md:mt-3" onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {/* Braude Email */}
<div className="md:col-span-2">
  <label htmlFor="email" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
    <span>✉️</span> <span>{t("emailLabel")}</span> <span className="text-red-500">*</span>
  </label>

  <input
    ref={refs.email}
    id="email"
    name="email"
    type="email"
    inputMode="email"
    autoComplete="email"
    placeholder={t("emailPlaceholder")}
    value={form.email}
    onChange={handleChange}
    className={`${baseFieldClass} ${fieldErrors.email ? errorBorder : normalBorder}`}
  />

<p
  className={`mt-1 text-[11px] md:text-xs ${
    isDark ? "text-gray-300" : "text-slate-500"
  }`}
>
  {t("emailNote")}
</p>

{fieldErrors.email && (
  <p
    className={`mt-1 text-[11px] md:text-xs text-red-500 font-medium`}
  >
    {fieldErrors.email}
  </p>
)}

</div>

                {/* Field of Study */}
                <div className="md:col-span-2">
                  <label htmlFor="fieldOfStudy" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>📚</span> <span>{t("fieldOfStudy")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.fieldOfStudy}
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    value={form.fieldOfStudy}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.fieldOfStudy ? errorBorder : normalBorder
                    }`}
                  >
                    <option value="" disabled>
                      {t("selectField")}
                    </option>
                    <option value="Software Engineering">{t("fs_SW")}</option>
                    <option value="Computer Science">{t("fs_CS")}</option>
                    <option value="Information Systems">{t("fs_IS")}</option>
                    <option value="Psychology">{t("fs_PSY")}</option>
                    <option value="Education">{t("fs_EDU")}</option>
                    <option value="Business Management">{t("fs_BIZ")}</option>
                    <option value="Industrial Engineering">{t("fs_IE")}</option>
                    <option value="Biology">{t("fs_BIO")}</option>
                    <option value="Nursing">{t("fs_NUR")}</option>
                    <option value="Law">{t("fs_LAW")}</option>
                    <option value="other">{t("fs_OTHER")}</option>
                  </select>
                  {form.fieldOfStudy === "other" && (
                    <input
                      ref={refs.customFieldOfStudy}
                      type="text"
                      name="customFieldOfStudy"
                      placeholder={t("otherFieldPh")}
                      value={form.customFieldOfStudy}
                      onChange={handleChange}
                      className={`${baseFieldClass} mt-2 ${
                        fieldErrors.customFieldOfStudy ? errorBorder : normalBorder
                      }`}
                    />
                  )}
                </div>

                {/* Semester */}
                <div>
                  <label htmlFor="semester" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>📅</span> <span>{t("currentSemester")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.semester}
                    id="semester"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.semester ? errorBorder : normalBorder
                    }`}
                  >
                    <option value="" disabled>
                      {t("selectSemester")}
                    </option>
                    {SEMESTER_VALUES_EN.map((value, i) => (
                      <option key={value} value={value}>
                        {t(`s_${i + 1}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label htmlFor="ageRange" className="block text-xs md:text-sm font-semibold mb-1 flex gap-1 items-center">
                    <span>😊</span> <span>{t("ageRange")}</span> <span className="text-red-500">*</span>
                  </label>
                  <select
                    ref={refs.ageRange}
                    id="ageRange"
                    name="ageRange"
                    value={form.ageRange}
                    onChange={handleChange}
                    className={`${baseFieldClass} ${
                      fieldErrors.ageRange ? errorBorder : normalBorder
                    }`}
                  >
                    <option value="" disabled>
                      {t("selectAgeRange")}
                    </option>
                    <option value="18-22">{t("ar_18_22")}</option>
                    <option value="23-26">{t("ar_23_26")}</option>
                    <option value="27-30">{t("ar_27_30")}</option>
                    <option value="31-35">{t("ar_31_35")}</option>
                    <option value="36+">{t("ar_36p")}</option>
                  </select>
                </div>

                {/* Gender - תופס רוחב מלא */}
                <div className="md:col-span-2">
                  <span className="block text-xs md:text-sm font-semibold mb-2 flex gap-1 items-center">
                    <span>{t("gender")}</span> <span className="text-red-500">*</span>
                  </span>
                  <div className="flex gap-4 md:gap-6 justify-center flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={form.gender === "male"}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span>{t("male")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={form.gender === "female"}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span>{t("female")}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                      <input
                        type="radio"
                        name="gender"
                        value="other"
                        checked={form.gender === "other"}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span>{t("other")}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* כפתור */}
              <div className="mt-3 md:mt-4">
                <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                  <span className="flex items-center justify-center gap-2 text-base md:text-lg">
                    <span>🚀</span> <span>{t("startCTA")}</span>
                  </span>
                </Button>
              </div>
            </form>

            {/* Privacy - קומפקטי */}
            <div
              className={`mt-2 md:mt-3 p-2 md:p-3 rounded-lg ${
                isDark ? "bg-slate-800/50" : "bg-blue-50"
              } border ${isDark ? "border-slate-600" : "border-blue-200"}`}
            >
              <p className="text-xs opacity-90 flex items-start gap-1.5 leading-tight">
                <span className="text-sm">🔒</span>
                <span>
                  <strong>{t("privacyTitle")}</strong> {t("privacyText")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - מינימלי */}
      <div className="px-2 md:px-4 py-1 md:py-2">
        <Footer />
      </div>
    </div>
  );
};

const AnonymousStart = () => (
  <ThemeProvider>
    <AnonymousStartContent />
  </ThemeProvider>
);

export default AnonymousStart;