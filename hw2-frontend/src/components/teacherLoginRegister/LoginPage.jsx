import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../../DarkLightMood/ThemeContext";
import { UserContext } from "../../context/UserContext";
import SharedHeader from "../../layoutForEducatorsAndStudents/SharedHeader";
import Footer from "../../layout/Footer";
import FormInput from "../FormInput";
import Button from "../Button";
import Alert from "../Alert";

import { useI18n } from "../../utils/i18n";
import { LanguageContext } from "../../context/LanguageContext";

/**
 * Teacher Login Page
 * login form for teachers, authenticates credentials,
 * and navigates to the teacher dashboard upon successful login.
 */

const LoginContent = () => {
  // contexts
  const { login } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext) || { lang: "he" };

  // i18n
  const { t, dir, lang: langAttr, ready } = useI18n("teacherLogin");
  const isDark = theme === "dark";

  // router + state
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return null; // טעינה מהירה של המילון כדי למנוע FOUC

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!form.id || !form.password) {
      setError(t("errFillBoth"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/teachers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.teacher);
        navigate("/teacher/Teacher");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || t("errLoginFailed"));
      }
    } catch (e2) {
      console.error("❌ Login error:", e2);
      setError(t("errLoginGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={dir}
      lang={langAttr}
      className={`min-h-screen w-screen flex flex-col ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`max-w-md w-full space-y-8 ${
            isDark ? "bg-slate-800" : "bg-white"
          } p-10 rounded-xl shadow-lg`}
        >
          {/* Logo + Title */}
          <div className="flex flex-col items-center space-y-2">
            <img src="/educator-icon.png" alt={t("altEducator")} className="w-16 h-16" />
            <h2 className="text-3xl font-extrabold text-center">{t("title")}</h2>
            <p className="text-xs text-center">{t("subtitle")}</p>
          </div>

          {/* Error */}
          {error && <Alert type="error" message={error} />}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <FormInput
                id="id"
                name="id"
                label={t("fieldIdLabel")}
                placeholder={t("fieldIdPlaceholder")}
                value={form.id}
                onChange={handleChange}
                autoComplete="username"
              />
              <FormInput
                id="password"
                name="password"
                type="password"
                label={t("fieldPasswordLabel")}
                placeholder={t("fieldPasswordPlaceholder")}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {/* Forgot */}
            <div className="text-sm mb-2">
              <Link
                to="/forgot-password?role=teacher"
                className="text-blue-500 hover:underline"
              >
                {t("forgot")}
              </Link>
            </div>

            {/* Submit */}
            <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
              {t("btnSignIn")}
            </Button>
          </form>

          {/* Register */}
          <p className="mt-4 text-sm text-center">
            {t("noAccount")}{" "}
            <Link to="/register?role=teacher" className="text-blue-500 hover:underline">
              {t("registerNow")}
            </Link>
          </p>
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
 * Wrapper with ThemeProvider
 */
const Login = () => (
  <ThemeProvider>
    <LoginContent />
  </ThemeProvider>
);

export default Login;
