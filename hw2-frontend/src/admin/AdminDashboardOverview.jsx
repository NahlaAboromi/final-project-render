import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../DarkLightMood/ThemeContext";
import { useI18n } from "../utils/i18n";

const StatCard = ({ title, value, isDark }) => (
  <div className={`p-4 rounded shadow ${isDark ? "bg-slate-800" : "bg-white"}`}>
    <p className={`${isDark ? "text-gray-300" : "text-slate-600"} text-sm`}>
      {title}
    </p>

    <p className={`${isDark ? "text-white" : "text-slate-900"} text-2xl font-bold mt-1`}>
      {value}
    </p>
  </div>
);

const AdminDashboardOverview = () => {

  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { t, ready } = useI18n("adminHome");

  const [stats, setStats] = useState({
    total: 0,
    experimental: 0,
    control: 0
  });

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchStats = async () => {

      try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);

        const data = await res.json();

        setStats(data);

      }

      catch (err) {

        console.error("Failed loading admin stats", err);

      }

      finally {

        setLoading(false);

      }

    };

    fetchStats();

  }, []);


  if (!ready) return null;

  if (loading)
    return (
      <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
        {t("loading")}
      </div>
    );


  return (

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      <StatCard
        title={t("cards.total")}
        value={stats.total}
        isDark={isDark}
      />

      <StatCard
        title={t("cards.experimental")}
        value={stats.experimental}
        isDark={isDark}
      />

      <StatCard
        title={t("cards.control")}
        value={stats.control}
        isDark={isDark}
      />

    </div>

  );

};

export default AdminDashboardOverview;