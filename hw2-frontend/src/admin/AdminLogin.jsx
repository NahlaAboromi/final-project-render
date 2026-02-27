import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import Alert from "../components/Alert";
import Footer from "../layout/Footer";
import SharedHeader from "../layoutForEducatorsAndStudents/SharedHeader";
import { useI18n } from "../utils/i18n";

const AdminLoginContent = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // אם אין לך i18n לזה עדיין, אפשר זמנית לשים ready תמיד true (אבל עדיף כמו למטה)
  const { t, dir, lang, ready } = useI18n("adminLogin");

  const [form, setForm] = useState({ password: "" });
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
      // ✅ Prototype only: password = 12345
      if (form.password !== "12345") {
        setError(t("errors.invalidPassword"));
        return;
      }

      // שומרים "סשן" כדי שנוכל להגן על /admin אחר כך
      localStorage.setItem("adminToken", "local-admin");
      localStorage.setItem("adminSessionId", crypto?.randomUUID?.() || String(Date.now()));

      navigate("/admin");
    } catch (err) {
      console.error("❌ Admin login error:", err);
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
              src="https://cdn-icons-png.flaticon.com/512/1828/1828490.png"
              alt={t("adminAlt")}
              className="h-16 w-16"
            />
            <h2 className="text-3xl font-extrabold text-center">{t("title")}</h2>
            <p className="text-xs text-center opacity-80">{t("subtitle")}</p>
          </div>

          {error && <Alert type="error" message={error} />}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
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

const AdminLogin = () => (
  <ThemeProvider>
    <AdminLoginContent />
  </ThemeProvider>
);

export default AdminLogin;