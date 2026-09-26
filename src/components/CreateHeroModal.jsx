import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const TYPES = [
  { value: 'tactical', label: 'Tactical' },
  { value: 'fire', label: 'Fire & Rescue' },
  { value: 'medical', label: 'Medical' },
  { value: 'hazmat', label: 'Hazmat' },
  { value: 'air', label: 'Air Support' },
];

export default function CreateHeroModal({ onClose }) {
  const { createHero } = useStore();
  const [draft, setDraft] = useState({
    name: '',
    callSign: '',
    username: '',
    password: '',
    type: 'tactical',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createHero(draft);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--void)]/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel w-full max-w-md p-6 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--ink-muted)] hover:text-[var(--ink)]">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center border border-[var(--cyan)]/40 bg-[var(--cyan)]/10">
            <UserPlus size={18} className="text-[var(--cyan)]" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg leading-none">ADD RESPONDER</h2>
            <p className="data-label text-[var(--ink-faint)] mt-0.5">REGISTER NEW HERO CREDENTIALS</p>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-10">
            <CheckCircle2 size={48} className="text-[var(--green)] mb-4" />
            <p className="font-display font-bold text-[var(--green)]">CREDENTIALS REGISTERED</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label text-[var(--cyan)] block mb-1">REAL NAME</label>
                <input
                  required
                  value={draft.name}
                  onChange={e => setDraft({ ...draft, name: e.target.value })}
                  className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none"
                  placeholder="e.g. Peter Parker"
                />
              </div>
              <div>
                <label className="data-label text-[var(--cyan)] block mb-1">CALL SIGN</label>
                <input
                  required
                  value={draft.callSign}
                  onChange={e => setDraft({ ...draft, callSign: e.target.value })}
                  className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none"
                  placeholder="e.g. Spider-Man"
                />
              </div>
            </div>

            <div>
              <label className="data-label text-[var(--cyan)] block mb-1">SPECIALIZATION</label>
              <select
                value={draft.type}
                onChange={e => setDraft({ ...draft, type: e.target.value })}
                className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="data-label text-[var(--cyan)] block mb-1">USERNAME</label>
                <input
                  required
                  value={draft.username}
                  onChange={e => setDraft({ ...draft, username: e.target.value })}
                  className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none"
                  placeholder="Login ID"
                />
              </div>
              <div>
                <label className="data-label text-[var(--cyan)] block mb-1">PASSCODE</label>
                <input
                  type="password"
                  required
                  value={draft.password}
                  onChange={e => setDraft({ ...draft, password: e.target.value })}
                  className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--cyan)] outline-none"
                  placeholder="Set passcode"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={draft.isActive}
                onChange={e => setDraft({ ...draft, isActive: e.target.checked })}
                className="accent-[var(--cyan)]"
              />
              <label htmlFor="isActive" className="data-label text-[var(--ink)] cursor-pointer">
                ACTIVATE PROFILE IMMEDIATELY
              </label>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg data-label hover:bg-[var(--panel-raised)]">
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-lg data-label font-bold bg-[var(--cyan)] text-[var(--void)] hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'REGISTERING...' : 'REGISTER HERO'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
