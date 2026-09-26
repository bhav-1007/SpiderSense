import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MapPin, Users, ChevronRight, X, Zap, CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import UnitCard from './UnitCard';

/**
 * DispatchPanel — holographic diagnostics + animated dispatch sequence
 * Role reference: Iron Man — a system that shows its own reasoning as
 * it works (coordinate lock, unit alert, transmit, confirm) rather than
 * a button that just fires silently. Critical incidents additionally
 * pick up a charged, escalating border (Thor reference) that intensifies
 * the longer the incident has gone unanswered.
 * Props unchanged: incident, units, onDispatch, onClose.
 */

const SEVERITY_COLOR = { critical: '#E63C2F', high: '#F07B1D', moderate: '#1C4FA6', low: '#6B6259' };

const SEQUENCE_STEPS = [
  'LOCKING COORDINATES',
  'ALERTING UNIT(S)',
  'TRANSMITTING ORDER',
  'CONFIRMED',
];

function escalationLevel(reportedAt) {
  const minutes = (Date.now() - new Date(reportedAt).getTime()) / 60000;
  if (minutes > 12) return 3;
  if (minutes > 6) return 2;
  if (minutes > 2) return 1;
  return 0;
}

function EscalationReadout({ incident }) {
  const [level, setLevel] = useState(() => escalationLevel(incident.reportedAt));

  useEffect(() => {
    const t = setInterval(() => setLevel(escalationLevel(incident.reportedAt)), 15000);
    return () => clearInterval(t);
  }, [incident.reportedAt]);

  if (incident.severity !== 'critical' || level === 0) return null;

  const labels = ['', 'ESCALATING', 'URGENT — RESPOND', 'CRITICAL DELAY'];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl border charge-glow"
      style={{ borderColor: 'var(--red)', background: 'rgba(230, 60, 47,0.08)' }}
    >
      <TriangleAlert size={13} className="text-[var(--red)] shrink-0" />
      <span className="data-label text-[var(--red)]">{labels[level]} · LEVEL {level}</span>
    </motion.div>
  );
}

