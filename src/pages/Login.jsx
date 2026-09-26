import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Login({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('commander');

  const [selectedHero, setSelectedHero] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { units, login, loginHero } = useStore();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login(role);
      onNavigate(role === 'commander' ? 'command' : role === 'citizen' ? 'report' : 'responder');
    }, 1200);
  };

  const handleHeroLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      await loginHero(selectedHero.username, password);
      onNavigate('responder');
    } catch (err) {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="tac-grid-bg w-full min-h-screen flex items-center justify-center p-4">
      {/* Background cinematic effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]">
          <div className="orbit-ring-a rounded-full border border-[var(--cyan)] absolute inset-0" />
          <div className="orbit-ring-b rounded-full border border-[var(--blue)] absolute inset-10" />
          <div className="radar-sweep absolute inset-20" />
        </div>
        <div className="absolute inset-0 scan-line opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md p-8 relative z-10"
      >
        <span className="panel-corner tl" /><span className="panel-corner tr" />
        <span className="panel-corner bl" /><span className="panel-corner br" />
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-[var(--cyan)] bg-[var(--cyan)]/10 flex items-center justify-center mb-4">
            <ShieldAlert size={28} className="text-[var(--cyan)]" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-wide text-center">SPIDERSENSE<br/><span className="text-[var(--cyan)]">COMMAND ACCESS</span></h1>
          <p className="text-sm text-[var(--ink-muted)] mt-2">AUTHENTICATION REQUIRED</p>
        </div>

        {!selectedHero ? (
          <>
            <div className="space-y-4 mb-8">
              <div>
                <label className="data-label text-[var(--cyan)] block mb-2">SELECT CLEARANCE LEVEL</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'citizen', label: 'CITIZEN', icon: UserCheck },
                    { id: 'responder', label: 'HERO', icon: Shield },
                    { id: 'commander', label: 'COMMAND', icon: ShieldAlert }
                  ].map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center justify-center p-3 border ${role === r.id ? 'border-[var(--cyan)] bg-[var(--cyan)]/20 text-[var(--cyan)]' : 'border-[var(--border)] text-[var(--ink-muted)] hover:border-[var(--border-bright)]'} rounded-lg transition-colors`}
                    >
                      <r.icon size={18} className="mb-2" />
                      <span className="text-[10px] font-bold font-display">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {role === 'responder' ? (
              <div className="mb-8 max-h-60 overflow-y-auto pr-2">
                <label className="data-label text-[var(--cyan)] block mb-2">SELECT RESPONDER PROFILE</label>
                <div className="grid grid-cols-2 gap-2">
                  {units.filter(u => u.isActive !== false).map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedHero(u)}
                      className="flex items-center gap-3 p-3 border border-[var(--border)] bg-[var(--panel-raised)] hover:border-[var(--cyan)] hover:bg-[var(--cyan)]/10 rounded-lg transition-colors text-left"
                    >
                      <img src={u.avatarUrl} alt={u.callSign} className="w-8 h-8 rounded-full border border-[var(--border)]" />
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-[11px] truncate text-[var(--ink)]">{u.callSign}</div>
                        <div className="text-[9px] text-[var(--ink-muted)] truncate">{u.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full relative flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-display font-bold tracking-wide border-[3px] shadow-[0_0_15px_rgba(39,197,232,0.3)] transition-all overflow-hidden hover:bg-[rgba(39,197,232,0.2)]"
                style={{ borderColor: 'var(--cyan)', color: 'var(--ink)', background: 'rgba(39,197,232,0.1)' }}
              >
                {loading ? (
                  <span className="animate-pulse">
                    {role === 'commander' && 'CONNECTING TO JARVIS...'}
                    {role === 'citizen' && 'ACCESSING SECURE NODE...'}
                  </span>
                ) : (
                  <>
                    INITIALIZE LOGIN <ArrowRight size={18} />
                  </>
                )}
                {loading && <div className="absolute bottom-0 left-0 h-1 bg-[var(--cyan)] animate-[scan-sweep_1s_ease-in-out_infinite]" style={{ width: '100%' }} />}
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleHeroLogin} className="space-y-6">
            <div className="flex items-center gap-4 p-4 border border-[var(--cyan)] bg-[var(--cyan)]/10 rounded-lg">
              <img src={selectedHero.avatarUrl} alt={selectedHero.callSign} className="w-12 h-12 rounded-full border-2 border-[var(--cyan)]" />
              <div>
                <div className="font-display font-bold text-[var(--ink)]">{selectedHero.callSign}</div>
                <div className="text-xs text-[var(--cyan)]">{selectedHero.type.toUpperCase()} SPECIALIST</div>
              </div>
              <button type="button" onClick={() => setSelectedHero(null)} className="ml-auto text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]">CHANGE</button>
            </div>
            
            <div>
              <label className="data-label text-[var(--cyan)] block mb-2">PASSCODE</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--ink)] focus:border-[var(--cyan)] outline-none"
                placeholder="Enter passcode"
                autoFocus
              />
              {error && <p className="text-[var(--red)] text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-display font-bold tracking-wide border-[3px] shadow-[0_0_15px_rgba(39,197,232,0.3)] transition-all overflow-hidden hover:bg-[rgba(39,197,232,0.2)]"
              style={{ borderColor: 'var(--cyan)', color: 'var(--ink)', background: 'rgba(39,197,232,0.1)' }}
            >
              {loading ? <span className="animate-pulse">SYNCING STARK TECH...</span> : <>AUTHENTICATE <ArrowRight size={18} /></>}
              {loading && <div className="absolute bottom-0 left-0 h-1 bg-[var(--cyan)] animate-[scan-sweep_1s_ease-in-out_infinite]" style={{ width: '100%' }} />}
            </button>
          </form>
        )}

        <p className="data-label text-[var(--ink-faint)] text-center mt-6">
          SECURE ENCRYPTED CONNECTION ESTABLISHED
        </p>
      </motion.div>
    </div>
  );
}
