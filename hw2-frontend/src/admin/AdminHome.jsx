import React, { useContext } from "react";
import AdminHeader from "./AdminHeader";
import Footer from "../layout/Footer";
import AdminDashboardOverview from "./AdminDashboardOverview";
import AdminQuickActions from "./AdminQuickActions";

import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const AdminHomeContent = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext) || { lang: "he" };
  const isRTL = lang === "he";

  const { t, ready } = useI18n("adminHome");
  if (!ready) return null;

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="px-4 mt-4">
        <AdminHeader />
      </div>

      {/* Body */}
      <main className="flex-1 w-full px-4 py-6">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-6 rounded`}>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"} mb-1`}>
            {t("title")}
          </h1>
          <p className={`${isDark ? "text-gray-300" : "text-slate-600"} mb-6`}>
            {t("subtitle")}
          </p>

          {/* Overview cards */}
          <AdminDashboardOverview />

          {/* Quick actions */}
          <div className="mt-8">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-800"}`}>
              {t("quickActionsTitle")}
            </h2>
            <AdminQuickActions />
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

const AdminHome = () => (
  <ThemeProvider>
    <AdminHomeContent />
  </ThemeProvider>
);

export default AdminHome;