// src/admin/AdminSessions.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import Footer from "../layout/Footer";
import { ThemeProvider, ThemeContext } from "../DarkLightMood/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { useI18n } from "../utils/i18n";

/* ========= helpers ========= */
const fmtDate = (d, locale) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleDateString(locale);
  } catch {
    return "—";
  }
};

const fmtDuration = (sec) => {
  const s = Math.max(0, Math.floor(Number(sec || 0)));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (hh > 0) return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  return `${pad(mm)}:${pad(ss)}`;
};

const Modal = ({ open, onClose, title, children, isDark, closeLabel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl shadow-lg ${
          isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* drag handle on mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className={`w-10 h-1 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
        </div>

        <div
          className={`px-5 py-4 border-b ${
            isDark ? "border-slate-700" : "border-slate-200"
          } flex items-center justify-between`}
        >
          <h3 className="font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className={`px-3 py-1 rounded font-semibold ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4 pb-8 sm:pb-4">{children}</div>
      </div>
    </div>
  );
};

/* ========= Mobile card for a single row ========= */
const MobileRow = ({ r, index, isDark, isRTL, t, groupLabel, groupBadgeClass, openDemographics, goToResults, locale }) => (
  <div
    className={`rounded-xl p-4 flex flex-col gap-3 border ${
      isDark
        ? "bg-slate-800/60 border-slate-700"
        : "bg-white border-slate-200"
    }`}
  >
    {/* top row: index + email + group badge */}
    <div className="flex items-start justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-mono text-slate-400 shrink-0">{index + 1}.</span>
        <span className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-slate-800"}`}>
          {r.email || "—"}
        </span>
      </div>
      <span className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${groupBadgeClass(r.groupType)}`}>
        {groupLabel(r.groupType)}
      </span>
    </div>

    {/* meta row: time + date */}
    <div className={`flex gap-4 text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
      <span>⏱ {fmtDuration(r.totalTimeSec)}</span>
      <span>📅 {fmtDate(r.assignedAt, locale)}</span>
    </div>

    {/* action buttons */}
    <div className="flex gap-2 pt-1">
      <button
        onClick={() => openDemographics(r)}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition active:scale-95 ${
          isDark
            ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-gray-200"
            : "bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700"
        }`}
      >
        {t("buttons.demographics")}
      </button>
      <button
        onClick={() => goToResults(r)}
        className="flex-1 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition"
      >
        {t("buttons.results")}
      </button>
    </div>
  </div>
);

const AdminSessionsContent = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const { lang } = useContext(LanguageContext) || { lang: "he" };
  const isRTL = lang === "he";
  const locale = lang === "he" ? "he-IL" : "en-US";

  const { t, ready } = useI18n("adminSessions");

  const [assignedDate, setAssignedDate] = useState("");
  const [groupType, setGroupType] = useState("all");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const hasActiveFilters = assignedDate !== "" || groupType !== "all";

  const clearFilters = () => {
    setAssignedDate("");
    setGroupType("all");
  };

  const goBackHome = () => navigate("/admin");

  const thClass = `p-3 whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`;
  const tdClass = `p-3 whitespace-nowrap ${isRTL ? "text-right" : "text-left"}`;

  const queryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (groupType !== "all") params.set("groupType", groupType);
    if (assignedDate) {
      const from = `${assignedDate}T00:00:00.000Z`;
      const to = `${assignedDate}T23:59:59.999Z`;
      params.set("from", from);
      params.set("to", to);
    }
    const qs = params.toString();
    return `${import.meta.env.VITE_API_URL}/api/admin/participants${qs ? `?${qs}` : ""}`;
  }, [groupType, assignedDate]);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(queryUrl, { signal: controller.signal });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || `Request failed: ${res.status}`);
        }
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e?.name === "AbortError") return;
        console.error("AdminSessions fetch error:", e);
        setRows([]);
        setError(lang === "he" ? "נכשל לטעון סשנים." : "Failed to load sessions.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [ready, queryUrl, lang]);

  const openDemographics = (row) => { setSelectedRow(row); setDemoOpen(true); };
  const closeDemographics = () => { setDemoOpen(false); setSelectedRow(null); };
  const goToResults = (row) => navigate(`/admin/results/${row.anonId}`);

  const groupLabel = (g) => {
    if (g === "experimental") return t("group.experimental");
    if (g === "control") return t("group.control");
    return g || "—";
  };

  const groupBadgeClass = (g) => {
    if (g === "experimental") {
      return isDark ? "bg-emerald-900/40 text-emerald-200" : "bg-emerald-100 text-emerald-700";
    }
    if (g === "control") {
      return isDark ? "bg-blue-900/40 text-blue-200" : "bg-blue-100 text-blue-700";
    }
    return isDark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700";
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      className={`flex flex-col min-h-screen w-screen ${
        isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      <div className="px-4 mt-4">
        <AdminHeader />
      </div>

      <main className="flex-1 w-full px-3 sm:px-4 py-6">
        <div className={`${isDark ? "bg-slate-700" : "bg-slate-200"} p-4 sm:p-6 rounded`}>
          {!ready ? (
            <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>Loading…</div>
          ) : (
            <>
              {/* Title + Back */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex flex-col gap-1 min-w-0">
                  <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {t("title")}
                  </h1>
                  <p className={`text-sm ${isDark ? "text-gray-300" : "text-slate-600"}`}>{t("subtitle")}</p>
                </div>

                <button
                  onClick={goBackHome}
                  className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm border transition-all hover:shadow-sm active:scale-95 ${
                    isDark
                      ? "bg-slate-900 border-slate-600 hover:bg-slate-800 text-gray-200"
                      : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {lang === "he" ? "חזרה" : "Back"}
                </button>
              </div>

              {/* Filters */}
              <div className={`rounded-lg p-4 mb-6 ${isDark ? "bg-slate-800/60" : "bg-white/70"}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-sm ${isDark ? "text-gray-200" : "text-slate-700"}`}>
                      {t("filters.assignedDate")}
                    </label>
                    <input
                      type="date"
                      value={assignedDate}
                      onChange={(e) => setAssignedDate(e.target.value)}
                      className={`w-full rounded px-3 py-2 outline-none text-sm ${
                        isDark
                          ? "bg-slate-900 text-white border border-slate-700"
                          : "bg-white text-slate-900 border border-slate-300"
                      }`}
                    />
                  </div>

                  {/* Group */}
                  <div className="flex flex-col gap-1">
                    <label className={`text-sm ${isDark ? "text-gray-200" : "text-slate-700"}`}>
                      {t("filters.group")}
                    </label>
                    <select
                      value={groupType}
                      onChange={(e) => setGroupType(e.target.value)}
                      className={`w-full rounded px-3 py-2 outline-none text-sm ${
                        isDark
                          ? "bg-slate-900 text-white border border-slate-700"
                          : "bg-white text-slate-900 border border-slate-300"
                      }`}
                    >
                      <option value="all">{t("filters.all")}</option>
                      <option value="experimental">{t("group.experimental")}</option>
                      <option value="control">{t("group.control")}</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition active:scale-95 ${
                        isDark
                          ? "bg-slate-900 border-slate-600 hover:bg-slate-800 text-gray-200"
                          : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <span>✕</span>
                      {t("filters.clear")}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              {loading ? (
                <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                  {t("states.loading")}
                </div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : rows.length === 0 ? (
                <div className={`${isDark ? "text-gray-300" : "text-slate-600"}`}>
                  {t("states.empty")}
                </div>
              ) : (
                <>
                  {/* ── Mobile cards (< md) ── */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {rows.map((r, index) => (
                      <MobileRow
                        key={r.anonId}
                        r={r}
                        index={index}
                        isDark={isDark}
                        isRTL={isRTL}
                        t={t}
                        groupLabel={groupLabel}
                        groupBadgeClass={groupBadgeClass}
                        openDemographics={openDemographics}
                        goToResults={goToResults}
                        locale={locale}
                      />
                    ))}
                  </div>

                  {/* ── Desktop table (≥ md) ── */}
                  <div className={`hidden md:block overflow-x-auto rounded-lg ${isDark ? "bg-slate-800/50" : "bg-white/70"}`}>
                    <table className="min-w-full text-sm">
                      <thead className={`${isDark ? "text-gray-200" : "text-slate-700"}`}>
                        <tr className={`${isDark ? "bg-slate-900/40" : "bg-slate-100"}`}>
                          <th className={`${thClass} w-12`}>
                            <span className="sr-only">{t("table.num")}</span>
                          </th>
                          <th className={thClass}>{t("table.email")}</th>
                          <th className={thClass}>{t("table.group")}</th>
                          <th className={thClass}>{t("table.totalTime")}</th>
                          <th className={thClass}>{t("table.date")}</th>
                          <th className="p-3 whitespace-nowrap text-center">{t("table.demographics")}</th>
                          <th className="p-3 whitespace-nowrap text-center">{t("table.results")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, index) => (
                          <tr
                            key={r.anonId}
                            className={`border-t ${
                              isDark
                                ? "border-slate-700 hover:bg-slate-900/30"
                                : "border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 font-mono text-xs font-semibold text-slate-400 whitespace-nowrap">
                              {index + 1}
                            </td>
                            <td className={tdClass}>{r.email || "—"}</td>
                            <td className={tdClass}>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${groupBadgeClass(r.groupType)}`}>
                                {groupLabel(r.groupType)}
                              </span>
                            </td>
                            <td className={tdClass}>{fmtDuration(r.totalTimeSec)}</td>
                            <td className={tdClass}>{fmtDate(r.assignedAt, locale)}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => openDemographics(r)}
                                className={`px-4 py-2 rounded-lg font-semibold shadow-sm border transition active:scale-95 ${
                                  isDark
                                    ? "bg-slate-900 border-slate-700 hover:bg-slate-800"
                                    : "bg-white border-slate-300 hover:bg-slate-100"
                                }`}
                              >
                                {t("buttons.demographics")}
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => goToResults(r)}
                                className="px-4 py-2 rounded-lg font-semibold shadow-sm bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition"
                              >
                                {t("buttons.results")}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Demographics Modal */}
              <Modal
                open={demoOpen}
                onClose={closeDemographics}
                title={t("modal.title")}
                isDark={isDark}
                closeLabel={t("buttons.close")}
              >
                <div className="text-sm space-y-2">
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.anonId")}</span>
                    <span className="font-mono break-all text-right">{selectedRow?.anonId || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.email")}</span>
                    <span className="break-all text-right">{selectedRow?.email || "—"}</span>
                  </div>
                  <hr className={`${isDark ? "border-slate-700" : "border-slate-200"} my-2`} />
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.gender")}</span>
                    <span>{selectedRow?.demographics?.gender || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.ageRange")}</span>
                    <span>{selectedRow?.demographics?.ageRange || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.fieldOfStudy")}</span>
                    <span className="text-right">{selectedRow?.demographics?.fieldOfStudy || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="opacity-70">{t("modal.fields.semester")}</span>
                    <span>{selectedRow?.demographics?.semester || "—"}</span>
                  </div>
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={closeDemographics}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold shadow-sm border transition active:scale-95 ${
                        isDark
                          ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                          : "bg-white border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {t("buttons.close")}
                    </button>
                  </div>
                </div>
              </Modal>
            </>
          )}
        </div>
      </main>

      <div className="px-4 pb-4">
        <Footer />
      </div>
    </div>
  );
};

const AdminSessions = () => (
  <ThemeProvider>
    <AdminSessionsContent />
  </ThemeProvider>
);

export default AdminSessions;