export default function DispatchPanel({ incident, units, onDispatch, onClose }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sequenceStep, setSequenceStep] = useState(-1); // -1 = idle, 0..3 = running
  const [dispatched, setDispatched] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  useEffect(() => {
    if (incident?.suggestedUnitIds?.length && incident.status === 'unassigned') {
      setSelectedIds(incident.suggestedUnitIds);
    } else {
      setSelectedIds(incident?.assignedUnitIds || []);
    }
    setSequenceStep(-1);
    setDispatched(false);
    setIsReassigning(false);
  }, [incident?.id, incident?.status]);

  const toggleUnit = (unit) => {
    if (sequenceStep >= 0) return;
    setSelectedIds((prev) =>
      prev.includes(unit.id) ? prev.filter((id) => id !== unit.id) : [...prev, unit.id]
    );
  };

  const eligible = useMemo(() => {
    const available = units.filter((u) => u.status === 'available' || selectedIds.includes(u.id));
    if (!incident) return available;

    return available.map(u => {
      let score = 100;
      if (u.type === incident.type) score += 50; // Type match boost
      score += (u.battery / 100) * 10; // Battery boost
      
      if (u.location && incident.location) {
        const dx = u.location.lng - incident.location.lng;
        const dy = u.location.lat - incident.location.lat;
        const dist = Math.sqrt(dx*dx + dy*dy);
        score -= dist * 500; // Distance penalty
      }
      return { ...u, _score: score };
    }).sort((a, b) => b._score - a._score);
  }, [units, selectedIds, incident]);

  useEffect(() => {
    if (sequenceStep < 0 || sequenceStep >= SEQUENCE_STEPS.length) return undefined;
    const t = setTimeout(() => {
      if (sequenceStep === SEQUENCE_STEPS.length - 1) {
        onDispatch?.(incident.id, selectedIds, { overriddenByCommander: true });
        setDispatched(true);
        setTimeout(() => {
          setSequenceStep(-1);
          setDispatched(false);
          setIsReassigning(false);
        }, 1400);
      } else {
        setSequenceStep((s) => s + 1);
      }
    }, 480);
    return () => clearTimeout(t);
  }, [sequenceStep, incident, onDispatch, selectedIds]);

  const runDispatch = () => {
    if (!incident || selectedIds.length === 0 || sequenceStep >= 0) return;
    setSequenceStep(0);
  };

  const isAutoDispatched = incident && incident.status === 'dispatched' && incident.assignmentSource === 'ai-auto' && !isReassigning;

  if (!incident) {
    return (
      <div className="glass-panel h-full flex flex-col items-center justify-center p-8 text-center">
        <Radio size={26} className="text-[var(--ink-faint)] mb-3" />
        <p className="font-display text-[var(--ink-muted)] text-sm">
          Select an incident to open the dispatch console.
        </p>
      </div>
    );
  }

  const sevColor = SEVERITY_COLOR[incident.severity] ?? '#6B6259';
  const sequencing = sequenceStep >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass-panel h-full flex flex-col relative overflow-hidden ${dispatched ? 'impact-flash' : ''}`}
    >
      <span className="panel-corner tl" /><span className="panel-corner tr" />
      <span className="panel-corner bl" /><span className="panel-corner br" />
      {sequencing && <div className="scan-line z-10" />}

      <div className="p-4 border-b border-[var(--border)] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full alert-pulse" style={{ background: sevColor }} />
            <span className="data-label" style={{ color: sevColor }}>
              {incident.severity.toUpperCase()} · {incident.code}
            </span>
          </div>
          <h3 className="font-display font-semibold text-[16px] text-[var(--ink)] truncate">
            {incident.title}
          </h3>
          <p className="flex items-center gap-1 text-[var(--ink-muted)] text-xs mt-1">
            <MapPin size={11} /> {incident.location?.label}
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      <EscalationReadout incident={incident} />

      {incident.aiReasoning && (
        <div className="mx-4 mt-2 p-2.5 rounded-lg border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-[var(--cyan)]">
            <Zap size={11} /> <span className="font-bold tracking-wider text-[9px]">AI REASONING</span>
          </div>
          <p className="text-[var(--ink)] leading-snug">{incident.aiReasoning}</p>
        </div>
      )}

      {isAutoDispatched ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full border border-[var(--cyan)] bg-[var(--cyan)]/20 flex items-center justify-center mb-4">
            <CheckCircle2 size={24} className="text-[var(--cyan)]" />
          </div>
          <h3 className="font-display font-bold text-lg mb-1">AI AUTO-DISPATCHED</h3>
          <p className="text-[var(--ink-muted)] text-sm mb-6">Heroes have been notified and are en route.</p>
          <button
            onClick={() => setIsReassigning(true)}
            className="px-6 py-2 rounded-lg data-label font-bold border border-[var(--border)] hover:bg-[var(--panel-raised)] transition-colors"
          >
            COMMANDER OVERRIDE
          </button>
        </div>
      ) : (
        <>
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <p className="data-label">AVAILABLE UNITS</p>
            <span className="flex items-center gap-1 data-label text-[var(--ink-faint)]">
              <Users size={11} /> {selectedIds.length} SELECTED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto tac-scroll px-4 py-2 space-y-2 min-h-0">
            <AnimatePresence initial={false}>
              {eligible.map((unit, index) => {
                const isRecommended = incident.suggestedUnitIds?.includes(unit.id) || (index < 2 && unit._score > 100);
                const isAiSuggested = incident.suggestedUnitIds?.includes(unit.id);
                return (
                  <motion.div
                    key={unit.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    {isRecommended && (
                      <div className={`absolute -top-2 right-2 px-1.5 py-0.5 text-[var(--void)] text-[8px] font-bold tracking-wider rounded-sm z-10 shadow-sm ${isAiSuggested ? 'bg-[var(--cyan)] shadow-[var(--cyan)]' : 'bg-[var(--green)] shadow-[var(--green)]'}`}>
                        {isAiSuggested ? 'AI SUGGESTED' : 'RECOMMENDED MATCH'}
                      </div>
                    )}
                    <UnitCard unit={unit} selected={selectedIds.includes(unit.id)} onSelect={toggleUnit} />
                  </motion.div>
                );
              })}
              {eligible.length === 0 && (
                <p className="text-center text-[var(--ink-faint)] text-xs py-8">No units currently available.</p>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-[var(--border)]">
            <AnimatePresence mode="wait">
              {sequencing ? (
                <motion.div
                  key="sequence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-1.5"
                >
                  {SEQUENCE_STEPS.map((step, i) => {
                    const done = i < sequenceStep || (i === sequenceStep && dispatched);
                    const active = i === sequenceStep && !dispatched;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 size={13} className="text-[var(--green)]" />
                        ) : active ? (
                          <Loader2 size={13} className="text-[var(--cyan)] animate-spin" />
                        ) : (
                          <span className="h-[13px] w-[13px] rounded-full border border-[var(--border-bright)]" />
                        )}
                        <span
                          className="data-label"
                          style={{ color: done ? 'var(--green)' : active ? 'var(--cyan)' : 'var(--ink-faint)' }}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={runDispatch}
                  disabled={selectedIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold tracking-wide transition-opacity disabled:opacity-40"
                  style={{ background: 'linear-gradient(90deg, var(--red), #ff6a4e)', color: '#0b0400' }}
                >
                  <Zap size={15} />
                  DISPATCH {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                  <ChevronRight size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
}
