// VerifyCode.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import Footer from "../../layout/Footer";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";

import { useI18n } from "../../utils/i18n";
import { LanguageContext } from "../../context/LanguageContext";

/**
 * VerifyCodeContent
 * שינויים לשפה בלבד (i18n + dir/lang). בלי שינוי לוגיקה.
 */
const VerifyCodeContent = () => {
  const [searchParams] = useSearchParams();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // i18n
  const { t, dir, lang: langAttr, ready } = useI18n("verifyCode");
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  // state/route (לוגיקה קיימת)
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const role = searchParams.get("role") || "student";

  useEffect(() => {
    const emailFromParams = searchParams.get("email");
    if (emailFromParams) setEmail(emailFromParams);
  }, [searchParams]);

  if (!ready) return null; // מניעת FOUC קצר

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        role === "teacher" ? "/api/teachers/verify-code" : "/api/students/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        setError(data.message || t("errInvalidCode"));
      }
    } catch (err) {
      setError(t("errServer"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      lang={langAttr}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      <main className="flex-1 w-full px-4 py-6 flex justify-center items-center">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-8 rounded w-full max-w-xl`}>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"} mb-2`}>
            {t("title")}
          </h1>
          <p className={`${isDark ? "text-gray-300" : "text-slate-600"} mb-6`}>
            {t("subtitle")}
          </p>

          <div className={`rounded-lg shadow-md p-6 ${isDark ? "bg-slate-600" : "bg-white"}`}>
            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleVerify} className="space-y-4">
              <FormInput
                id="email"
                name="email"
                type="email"
                label={t("fieldEmailLabel")}
                value={email}
                readOnly
              />

              <FormInput
                id="code"
                name="code"
                type="text"
                label={t("fieldCodeLabel")}
                placeholder={t("fieldCodePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="one-time-code"
              />

              <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                {t("btnVerify")}
              </Button>
            </form>

            <p className="mt-4 text-sm text-center">
              <Link
                to={role === "teacher" ? "/login" : "/student-login"}
                className="text-blue-500 hover:underline"
              >
                {t("backToLogin")}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/** Wrapper */
const VerifyCode = () => (
  <ThemeProvider>
    <VerifyCodeContent />
  </ThemeProvider>
);

export default VerifyCode;
