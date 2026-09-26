import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Orbit, TrendingUp, ShieldAlert, Clock4, Users2, Activity } from 'lucide-react';
import AnalyticsChart from '../components/AnalyticsChart';
import { useStore } from '../context/StoreContext';

/**
 * AnalyticsPage — the network's operational intelligence layer.
 * Role reference: Doctor Strange's sanctum — the same event stream
 * everyone else works from, seen from several planes at once. Distinct
 * from Dashboard's dense working console: this page is for reading,
 * not acting, so it slows down, widens its margins, and leans on the
 * orbital/multi-dimensional visual language AnalyticsChart introduced.
 */

const SECTOR_LOAD = [
  { sector: 'Alpha', load: 82 }, { sector: 'Bravo', load: 61 }, { sector: 'Charlie', load: 74 },
  { sector: 'Delta', load: 45 }, { sector: 'Echo', load: 58 },
];

export default function AnalyticsPage() {
  const { incidents, stats, units } = useStore();
  const loading = false;
  const unitsLoading = false;

  const avgResolutionMin = useMemo(() => {
    const resolved = incidents.filter(i => i.status === 'resolved' && i.updatedAt && i.reportedAt);
    if (resolved.length === 0) return '0.0';
    const totalMs = resolved.reduce((acc, i) => acc + (new Date(i.updatedAt).getTime() - new Date(i.reportedAt).getTime()), 0);
    return (totalMs / resolved.length / 60000).toFixed(1);
  }, [incidents]);

  const busiestSector = useMemo(
    () => SECTOR_LOAD.reduce((a, b) => (b.load > a.load ? b : a)).sector,
    []
  );

  return (
    <div className="tac-grid-bg min-h-screen w-full text-[var(--ink)] px-4 sm:px-8 py-10">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 relative">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-[#8B4FE0]/40 bg-[#8B4FE0]/10 relative overflow-hidden">
                <div className="orbit-ring-a absolute inset-0 rounded-full border border-[#8B4FE0]/30" />
                <Orbit size={16} className="text-[#8B4FE0] relative z-10" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl leading-none">AVENGERS INTELLIGENCE</h1>
                <p className="data-label text-[var(--ink-faint)] mt-0.5">DOCTOR STRANGE · STARK ANALYTICS</p>
              </div>
            </div>
          </div>
          <span className="data-label text-[var(--ink-faint)] flex items-center gap-1.5">
            <Activity size={12} /> LIVE TELEMETRY · {stats.total} TOTAL INCIDENTS
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'AVG RESOLUTION', value: `${avgResolutionMin}m`, icon: Clock4, color: 'var(--cyan)' },
            { label: 'ACTIVE LOAD', value: stats.active, icon: ShieldAlert, color: 'var(--amber)' },
            { label: 'RESOLVED (ALL)', value: stats.resolved, icon: TrendingUp, color: 'var(--green)' },
            { label: 'UNITS ONLINE', value: units.filter((u) => u.status !== 'offline').length, icon: Users2, color: 'var(--blue)' },
            { label: 'BUSIEST SECTOR', value: busiestSector, icon: Orbit, color: '#8B4FE0' },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-panel p-4 relative"
            >
              <span className="panel-corner tl" /><span className="panel-corner br" />
              <k.icon size={13} style={{ color: k.color }} className="mb-2" />
              <p className="data-label text-[var(--ink-faint)]">{k.label}</p>
              <p className="font-display font-bold text-xl mt-0.5" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main chart */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[420px]">
            <AnalyticsChart loading={loading} />
          </div>

          {/* Sector load */}
          <div className="glass-panel p-5 relative flex flex-col">
            <span className="panel-corner tr" /><span className="panel-corner bl" />
            <h3 className="font-display font-semibold text-[15px] mb-1">Sector Load Index</h3>
            <p className="text-xs text-[var(--ink-muted)] mb-5">Relative demand across patrol sectors, last 24h.</p>
            <div className="space-y-4 flex-1">
              {SECTOR_LOAD.map((s) => (
                <div key={s.sector}>
                  <div className="flex justify-between mb-1.5">
                    <span className="data-label">SECTOR {s.sector.toUpperCase()}</span>
                    <span className="data-label" style={{ color: s.load > 70 ? 'var(--red)' : s.load > 55 ? 'var(--amber)' : 'var(--cyan)' }}>
                      {s.load}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--grid-line)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.load}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: s.load > 70 ? 'var(--red)' : s.load > 55 ? 'var(--amber)' : 'var(--cyan)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="data-label text-[var(--ink-faint)] mt-5 flex items-center gap-1.5">
              <Orbit size={11} /> {unitsLoading ? 'CALIBRATING…' : 'MODELED · UPDATED HOURLY'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
