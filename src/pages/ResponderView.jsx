import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldHalf, Navigation, MapPin, Radio, Power, Zap } from 'lucide-react';
import MapView from '../components/MapView';
import { useStore } from '../context/StoreContext';

/**
 * ResponderView — high-impact field console
 * Role reference: Hulk — every status change should feel like it landed.
 * Bigger, heavier type; a full-screen impact flash and spring-driven
 * scale punch when a responder advances an incident; mobile-first
 * stacked layout (status + action live above the fold on a phone, map
 * follows) since this is the screen used in the field, one-handed.
 */

const STATUS_FLOW = ['dispatched', 'en-route', 'on-scene', 'resolved'];
const STATUS_COLOR = {
  available: '#2E9E4F', dispatched: '#F07B1D', 'en-route': '#1C4FA6', 'on-scene': '#E63C2F', offline: '#A69A87',
};
const STATUS_LABELS = ['DISPATCHED', 'EN ROUTE', 'ON SCENE', 'RESOLVED'];

export default function ResponderView() {
  const { units, setUnitStatus, incidents, updateIncidentStatus, currentUser } = useStore();
  const myUnitId = currentUser?.unitId || 'h-2';
  const [impact, setImpact] = useState(false);

  const myUnit = units.find((u) => u.id === myUnitId) ?? units[0];
  const myAssignment = useMemo(
    () => incidents.find((i) => i.assignedUnitIds?.includes(myUnit?.id) && i.status !== 'resolved'),
    [incidents, myUnit]
  );

  const nextStatus = () => {
    if (!myAssignment) return;
    const idx = STATUS_FLOW.indexOf(myAssignment.status);
    const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
    updateIncidentStatus(myAssignment.id, next);
    setUnitStatus(myUnit.id, next === 'resolved' ? 'available' : next);
    setImpact(true);
    setTimeout(() => setImpact(false), 650);
  };

  const toggleOnDuty = () => {
    if (myAssignment && myUnit.status !== 'offline') return; // Cannot go offline while on a mission
    setUnitStatus(myUnit.id, myUnit.status === 'offline' ? 'available' : 'offline');
  };

  const flowIndex = myAssignment ? STATUS_FLOW.indexOf(myAssignment.status) : -1;

  return (
    <div className="tac-grid-bg min-h-screen w-full text-[var(--ink)] flex flex-col">
      <header className="glass-panel !rounded-none border-x-0 border-t-0 px-4 sm:px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--cyan)]/40 bg-[var(--cyan)]/10">
            <ShieldHalf size={17} className="text-[var(--cyan)]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">HERO STATUS</h1>
            <p className="data-label text-[var(--ink-faint)] mt-0.5">{myUnit?.callSign ?? '—'} · SECURE COMM LINK</p>
          </div>
        </div>
      </header>

      {/* Mobile-first: action stack comes first, map follows. Desktop: side-by-side. */}
      <main className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 min-h-0">
        <section className="sm:col-span-4 sm:order-2 flex flex-col gap-3 min-h-0">
          <div className="glass-panel p-4 relative">
            <span className="panel-corner tl" /><span className="panel-corner br" />
            <div className="flex items-center justify-between mb-3">
              <span className="data-label">HERO STATUS</span>
              <button disabled={!!myAssignment && myUnit?.status !== 'offline'} onClick={toggleOnDuty} className={`flex items-center gap-1.5 data-label ${(!!myAssignment && myUnit?.status !== 'offline') ? 'opacity-50 cursor-not-allowed' : ''}`} style={{ color: myUnit?.status === 'offline' ? 'var(--ink-faint)' : 'var(--green)' }}>
                <Power size={12} />
                {myUnit?.status === 'offline' ? 'GO ON DUTY' : 'ON DUTY'}
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <span
                className={`h-3 w-3 rounded-full ${myUnit?.status !== 'offline' ? 'status-live' : ''}`}
                style={{ background: STATUS_COLOR[myUnit?.status] ?? '#A69A87' }}
              />
              <span className="font-display font-bold text-2xl tracking-wide" style={{ color: STATUS_COLOR[myUnit?.status] }}>
                {myUnit?.status?.replace('-', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {myAssignment ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-panel p-4 sm:flex-1 flex flex-col relative ${impact ? 'impact-flash' : ''}`}
            >
              <span className="panel-corner tl" /><span className="panel-corner br" />
              <span className="data-label mb-2">ACTIVE MISSION · {myAssignment.code}</span>
              <h3 className="font-display font-bold text-2xl leading-tight mb-1.5">{myAssignment.title}</h3>
              <p className="flex items-center gap-1.5 text-sm text-[var(--ink-muted)] mb-5">
                <MapPin size={13} /> {myAssignment.location.label}
              </p>

              {/* Bold step markers instead of a thin line — deliberately heavier */}
              <div className="flex items-center gap-1.5 mb-5">
                {STATUS_LABELS.map((label, i) => (
                  <div key={label} className="flex-1">
                    <motion.div
                      initial={false}
                      animate={{ backgroundColor: i <= flowIndex ? 'var(--cyan)' : 'var(--grid-line)' }}
                      className="h-2 rounded-full mb-1"
                    />
                    <span
                      className="data-label block text-center"
                      style={{ color: i <= flowIndex ? 'var(--cyan)' : 'var(--ink-faint)', fontSize: 8 }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-auto space-y-2">
                <motion.button
                  onClick={nextStatus}
                  disabled={myAssignment.status === 'resolved'}
                  whileTap={{ scale: 0.94 }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-display font-bold text-lg tracking-wide text-[var(--on-accent)] disabled:opacity-40"
                  style={{ background: 'linear-gradient(90deg, var(--cyan), var(--blue))' }}
                >
                  <Zap size={18} />
                  {myAssignment.status === 'dispatched' && 'HERO EN ROUTE'}
                  {myAssignment.status === 'en-route' && 'HERO ON SCENE'}
                  {myAssignment.status === 'on-scene' && 'MISSION COMPLETE'}
                  {myAssignment.status === 'resolved' && 'THREAT CONTAINED'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-panel p-4 sm:flex-1 flex flex-col items-center justify-center text-center py-10">
              <Radio size={24} className="text-[var(--ink-faint)] mb-2" />
              <p className="text-sm text-[var(--ink-muted)]">No active assignment.</p>
              <p className="data-label text-[var(--ink-faint)] mt-1">STANDING BY FOR HERO DEPLOYMENT</p>
            </div>
          )}
        </section>

        <section className="sm:col-span-8 sm:order-1 min-h-[260px] sm:min-h-0">
          <MapView
            incidents={myAssignment ? [myAssignment] : []}
            units={myUnit ? [myUnit] : []}
            center={myUnit ? [myUnit.location.lat, myUnit.location.lng] : undefined}
          />
        </section>
      </main>
    </div>
  );
}
