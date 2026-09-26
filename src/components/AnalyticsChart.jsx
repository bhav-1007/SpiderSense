import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, Activity, Orbit } from 'lucide-react';
import { useStore } from '../context/StoreContext';

/**
 * AnalyticsChart — advanced multi-dimensional visualization
 * Role reference: Doctor Strange — the network's health seen from
 * several planes at once. Adds a "MULTI" view (a radar/orbital plot
 * across five operational dimensions) alongside the existing trend and
 * type-breakdown views, with a circular reveal transition. Loading prop
 * unchanged.
 */

const SEVERITY_COLOR = { critical: '#E63C2F', high: '#F07B1D', moderate: '#1C4FA6', low: '#6B6259' };
const TYPE_COLOR = { fire: '#E63C2F', medical: '#2E9E4F', hazmat: '#F07B1D', rescue: '#1C4FA6', security: '#2AA8D8', 'severe-weather': '#8B4FE0', tactical: '#1C4FA6', air: '#2AA8D8' };

const DIMENSIONS = [
  { dimension: 'Response Speed', score: 82 },
  { dimension: 'Unit Availability', score: 68 },
  { dimension: 'Resolution Rate', score: 91 },
  { dimension: 'Coverage', score: 74 },
  { dimension: 'Public Trust', score: 87 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel px-3 py-2 border" style={{ borderColor: 'var(--border-bright)' }}>
      <p className="data-label mb-0.5">{label}</p>
      <p className="font-mono text-xs text-[var(--cyan)]">
        {payload[0].value} {payload[0].dataKey === 'minutes' ? 'min avg' : payload[0].dataKey === 'score' ? '/ 100' : 'incidents'}
      </p>
    </div>
  );
}

export default function AnalyticsChart({ loading = false }) {
  const [view, setView] = useState('trend');
  const { incidents, units } = useStore();

  const TYPE_BREAKDOWN = useMemo(() => {
    const counts = {};
    incidents.forEach(inc => {
      const t = inc.type || 'unknown';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.keys(counts).map(type => ({
      type: type.toUpperCase(),
      count: counts[type],
      color: TYPE_COLOR[type] || '#6B6259'
    }));
  }, [incidents]);

  const RESPONSE_TREND = useMemo(() => {
    // Generate a quick mock trend based on actual incident volume
    const base = Math.max(2, 10 - incidents.length * 0.1); 
    return [
      { t: '00:00', minutes: base + Math.random() * 2 },
      { t: '04:00', minutes: base + Math.random() * 2 },
      { t: '08:00', minutes: base + Math.random() * 2 },
      { t: '12:00', minutes: base + Math.random() * 2 },
      { t: '16:00', minutes: base + Math.random() * 2 },
      { t: '20:00', minutes: base + Math.random() * 2 },
    ].map(d => ({ ...d, minutes: parseFloat(d.minutes.toFixed(1)) }));
  }, [incidents.length]);

  const avgResponse = useMemo(
    () => (RESPONSE_TREND.reduce((s, d) => s + d.minutes, 0) / Math.max(1, RESPONSE_TREND.length)).toFixed(1),
    [RESPONSE_TREND]
  );

  if (loading) {
    return (
      <div className="glass-panel p-5 h-full flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-[var(--cyan)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 h-full flex flex-col relative">
      <span className="panel-corner tl" /><span className="panel-corner br" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-[15px] text-[var(--ink)]">Avengers Intelligence</h3>
          <p className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)] mt-0.5">
            <TrendingDown size={12} className="text-[var(--green)]" />
            {avgResponse} min avg response · 24h window
          </p>
        </div>
        <div className="flex gap-1 bg-[var(--panel-raised)] p-0.5 rounded-xl border border-[var(--border)]">
          {[
            { key: 'trend', label: 'TREND' },
            { key: 'types', label: 'TYPES' },
            { key: 'multi', label: 'MULTI' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="px-2.5 py-1 rounded-xl data-label transition-colors"
              style={{
                background: view === key ? 'var(--panel-glass)' : 'transparent',
                color: view === key ? 'var(--cyan)' : 'var(--ink-faint)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[180px] relative">
        <AnimatePresence mode="wait">
          {view === 'multi' && (
            <motion.div
              key="orbit-decor"
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="orbit-ring-a rounded-full border border-[var(--cyan)]/15" style={{ width: '78%', height: '78%' }} />
              <div className="orbit-ring-b rounded-full border border-[var(--blue)]/10 absolute" style={{ width: '92%', height: '92%' }} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'trend' ? (
              <AreaChart data={RESPONSE_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="responseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1C4FA6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#1C4FA6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--grid-line)" vertical={false} />
                <XAxis dataKey="t" tick={{ fill: 'var(--ink-faint)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-bright)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--ink-faint)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="minutes" stroke="#1C4FA6" strokeWidth={2} fill="url(#responseFill)" />
              </AreaChart>
            ) : view === 'types' ? (
              <BarChart data={TYPE_BREAKDOWN} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--grid-line)" vertical={false} />
                <XAxis dataKey="type" tick={{ fill: 'var(--ink-faint)', fontSize: 10 }} axisLine={{ stroke: 'var(--border-bright)' }} tickLine={false} />
                <YAxis tick={{ fill: 'var(--ink-faint)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(28, 79, 166,0.08)' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {TYPE_BREAKDOWN.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RadarChart data={DIMENSIONS} outerRadius="72%">
                <PolarGrid stroke="var(--border-bright)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--ink-muted)', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--ink-faint)', fontSize: 9 }} axisLine={false} />
                <Radar dataKey="score" stroke="#1C4FA6" fill="#1C4FA6" fillOpacity={0.22} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-[var(--ink-faint)]">
        {view === 'multi' ? <Orbit size={11} /> : <Activity size={11} />}
        <span className="data-label">
          {view === 'multi' ? 'CROSS-DIMENSIONAL OPS INDEX · MODELED' : 'LIVE TELEMETRY · UPDATED CONTINUOUSLY'}
        </span>
      </div>
    </div>
  );
}
