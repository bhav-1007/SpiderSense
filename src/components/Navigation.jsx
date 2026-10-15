import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldHalf, Home, LayoutGrid, FileWarning, Radio, BarChart3, Signal, LogOut } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useStore } from '../context/StoreContext';
import Emblem from './Emblem';

export const ROUTES = [
  { key: 'home', label: 'HOME', icon: Home, accent: '#1C4FA6' },
  { key: 'command', label: 'AVENGERS COMMAND', icon: LayoutGrid, accent: '#27C5E8' },
  { key: 'report', label: 'REPORT THREAT', icon: FileWarning, accent: '#397DFF' },
  { key: 'responder', label: 'HERO STATUS', icon: Radio, accent: '#FFB547' },
  { key: 'analytics', label: 'INTELLIGENCE', icon: BarChart3, accent: '#B18CFF' },
];

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="hidden lg:inline data-label tabular-nums text-[var(--ink-muted)]">
      {now.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

export default function Navigation({ active, onNavigate }) {
  const socket = useSocket();
  const { currentUser, logout } = useStore();
  const activeRoute = ROUTES.find((r) => r.key === active) ?? ROUTES[0];

  const filteredRoutes = ROUTES.filter(route => {
    if (!currentUser) return route.key === 'home';
    if (currentUser.role === 'citizen') return ['home', 'report'].includes(route.key);
    if (currentUser.role === 'responder') return ['responder'].includes(route.key);
    if (currentUser.role === 'commander') return ['command', 'analytics'].includes(route.key);
    return true;
  });

  return (
    <>
      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-[1000] glass-panel backdrop-blur-md"
        style={{ borderBottom: `2px solid ${activeRoute.accent}`, borderRadius: 0 }}
      >
        <nav className="max-w-[1400px] mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 shrink-0 group focus:outline-none"
            aria-label="SpiderSense Home"
          >
            <Emblem size={32} icon={ShieldHalf} iconSize={16} color="var(--cyan)" />
            <span
              className="font-display text-lg sm:text-xl font-bold tracking-wider"
              style={{ color: 'var(--cyan)' }}
            >
              SPIDERSENSE
            </span>
          </button>

          {/* Desktop/Tablet Navigation Links (hidden on mobile phones) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto tac-scroll flex-1 justify-center">
            {filteredRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = route.key === active;
              return (
                <button
                  key={route.key}
                  onClick={() => onNavigate(route.key)}
                  className="relative px-3 sm:px-4 py-2 flex items-center gap-2 shrink-0 rounded-lg transition-all focus:outline-none"
                  style={{ background: isActive ? `${route.accent}26` : 'transparent' }}
                >
                  <Icon
                    size={15}
                    style={{ color: isActive ? route.accent : 'var(--ink-faint)' }}
                    className="transition-colors"
                  />
                  <span
                    className="data-label transition-colors"
                    style={{ color: isActive ? 'var(--ink)' : 'var(--ink-muted)' }}
                  >
                    {route.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute left-2 right-2 -bottom-[2px] h-[3px] rounded-t-sm"
                      style={{ background: route.accent }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Status & User Panel */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="hidden xl:flex items-center gap-1.5">
              <Signal size={12} className={socket?.connected ? 'text-[var(--green)]' : 'text-[var(--red-dim)]'} />
              <span className="data-label text-[var(--ink-muted)]">
                {socket?.connected ? 'JARVIS ONLINE' : 'COMMAND LINK DOWN'}
              </span>
            </span>
            <LiveClock />
            
            {currentUser && (
              <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-[var(--grid-line)]">
                <div className="text-right">
                  <p className="data-label text-[10px] text-[var(--ink-faint)] leading-none">{currentUser.role.toUpperCase()}</p>
                  <p className="text-xs font-bold font-display text-[var(--cyan)] truncate max-w-[100px] sm:max-w-none">{currentUser.name}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('home');
                  }}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--panel-raised)] text-[var(--ink-muted)] hover:text-[var(--red-dim)] transition-colors focus:outline-none"
                  title="Disconnect"
                  aria-label="Logout"
                >
                  <LogOut size={17} />
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ── Mobile Bottom Navigation Bar (Screens < md) ───────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] glass-panel border-t border-[var(--border)] backdrop-blur-xl bg-[var(--void)]/90 px-2 py-1.5 flex items-center justify-around shadow-2xl"
        style={{ borderRadius: 0, paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
        aria-label="Mobile Navigation"
      >
        {filteredRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = route.key === active;
          return (
            <button
              key={route.key}
              onClick={() => onNavigate(route.key)}
              className="flex-1 min-h-[48px] py-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all relative focus:outline-none active:scale-95"
              style={{
                color: isActive ? route.accent : 'var(--ink-muted)',
                backgroundColor: isActive ? `${route.accent}14` : 'transparent',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon size={19} style={{ color: isActive ? route.accent : 'currentColor' }} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: route.accent }}
                  />
                )}
              </div>
              <span className="text-[9px] font-bold tracking-wider uppercase font-display leading-none">
                {route.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
