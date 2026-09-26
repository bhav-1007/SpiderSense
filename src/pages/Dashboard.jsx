import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldHalf, Signal, AlertTriangle, Clock, Users2, ListTree } from 'lucide-react';
import MapView from '../components/MapView';
import DispatchPanel from '../components/DispatchPanel';
import AnalyticsChart from '../components/AnalyticsChart';
import UnitCard from '../components/UnitCard';
import CreateHeroModal from '../components/CreateHeroModal';
import { useStore } from '../context/StoreContext';
import { useSocket } from '../context/SocketContext';

const SEVERITY_COLOR = { critical: '#E63C2F', high: '#F07B1D', moderate: '#1C4FA6', low: '#6B6259' };
const STATUS_COLOR = {
  unassigned: '#6B6259', dispatched: '#F07B1D', 'en-route': '#1C4FA6', 'on-scene': '#E63C2F', resolved: '#2E9E4F',
};

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="data-label text-[var(--ink-muted)] tabular-nums">
      {now.toLocaleTimeString('en-US', { hour12: false })} UTC-LOCAL
    </span>
  );
}

function IncidentRow({ incident, active, onClick }) {
  const color = SEVERITY_COLOR[incident.severity] ?? '#6B6259';
  const statusColor = STATUS_COLOR[incident.status] ?? '#6B6259';
  return (
    <motion.button
      layout
      onClick={() => onClick(incident)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full text-left px-3 py-2.5 border-b border-[var(--grid-line)] flex items-center gap-3 transition-colors"
      style={{ background: active ? 'rgba(28, 79, 166,0.06)' : 'transparent' }}
    >
      <span
        className={`h-2 w-2 rounded-full shrink-0 ${incident.severity === 'critical' ? 'alert-pulse' : ''}`}
        style={{ background: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-[var(--ink)] truncate">{incident.title}</p>
          {incident.assignmentSource === 'ai-auto' && (
            <span title="AI Auto-Assigned" className="bg-[var(--cyan)]/20 text-[var(--cyan)] text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider">AI</span>
          )}
          {incident.assignmentSource === 'commander-override' && (
            <span title="Commander Override" className="bg-[var(--amber)]/20 text-[var(--amber)] text-[8px] px-1.5 py-0.5 rounded font-bold tracking-wider">CMD</span>
          )}
        </div>
        <p className="data-label text-[var(--ink-faint)] truncate">{incident.code} · {incident.location.label}</p>
      </div>
      <span className="data-label shrink-0" style={{ color: statusColor }}>
        {incident.status.replace('-', ' ').toUpperCase()}
      </span>
    </motion.button>
  );
}

export default function Dashboard() {
  const { incidents, stats, assignUnits, units, selectedIncidentId, setSelectedIncidentId, aiAutoDispatchEnabled, setAiAutoDispatchEnabled } = useStore();
  const incidentsLoading = false;
  const unitsLoading = false;
  const socket = useSocket();
  const [filter, setFilter] = useState('active');
  const [showCreateHero, setShowCreateHero] = useState(false);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || null;
  const criticalIncident = incidents.find((i) => i.severity === 'critical' && i.status !== 'resolved');
  const visibleIncidents = incidents.filter((i) => (filter === 'active' ? i.status !== 'resolved' : true));

  const handleDispatch = (incidentId, unitIds, opts) => {
    assignUnits(incidentId, unitIds, opts);
  };

  useEffect(() => {
    if (criticalIncident) {
      const alertBody = `${criticalIncident.title} — ${criticalIncident.location?.label || 'Unknown Location'}`;
      if (Notification.permission === 'granted') {
        new Notification('🚨 SPIDER-SENSE CRITICAL ALERT', { body: alertBody });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('🚨 SPIDER-SENSE CRITICAL ALERT', { body: alertBody });
          }
        });
      }
    }
  }, [criticalIncident?.id]);

  return (
    <div className="tac-grid-bg min-h-screen w-full text-[var(--ink)] flex flex-col">
      {/* Top command bar */}
      <header className="glass-panel !rounded-none border-x-0 border-t-0 px-5 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center border border-[var(--cyan)]/40 bg-[var(--cyan)]/10">
            <ShieldHalf size={17} className="text-[var(--cyan)]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wide leading-none">AVENGERS COMMAND</h1>
            <p className="data-label text-[var(--ink-faint)] mt-0.5">SPIDERSENSE RESPONSE SYSTEM</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 border-r border-[var(--grid-line)] pr-5">
            <span className="data-label" style={{ color: aiAutoDispatchEnabled ? 'var(--cyan)' : 'var(--ink-muted)' }}>AI AUTO-DISPATCH</span>
            <button
              onClick={() => setAiAutoDispatchEnabled(!aiAutoDispatchEnabled)}
              className={`w-8 h-4 rounded-full relative transition-colors ${aiAutoDispatchEnabled ? 'bg-[var(--cyan)]' : 'bg-[var(--grid-line)]'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${aiAutoDispatchEnabled ? 'translate-x-4' : ''}`} />
            </button>
          </div>
          <span className="flex items-center gap-1.5">
            <Signal size={13} className={socket?.connected ? 'text-[var(--green)]' : 'text-[var(--red)]'} />
            <span className="data-label text-[var(--ink-muted)]">
              LINK {socket?.connected ? 'STABLE' : 'DOWN'} · {socket?.latencyMs ?? '--'}ms
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--ink-muted)]" />
            <LiveClock />
          </span>
        </div>
      </header>

      {/* Critical alert banner */}
      <AnimatePresence>
        {criticalIncident && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b"
            style={{ borderColor: 'var(--red-dim)', background: 'rgba(230, 60, 47,0.08)' }}
          >
            <button
              onClick={() => setSelectedIncidentId(criticalIncident.id)}
              className="w-full flex items-center gap-3 px-5 py-2 text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 scan-line opacity-20 pointer-events-none" />
              <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                <span className="absolute inset-0 bg-[var(--red)] rounded-full spider-sense-wave pointer-events-none" />
                <AlertTriangle size={15} className="text-[var(--red)] shrink-0 alert-pulse rounded-full relative z-10" />
              </div>
              <span className="data-label text-[var(--red)] z-10 relative">🕷 SPIDER-SENSE ALERT · THREAT DETECTED</span>
              <span className="text-sm text-[var(--ink)] truncate z-10 relative font-semibold">
                {criticalIncident.title} — {criticalIncident.location.label}
              </span>
              <span className="data-label text-[var(--ink-faint)] ml-auto shrink-0 z-10 relative">HEROES NEEDED</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--grid-line)] border-b border-[var(--grid-line)]">
        {[
          { label: 'ACTIVE INCIDENTS', value: stats.active, color: 'var(--cyan)' },
          { label: 'CRITICAL', value: stats.critical, color: 'var(--red)' },
          { label: 'UNITS DEPLOYED', value: units.filter((u) => u.status !== 'available' && u.status !== 'offline').length, color: 'var(--amber)' },
          { label: 'RESOLVED', value: stats.resolved, color: 'var(--green)' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--void)] px-5 py-3">
            <p className="data-label text-[var(--ink-faint)]">{s.label}</p>
            <p className="font-display font-bold text-2xl mt-0.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 min-h-0">
        {/* Incident list */}
        <section className="lg:col-span-3 h-[400px] lg:h-auto glass-panel flex flex-col min-h-0 relative">
          <span className="panel-corner tl" /><span className="panel-corner bl" />
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)]">
              <span className="flex items-center gap-1.5 data-label">
              <ListTree size={12} /> ACTIVE THREATS
            </span>
            <div className="flex gap-1">
              {['active', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-2 py-0.5 rounded-xl data-label"
                  style={{ color: filter === f ? 'var(--cyan)' : 'var(--ink-faint)' }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto tac-scroll min-h-0">
            {incidentsLoading ? (
              <div className="p-4 space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-[var(--panel-raised)] animate-pulse" />
                ))}
              </div>
            ) : visibleIncidents.length === 0 ? (
              <p className="text-center text-[var(--ink-faint)] text-xs py-10">No incidents match this filter.</p>
            ) : (
              visibleIncidents.map((inc) => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  active={selectedIncidentId === inc.id}
                  onClick={(inc) => setSelectedIncidentId(inc.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* Map */}
        <section className="lg:col-span-6 h-[400px] lg:h-auto min-h-0">
          <MapView
            incidents={incidents}
            units={units}
            onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
            loading={incidentsLoading || unitsLoading}
          />
        </section>

        {/* Dispatch panel */}
        <section className="lg:col-span-3 h-[400px] lg:h-auto min-h-0">
          <DispatchPanel
            incident={selectedIncident}
            units={units}
            onDispatch={handleDispatch}
            onClose={() => setSelectedIncidentId(null)}
          />
        </section>
      </main>

      {/* Bottom row: roster + analytics */}
      <footer className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 pt-0 lg:h-[260px] shrink-0">
        <section className="lg:col-span-4 h-[300px] lg:h-auto glass-panel flex flex-col min-h-0 relative">
          <span className="panel-corner tr" /><span className="panel-corner br" />
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-1.5">
              <Users2 size={12} className="text-[var(--ink-muted)]" />
              <span className="data-label">HERO STATUS · DEPLOYMENT ROSTER</span>
            </div>
            <button
              onClick={() => setShowCreateHero(true)}
              className="data-label text-[10px] bg-[var(--cyan)]/10 text-[var(--cyan)] px-2 py-0.5 rounded border border-[var(--cyan)]/30 hover:bg-[var(--cyan)] hover:text-white transition-colors"
            >
              + ADD HERO
            </button>
          </div>
          <div className="flex-1 overflow-y-auto tac-scroll p-2 space-y-1.5 min-h-0">
            {unitsLoading
              ? [...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-[var(--panel-raised)] animate-pulse" />)
              : units.map((u) => <UnitCard key={u.id} unit={u} />)}
          </div>
        </section>

        <section className="lg:col-span-8 h-[400px] lg:h-auto min-h-0">
          <AnalyticsChart loading={incidentsLoading} />
        </section>
      </footer>
      <AnimatePresence>
        {showCreateHero && (
          <CreateHeroModal onClose={() => setShowCreateHero(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
