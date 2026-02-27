import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import ThemeToggle from "../DarkLightMood/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

const AdminHeader = () => {
  const navigate = useNavigate();

  // Theme + Language
  const { theme } = useContext(ThemeContext);
  const { lang } = useContext(LanguageContext);
  const isDark = theme === "dark";
  const isRTL = lang === "he";

  // i18n (אפשר להוסיף json בהמשך)
  const { t, dir } = useI18n("adminHeader");

  // Admin session id (לפי מה שיש אצלך)
  const adminSessionId = localStorage.getItem("adminSessionId") || "—";

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);

      // ניקוי "סשן" בסיסי (תתאימי לפי האימות שלך)
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminSessionId");

      navigate("/"); // או "/admin/login"
    } finally {
      setLoggingOut(false);
    }
  };

  // Profile icon (קבוע)
  const getAdminAvatar = () => (
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );

  return (
    <header
      dir={dir}
      lang={isRTL ? "he" : "en"}
      style={{ fontFamily: lang === "he" ? "Heebo, Rubik, Arial, sans-serif" : "inherit" }}
      className={`${
        isDark ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-800"
      } p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded shadow-md`}
    >
      {/* Left side: title + session badge */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-base">
          {t("headerTitle")}
        </span>


      </div>

      {/* Right side: theme, language, admin profile, logout */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-start sm:justify-end">
        <ThemeToggle />
        <LanguageSwitcher />

        {/* Admin profile */}
        <div className={`flex items-center gap-3 ${isRTL ? "pl-4 border-l" : "pr-4 border-r"} border-slate-500`}>
          <div className={`flex flex-col ${isRTL ? "items-start text-start" : "items-end text-end"}`}>
            <span className="font-medium dark:text-gray-200">
              {t("adminName")}
            </span>
            <span className="text-xs dark:text-gray-300">
              {t("role")}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-400 flex items-center justify-center bg-white">
            {getAdminAvatar()}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white py-1 px-3 rounded transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          <span>{loggingOut ? t("working") : t("logout")}</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;