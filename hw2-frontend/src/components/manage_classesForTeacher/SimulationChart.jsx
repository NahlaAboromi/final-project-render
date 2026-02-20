import React, { useContext } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ✅ i18n
import { LanguageContext } from '../../context/LanguageContext';
import { useI18n } from '../../utils/i18n';

/**
 * SimulationChart
 *
 * Renders a bar chart of SEL competencies for one simulation attempt.
 */
const SimulationChart = ({ simulation, index, isDark }) => {
  // colors / theme
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
  const gridColor = isDark ? '#64748b' : '#e2e8f0';
  const textColor = isDark ? '#e2e8f0' : '#475569';

  // ---- language / rtl ----
  const { lang } = useContext(LanguageContext) || { lang: 'he' };
  const { t, dir, ready } = useI18n('simulationChart');
  if (!ready) return null;

  // tooltip - רספונסיבי
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2 sm:p-3 rounded-lg border shadow-none ${
            isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-200 text-gray-800'
          }`}
          dir={dir}
          lang={lang}
        >
          <p className="font-medium text-xs sm:text-sm">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}/5
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // data prep
  const simCompetencies = simulation.analysisResult?.competencies || simulation.analysisResult || {};
  const overall = simulation.analysisResult?.overallScore ?? null;

  const simChartData = [
    { key: 'selfAwareness', field: simCompetencies.selfAwareness?.score ?? 0 },
    { key: 'selfManagement', field: simCompetencies.selfManagement?.score ?? 0 },
    { key: 'socialAwareness', field: simCompetencies.socialAwareness?.score ?? 0 },
    { key: 'relationshipSkills', field: simCompetencies.relationshipSkills?.score ?? 0 },
    { key: 'responsibleDecisionMaking', field: simCompetencies.responsibleDecisionMaking?.score ?? 0 }
  ].map(item => ({
    name: t(item.key),
    score: item.field
  }));

  return (
    <div className="mb-4 sm:mb-6" dir={dir} lang={lang}>
      {/* Header - רספונסיבי */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
        <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
          📈 { (t('header') || '').replace('{n}', String(index + 1)) }
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isDark
                ? 'bg-gradient-to-r from-slate-600 to-slate-500 text-slate-200'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-700'
            }`}
          >
            ⭐ {overall ?? t('na')}/5
          </span>
        </div>
      </div>

      {/* Chart - רספונסיבי */}
      <div className="h-48 sm:h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={simChartData} 
            margin={{ 
              top: 5, 
              right: 5, 
              bottom: 5, 
              left: -5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 8, fill: textColor }}
              angle={-15}
              textAnchor="end"
              height={50}
              axisLine={{ stroke: textColor }}
              tickLine={{ stroke: textColor }}
            />
            <YAxis
              domain={[0, 5]}
              tick={{ fontSize: 9, fill: textColor }}
              width={25}
              axisLine={{ stroke: textColor }}
              tickLine={{ stroke: textColor }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey="score"
              fill={colors[index % colors.length]}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimulationChart;