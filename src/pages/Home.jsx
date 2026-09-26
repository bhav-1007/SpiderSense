import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldHalf, ArrowRight, FileWarning, Radio,
  Activity, MapPinned, BarChart3, Satellite, CheckCircle2,
  ShieldCheck, LayoutGrid,
} from 'lucide-react';
import MapView from '../components/MapView';
import AnalyticsChart from '../components/AnalyticsChart';
import UnitCard from '../components/UnitCard';
import Emblem from '../components/Emblem';
import { useStore } from '../context/StoreContext';
import { useSocket } from '../context/SocketContext';

/**
 * Home — cinematic network overview.
 * Role reference: Nick Fury's briefing room. This is the only page in
 * the app that is not a working tool — it exists to sell the network's
 * competence in under a minute, then hand off to whichever role the
 * visitor actually is. Every "live" number below reads from the same
 * mock hooks the working pages use, so what's shown here is honest.
 */

function useCountUp(target, durationMs = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function StatBlock({ label, value, suffix = '', color = 'var(--cyan)' }) {
  const n = useCountUp(value);
  return (
    <div className="px-5 py-4 sm:py-0 text-center sm:text-left">
      <p className="data-label text-[var(--ink-faint)]">{label}</p>
      <p className="font-display font-bold text-3xl mt-1 tabular-nums" style={{ color }}>
        {n}
        {suffix}
      </p>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

function Reveal({ children, className = '', i = 0 }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <Reveal className="max-w-2xl mb-10">
      <p className="data-label text-[var(--cyan)] mb-2 flex items-center gap-1.5">
        <span className="h-1 w-4 bg-[var(--cyan)] rounded-full" /> {eyebrow}
      </p>
      <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-2">{title}</h2>
      {sub && <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{sub}</p>}
    </Reveal>
  );
}

const WORK_STEPS = [
  { icon: FileWarning, label: 'Detect & Report', copy: 'A civilian report, field sensor, or drone patrol flags an event the instant it happens.' },
  { icon: ShieldCheck, label: 'Verify & Dispatch', copy: 'Command reviews severity and location, then routes the nearest capable unit in seconds.' },
  { icon: Radio, label: 'Respond & Track', copy: 'Responders move through a live status flow while command watches position and ETA.' },
  { icon: CheckCircle2, label: 'Resolve & Learn', copy: 'Every incident closes into the analytics layer, sharpening the network\u2019s next response.' },
];

const ROLE_CARDS = [
  {
    key: 'command',
    icon: LayoutGrid,
    accent: '#1C4FA6',
    title: 'Command Center',
    copy: 'Full tactical oversight — live map, dispatch controls, responder roster, and system health in one console.',
    cta: 'ENTER COMMAND CENTER',
  },
  {
    key: 'report',
    icon: FileWarning,
    accent: '#2AA8D8',
    title: 'Citizen Response',
    copy: 'See something? Report it in under a minute and follow your case through every stage, in plain language.',
    cta: 'REPORT AN INCIDENT',
  },
  {
    key: 'responder',
    icon: Radio,
    accent: '#F07B1D',
    title: 'Responder Mission',
    copy: 'A field-ready console built for one hand and one glance — mission, map, and status control.',
    cta: 'OPEN FIELD CONSOLE',
  },
];

export default function Home({ onNavigate }) {
  const { incidents, stats, units } = useStore();
  const socket = useSocket();
  const incidentsLoading = false;
  const unitsLoading = false;

  const feed = useMemo(() => incidents.slice(0, 5), [incidents]);
  const uptime = 99.98;

  return (
    <div className="w-full text-[var(--ink)] overflow-hidden relative min-h-screen">
      {/* GLOBAL CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.15] sm:opacity-[0.25]" style={{ zIndex: 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=2000&q=80" 
          alt="Spider-Man Background" 
          className="w-full h-full object-cover object-center grayscale-[30%]"
        />
      </div>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'var(--bg-pattern)', zIndex: 0 }} />

      {/* ============ HERO ============ */}
      <section className="hero-city relative min-h-[92vh] flex flex-col justify-center px-4 sm:px-8 py-16 overflow-hidden bg-transparent">
        {/* Avengers Top Background Image */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] sm:opacity-[0.4]" style={{ zIndex: 0 }}>
          <img 
            src="https://wallpapercave.com/wp/wp3718001.jpg" 
            alt="Avengers Background" 
            className="w-full h-full object-cover object-top"
          />
          {/* Fade gradients so the text remains legible AND it fades perfectly into the Spider-Man background below */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--void) 15%, transparent 75%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, var(--void) 0%, transparent 20%, transparent 70%, transparent 100%)' }} />
        </div>

        {/* HUD backdrop */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute -right-24 top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-40 hidden lg:block"
            style={{ border: '1px solid var(--border-bright)' }}
          >
            <span className="radar-sweep" />
            {[0.72, 0.46, 0.22].map((s) => (
              <span
                key={s}
                className="absolute rounded-full border border-[var(--border)]"
                style={{ inset: `${(1 - s) * 50}%` }}
              />
            ))}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] status-live" />
            </span>
          </div>
          <div className="absolute inset-0 scan-line opacity-30" />
          <div className="web-grid absolute -right-28 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-70 hidden lg:block" />
        </div>

        {/* live system strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 inline-flex self-center sm:self-start items-center gap-2 glass-panel px-3 py-1.5 mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] status-live" />
          <span className="data-label text-[var(--ink-muted)]">
            {socket?.connected ? 'SPIDERSENSE ONLINE' : 'RECONNECTING TO JARVIS'} · {units.length} HERO UNITS · {stats.active} ACTIVE THREATS
          </span>
        </motion.div>

        <div className="relative z-10 max-w-3xl">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl sm:text-7xl leading-[1.05] tracking-tight"
            style={{ textShadow: '3px 3px 0 rgba(28,20,16,0.18)' }}
          >
            WHEN DANGER STRIKES,
            <br />
            <span className="text-[var(--cyan)]">SPIDERSENSE KNOWS.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed max-w-xl"
          >
            A real-time emergency detection, coordination and response network connecting citizens, command centers and responders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => onNavigate('command')}
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl font-display tracking-wide text-[var(--on-accent)] border-[3px] shadow-[4px_4px_0_var(--ink)]"
              style={{ background: 'linear-gradient(90deg, var(--cyan), var(--blue))', borderColor: 'var(--ink)' }}
            >
              ACTIVATE SPIDERSENSE
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => onNavigate('report')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-display tracking-wide border-[3px] shadow-[4px_4px_0_var(--ink)]"
              style={{ borderColor: 'var(--border-bright)', color: 'var(--ink)', background: 'var(--panel)' }}
            >
              REPORT AN INCIDENT
            </button>
          </motion.div>
        </div>

        {/* stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 mt-14 glass-panel grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--grid-line)] max-w-3xl"
        >
          <StatBlock label="ACTIVE INCIDENTS" value={stats.active} color="var(--cyan)" />
          <StatBlock label="UNITS DEPLOYED" value={units.filter((u) => u.status !== 'available' && u.status !== 'offline').length} color="var(--amber)" />
          <StatBlock label="RESOLVED" value={stats.resolved + 24} color="var(--green)" />
          <StatBlock label="NETWORK UPTIME" value={uptime} suffix="%" color="var(--blue)" />
        </motion.div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <SectionHeading
          eyebrow="HOW THE RESPONSE NETWORK WORKS"
          title="Four stages, one continuous chain of custody."
          sub="From the first signal to the closed case, nothing is handed off blind — command, responders, and the reporting party all watch the same status move forward."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <div className="hidden lg:block absolute top-[38px] left-[12%] right-[12%] h-px bg-[var(--grid-line)]" />
          {WORK_STEPS.map((s, i) => (
            <Reveal key={s.label} i={i} className="glass-panel p-5 relative">
              <span className="panel-corner tl" /><span className="panel-corner br" />
              <div className="h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--cyan)]/40 bg-[var(--cyan)]/10 mb-4">
                <s.icon size={16} className="text-[var(--cyan)]" />
              </div>
              <p className="data-label text-[var(--ink-faint)] mb-1">STEP {i + 1}</p>
              <h3 className="font-display font-semibold text-base mb-2">{s.label}</h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{s.copy}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ LIVE THREAT INTELLIGENCE ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <SectionHeading
            eyebrow="SPIDER-SENSE THREAT INTELLIGENCE"
            title="Every threat detected. Every hero in motion."
          sub="Field sensors, drone patrols, unit callbacks, and civilian reports all feed the same queue — so nothing critical waits behind something routine."
        />
        <div className="grid lg:grid-cols-5 gap-4">
          <Reveal className="lg:col-span-2 glass-panel flex flex-col relative">
            <span className="panel-corner tl" /><span className="panel-corner bl" />
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[var(--border)]">
              <Activity size={12} className="text-[var(--ink-muted)]" />
              <span className="data-label">INCIDENT FEED · LIVE</span>
            </div>
            <div className="flex-1">
              {incidentsLoading
                ? [...Array(4)].map((_, i) => <div key={i} className="h-14 m-3 rounded-xl bg-[var(--panel-raised)] animate-pulse" />)
                : feed.map((inc) => (
                    <div key={inc.id} className="px-4 py-3 border-b border-[var(--grid-line)] flex items-center gap-3">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${inc.severity === 'critical' ? 'alert-pulse' : ''}`}
                        style={{ background: { critical: '#E63C2F', high: '#F07B1D', moderate: '#1C4FA6', low: '#6B6259' }[inc.severity] }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] truncate">{inc.title}</p>
                        <p className="data-label text-[var(--ink-faint)] truncate">{inc.code} · {inc.location.label}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </Reveal>

          <Reveal i={1} className="lg:col-span-3 min-h-[340px] h-[340px] lg:h-full w-full">
            <MapView incidents={incidents} units={units} loading={incidentsLoading || unitsLoading} />
          </Reveal>
        </div>
      </section>

      {/* ============ RAPID RESPONDER DISPATCH ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <SectionHeading
          eyebrow="RAPID RESPONDER DISPATCH"
          title="A live roster, always ready to move."
          sub="Fire, medical, hazmat, tactical, and air units report status continuously — command dispatches the nearest capable unit, not just the next one in line."
        />
        <div className="flex gap-3 overflow-x-auto tac-scroll pb-2 -mx-1 px-1">
          {unitsLoading
            ? [...Array(4)].map((_, i) => <div key={i} className="h-16 w-64 shrink-0 rounded-xl bg-[var(--panel-raised)] animate-pulse" />)
            : units.slice(0, 6).map((u, i) => (
                <Reveal key={u.id} i={i} className="w-72 shrink-0">
                  <UnitCard unit={u} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* ============ REAL-TIME TRACKING ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <p className="data-label text-[var(--cyan)] mb-2 flex items-center gap-1.5">
              <span className="h-1 w-4 bg-[var(--cyan)] rounded-full" /> REAL-TIME TRACKING
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-4">
              Watch a response move from dispatch to on-scene, live.
            </h2>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed mb-6">
              Bearing, distance, and ETA recompute continuously between a
              unit and its assigned incident — the same overwatch view
              command uses is one tap away for anyone tracking a report.
            </p>
            <button
              onClick={() => onNavigate('command')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm tracking-wide border-[3px] w-fit shadow-[3px_3px_0_var(--ink)]"
              style={{ borderColor: 'var(--border-bright)' }}
            >
              <MapPinned size={14} className="text-[var(--cyan)]" />
              OPEN COMMAND MAP
              <ArrowRight size={14} />
            </button>
          </Reveal>
          <Reveal i={1} className="h-[340px]">
            <MapView
              incidents={incidents.slice(0, 3)}
              units={units.slice(0, 4)}
              loading={incidentsLoading || unitsLoading}
            />
          </Reveal>
        </div>
      </section>

      {/* ============ ANALYTICS ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <SectionHeading
            eyebrow="ANALYTICS"
            title="The network gets sharper with every case it closes."
            sub="Response trends, incident-type breakdowns, and a cross-dimensional operations index — all modeled from real closed cases."
          />
          <Reveal>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-bold text-sm tracking-wide border-[3px] shrink-0 mb-10 shadow-[3px_3px_0_var(--ink)]"
              style={{ borderColor: 'var(--border-bright)' }}
            >
              <BarChart3 size={14} className="text-[var(--cyan)]" />
              VIEW FULL ANALYTICS
              <ArrowRight size={14} />
            </button>
          </Reveal>
        </div>
        <Reveal className="h-[320px]">
          <AnalyticsChart loading={incidentsLoading} />
        </Reveal>
      </section>

      {/* ============ BUILT FOR THOSE WHO RESPOND ============ */}
      <section className="relative px-4 sm:px-8 py-20 border-t border-[var(--grid-line)]">
        <SectionHeading
          eyebrow="BUILT FOR THOSE WHO RESPOND"
          title="Three roles. One network. Pick where you stand."
        />
        <div className="grid md:grid-cols-3 gap-4">
          {ROLE_CARDS.map((r, i) => (
            <Reveal key={r.key} i={i}>
              <button
                onClick={() => onNavigate(r.key)}
                className="glass-panel p-6 text-left relative w-full h-full flex flex-col group hover:border-[var(--border-bright)] transition-colors"
              >
                <span className="panel-corner tl" /><span className="panel-corner br" />
                <div className="mb-5">
                  <Emblem size={40} color={r.accent} icon={r.icon} iconSize={17} />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{r.title}</h3>
                <p className="text-xs text-[var(--ink-muted)] leading-relaxed mb-6 flex-1">{r.copy}</p>
                <span
                  className="flex items-center gap-1.5 data-label group-hover:gap-2.5 transition-all"
                  style={{ color: r.accent }}
                >
                  {r.cta} <ArrowRight size={12} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CINEMATIC CLOSING CTA ============ */}
      <section className="relative px-4 sm:px-8 py-24 border-t border-[var(--grid-line)] overflow-hidden text-center bg-[var(--void)]/40 backdrop-blur-sm">

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20 z-0">
          <div className="orbit-ring-a rounded-full border border-[var(--cyan)]" style={{ width: 460, height: 460 }} />
          <div className="orbit-ring-b rounded-full border border-[var(--blue)] absolute" style={{ width: 620, height: 620 }} />
        </div>
        <Reveal className="relative z-10 flex flex-col items-center">
          <div className="mb-6">
            <Emblem size={48} icon={ShieldHalf} iconSize={22} />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl max-w-xl leading-tight">
            THE NETWORK IS READY.
            <br />
            <span className="text-[var(--cyan)]">ARE YOU?</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('command')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-display tracking-wide text-[var(--on-accent)] border-[3px] shadow-[3px_3px_0_var(--ink)]"
              style={{ background: 'linear-gradient(90deg, var(--cyan), var(--blue))', borderColor: 'var(--ink)' }}
            >
              ENTER COMMAND CENTER <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('responder')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-display font-bold tracking-wide border-[3px] shadow-[3px_3px_0_var(--ink)]"
              style={{ borderColor: 'var(--border-bright)', color: 'var(--ink)' }}
            >
              <Radio size={15} className="text-[var(--amber)]" /> GO ON DUTY
            </button>
          </div>
          <p className="data-label text-[var(--ink-faint)] mt-10 flex items-center gap-2">
            <Satellite size={11} /> SPIDERSENSE NETWORK · AVENGERS RESPONSE SYSTEM · DEMO MODE
          </p>
        </Reveal>
      </section>
    </div>
  );
}
