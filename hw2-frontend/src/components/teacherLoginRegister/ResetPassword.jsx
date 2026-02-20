// ResetPassword.jsx
import React, { useState, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";
import Footer from "../../layout/Footer";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import { ThemeContext, ThemeProvider } from "../../DarkLightMood/ThemeContext";

import { useI18n } from "../../utils/i18n";
import { LanguageContext } from "../../context/LanguageContext";

/**
 * ResetPasswordContent
 * שינויי שפה בלבד (i18n + dir/lang). אין שינוי לוגיקה.
 */
const ResetPasswordContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const email = query.get("email");
  const role = query.get("role");

  // i18n
  const { t, dir, lang: langAttr, ready } = useI18n("resetPassword");
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  // state (כמו שהיה)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!ready) return null; // מניעת FOUC קצר

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("errMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        role === "teacher"
          ? "/api/teachers/reset-password"
          : "/api/students/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(t("msgSuccess"));
        const loginPage = role === "teacher" ? "/login" : "/student-login";
        setTimeout(() => navigate(loginPage), 2500);
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
            {message && <Alert type="success" message={message} />}

            <form onSubmit={handleReset} className="space-y-4">
              <FormInput
                id="newPassword"
                name="newPassword"
                type="password"
                label={t("fieldNewLabel")}
                placeholder={t("fieldNewPlaceholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label={t("fieldConfirmLabel")}
                placeholder={t("fieldConfirmPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
                {t("btnReset")}
              </Button>
            </form>

            <p className="mt-4 text-sm text-center">
              {t("backTo")}{" "}
              {role === "teacher" ? (
                <Link to="/login" className="text-blue-500 hover:underline">{t("login")}</Link>
              ) : (
                <Link to="/student-login" className="text-blue-500 hover:underline">{t("login")}</Link>
              )}
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
const ResetPassword = () => (
  <ThemeProvider>
    <ResetPasswordContent />
  </ThemeProvider>
);

export default ResetPassword;
