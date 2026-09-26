import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Radio, CheckCircle2, History, HeartHandshake } from 'lucide-react';
import IncidentForm from '../components/IncidentForm';
import { useStore } from '../context/StoreContext';

/**
 * ReporterView — the trustworthy front door
 * Role reference: Captain America — plain language, steady presence,
 * nothing flashy standing between a person and help. Calmer accent
 * (trust blue rather than alert red), large touch targets, and a
 * mission timeline so a person can see exactly what's happening to
 * their report instead of wondering if it "went through."
 */

const STEP_ORDER = ['unassigned', 'dispatched', 'en-route', 'on-scene', 'resolved'];
const STEP_LABELS = ['Received', 'Verified & Dispatched', 'Responder En Route', 'On Scene', 'Resolved'];

function MissionTimeline({ status }) {
  const index = Math.max(0, STEP_ORDER.indexOf(status));
  return (
    <div className="flex items-start gap-0">
      {STEP_LABELS.map((label, i) => {
        const done = i <= index;
        const isLast = i === STEP_LABELS.length - 1;
        return (
          <div key={label} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <motion.span
                initial={false}
                animate={{
                  backgroundColor: done ? 'var(--blue)' : 'var(--panel-raised)',
                  borderColor: done ? 'var(--blue)' : 'var(--border)',
                }}
                className="h-5 w-5 rounded-full border flex items-center justify-center"
              >
                {done && <CheckCircle2 size={12} className="text-white" />}
              </motion.span>
              <span
                className="data-label text-center leading-tight"
                style={{ color: done ? 'var(--ink)' : 'var(--ink-faint)', maxWidth: 62, fontSize: 8.5 }}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-[2px] mx-1 mt-[-16px] bg-[var(--grid-line)] overflow-hidden rounded-full">
                <motion.div
                  initial={false}
                  animate={{ width: i < index ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full"
                  style={{ background: 'var(--blue)' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReporterView() {
  const { incidents, reportIncident } = useStore();
  const [mySubmissionIds, setMySubmissionIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (draft) => {
    setSubmitting(true);
    try {
      const newId = await reportIncident(draft);
      setMySubmissionIds((prev) => [newId, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tac-grid-bg min-h-screen w-full text-[var(--ink)] flex flex-col items-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--blue)]/40 bg-[var(--blue)]/10">
            <ShieldCheck size={18} className="text-[var(--blue)]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">SPIDERSENSE</h1>
            <p className="data-label text-[var(--ink-faint)] mt-0.5">CITIZEN THREAT REPORTING</p>
          </div>
        </div>

        <p className="flex items-start gap-2 text-sm text-[var(--ink-muted)] mt-3 mb-6 leading-relaxed">
          <HeartHandshake size={15} className="text-[var(--blue)] shrink-0 mt-0.5" />
          Tell us what you're seeing. A real dispatcher reviews every
          report, and you'll see exactly what happens next — no
          guessing whether help is coming.
        </p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <IncidentForm onSubmit={handleSubmit} submitting={submitting} />
        </motion.div>

        <div className="mt-4 flex items-center justify-between glass-panel px-3 py-2.5">
          <span className="flex items-center gap-1.5 data-label text-[var(--ink-muted)]">
            <Radio size={12} className="text-[var(--green)] status-live" />
            {incidents.filter((i) => i.status !== 'resolved').length} ACTIVE RESPONSES NEARBY
          </span>
        </div>

        <AnimatePresence>
          {mySubmissionIds.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-7">
              <p className="flex items-center gap-1.5 data-label mb-3 text-[var(--ink-faint)]">
                <History size={12} /> YOUR MISSION LOG
              </p>
              <div className="space-y-4">
                {mySubmissionIds
                  .map(id => incidents.find(i => i.id === id))
                  .filter(Boolean)
                  .map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <p className="text-sm text-[var(--ink)] font-medium truncate">{s.title}</p>
                      <span className="data-label text-[var(--ink-faint)] shrink-0">{s.code}</span>
                    </div>
                    <MissionTimeline status={s.status} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
