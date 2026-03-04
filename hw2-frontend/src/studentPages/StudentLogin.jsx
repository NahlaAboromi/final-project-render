// src/studentPages/StudentLogin.jsx (או איפה שהקובץ אצלך)
import React, { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { UserContext } from "../context/UserContext";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Footer from "../layout/Footer";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";

import { useI18n } from "../utils/i18n"; // ✅

const LoginPage = () => {
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { t, dir, lang, ready } = useI18n("studentLogin"); // ✅

  const [form, setForm] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.student);
        navigate("/StudentHome");
      } else {
        const errorData = await response.json();
        setError(errorData.message || t("errors.loginFailed"));
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(t("errors.loginError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div
      dir={dir}
      lang={lang}
      className={`min-h-screen w-screen flex flex-col ${
        isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
      }`}
    >
      <div className="px-4 mt-4">
        <SharedHeader />
      </div>

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div
          className={`max-w-md w-full space-y-8 ${
            isDark ? "bg-slate-800" : "bg-white"
          } p-10 rounded-xl shadow-lg`}
        >
          <div className="flex flex-col items-center space-y-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
              alt={t("studentAlt")}
              className="h-16 w-16"
            />
            <h2 className="text-3xl font-extrabold text-center">
              {t("title")}
            </h2>

            <p className="text-xs text-center">
              {t("noAccount")}{" "}
              <Link
                to="/register?role=student"
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                {t("registerNow")}
              </Link>
            </p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <FormInput
                id="id"
                name="id"
                label={t("fields.id.label")}
                placeholder={t("fields.id.placeholder")}
                value={form.id}
                onChange={handleChange}
                required
              />

              <FormInput
                id="password"
                name="password"
                type="password"
                label={t("fields.password.label")}
                placeholder={t("fields.password.placeholder")}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password?role=student"
                className="font-medium text-blue-500 hover:text-blue-600"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
              {t("signIn")}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const StudentLoginPage = () => {
  return (
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>
  );
};

export default StudentLoginPage;