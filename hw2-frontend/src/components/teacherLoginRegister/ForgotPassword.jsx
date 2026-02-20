import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";
import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../../layout/Footer";

import { useI18n } from "../../utils/i18n";
import { LanguageContext } from "../../context/LanguageContext";

/**
 * ForgotPasswordContent
 * 
 * Renders "Forgot Password" form for both students and teachers.
 * (Language-only changes: i18n + dir/lang. No logic changes.)
 */
const ForgotPasswordContent = () => {
  // theme
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // role from query
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const role = searchParams.get("role") || "student";

  // i18n
  const { t, dir, lang: langAttr, ready } = useI18n("forgotPassword");
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  // router + state
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(""); // left as-is (logic unchanged)
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // email regex
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!ready) return null; // מניעת FOUC קטן

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email.trim()) {
      setError(t("errEmailRequired"));
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError(t("errEmailFormat"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        role === "teacher"
          ? "/api/teachers/forgot-password"
          : "/api/students/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate(`/verify-code?email=${encodeURIComponent(email)}&role=${role}`);
      } else {
        setError(data.message || t("errGeneric"));
      }
    } catch {
      setError(t("errGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      lang={langAttr}
      className={`min-h-screen w-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-900'}`}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      {/* Main */}
      <main className="flex-1 w-full px-4 py-6 flex justify-center items-center">
        <div className={`max-w-md w-full space-y-8 ${isDark ? 'bg-slate-800' : 'bg-white'} p-10 rounded-xl shadow-lg`}>
          <div className="flex flex-col items-center space-y-2">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>
              {t("title")}
            </h1>
            <p className={`text-xs text-center ${isDark ? 'text-gray-300' : 'text-slate-600'} mb-6`}>
              {t("subtitle")}
            </p>

            {/* Alerts */}
            {error && <Alert type="error" message={error} />}
            {message && <Alert type="success" message={message} />}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              id="email"
              name="email"
              type="text"
              label={t("fieldEmailLabel")}
              placeholder={t("fieldEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
              {t("btnSendCode")}
            </Button>
          </form>

          <div className="text-sm text-center mt-4">
            <Link
              to={role === "teacher" ? "/login" : "/student-login"}
              className="text-blue-500 hover:text-blue-600"
            >
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

/**
 * Wrapper
 */
const ForgotPassword = () => (
  <ThemeProvider>
    <ForgotPasswordContent />
  </ThemeProvider>
);

export default ForgotPassword;
