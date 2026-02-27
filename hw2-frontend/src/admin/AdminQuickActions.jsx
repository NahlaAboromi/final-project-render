import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { useI18n } from "../utils/i18n";

const AdminQuickActions = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { t, ready } = useI18n("adminHome");
  if (!ready) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => navigate("/admin/sessions")}
        className={`px-5 py-3 rounded font-semibold transition ${
          isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {t("actions.participantsResultsDesc")}
      </button>
    </div>
  );
};

export default AdminQuickActions;