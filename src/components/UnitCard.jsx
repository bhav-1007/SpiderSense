import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BatteryMedium, Users, SignalHigh, Clock3, MapPinned,
} from 'lucide-react';
import HeroAvatar from './HeroAvatar';
import { useStore } from '../context/StoreContext';

/**
 * UnitCard — precision intel readout
 * Role reference: Black Widow — no wasted detail, everything shown is
 * exact and useful. Collapsed state stays a scannable single line;
 * expanding reveals coordinates, last-update time, and an ETA estimate
 * for units in motion. Props are unchanged (unit, onSelect, selected).
 */

const TYPE_META = {
  fire: { color: '#FF0033', label: 'FIRE / RESCUE' },
  medical: { color: '#00FF88', label: 'MEDICAL' },
  hazmat: { color: '#FFAA00', label: 'HAZMAT' },
  tactical: { color: '#0066FF', label: 'TACTICAL' },
  air: { color: '#00FFFF', label: 'AIR SUPPORT' },
};

const STATUS_META = {
  available: { color: '#00FF88', label: 'AVAILABLE' },
  dispatched: { color: '#FFAA00', label: 'DISPATCHED' },
  'en-route': { color: '#0066FF', label: 'EN ROUTE' },
  'on-scene': { color: '#FF0033', label: 'ON SCENE' },
  offline: { color: '#94A3B8', label: 'OFFLINE' },
};

// Deterministic pseudo-ETA so it stays stable across re-renders without new state.
function pseudoEta(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) % 97;
  return 2 + (h % 11);
}

function SignalBars({ strength }) {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{
            height: `${(i + 1) * 3}px`,
            background: i < strength ? 'var(--cyan)' : 'var(--grid-line)',
          }}
        />
      ))}
    </div>
  );
}

export default function UnitCard({ unit, onSelect, selected = false }) {
  const { setUnitStatus } = useStore();
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[unit.type] ?? TYPE_META.tactical;
  const status = STATUS_META[unit.status] ?? STATUS_META.offline;
  const avatarVariant = TYPE_META[unit.type] ? unit.type : 'tactical';
  const inMotion = unit.status === 'en-route' || unit.status === 'dispatched';
  const signal = Math.max(1, Math.min(4, Math.round(unit.battery / 25)));

  return (
    <motion.div
      layout
      className={`glass-panel w-full text-left overflow-hidden transition-colors ${unit.isActive === false ? 'opacity-50 grayscale' : ''}`}
      style={{
        borderColor: selected ? 'var(--cyan)' : 'var(--border)',
        boxShadow: selected ? '0 0 0 1px var(--cyan), 0 0 18px rgba(28, 79, 166,0.15)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={() => {
          onSelect?.(unit);
          setExpanded((v) => !v);
        }}
        className="w-full p-3 flex items-center gap-3 relative"
      >
        <span className="panel-corner tl" />
        <span className="panel-corner br" />

        <HeroAvatar variant={avatarVariant} color={meta.color} size={38} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-semibold text-[15px] text-[var(--ink)] truncate">
              {unit.callSign}
            </span>
            <span className="data-label" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${unit.status !== 'offline' ? 'status-live' : ''}`}
                style={{ background: status.color }}
              />
              <span className="data-label" style={{ color: status.color, opacity: 0.9 }}>
                {status.label}
              </span>
            </span>

            {inMotion && (
              <span className="flex items-center gap-1 text-[var(--amber)]">
                <Clock3 size={11} />
                <span className="data-label">ETA {pseudoEta(unit.id)}M</span>
              </span>
            )}

            <span className="flex items-center gap-1 text-[var(--ink-faint)] ml-auto">
              <Users size={11} />
              <span className="data-label">{unit.members}</span>
            </span>

            <SignalBars strength={signal} />
          </div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-3 pb-3 pt-0 border-t border-[var(--grid-line)] grid grid-cols-2 gap-2"
        >
          <div className="flex items-center gap-1.5 pt-2">
            <MapPinned size={11} className="text-[var(--ink-faint)]" />
            <span className="font-mono text-[10px] text-[var(--ink-muted)]">
              {unit.location.lat.toFixed(3)}, {unit.location.lng.toFixed(3)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-2">
            <BatteryMedium size={11} className="text-[var(--ink-faint)]" />
            <span className="font-mono text-[10px] text-[var(--ink-muted)]">{unit.battery}% CHARGE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <SignalHigh size={11} className="text-[var(--ink-faint)]" />
            <span className="font-mono text-[10px] text-[var(--ink-muted)]">TELEMETRY NOMINAL</span>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUnitStatus(unit.id, { isActive: unit.isActive === false ? true : false });
              }}
              className="px-2 py-1 rounded text-[9px] font-bold tracking-wider"
              style={{
                background: unit.isActive !== false ? 'var(--red)' : 'var(--green)',
                color: 'var(--void)'
              }}
            >
              {unit.isActive !== false ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
