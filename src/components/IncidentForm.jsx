import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, HeartPulse, Radiation, LifeBuoy, ShieldAlert, CloudLightning, Crosshair, Send, CheckCircle2 } from 'lucide-react';

const TYPES = [
  { value: 'fire', label: 'Fire', icon: Flame, color: '#E63C2F' },
  { value: 'medical', label: 'Medical', icon: HeartPulse, color: '#2E9E4F' },
  { value: 'hazmat', label: 'Hazmat', icon: Radiation, color: '#F07B1D' },
  { value: 'rescue', label: 'Rescue', icon: LifeBuoy, color: '#1C4FA6' },
  { value: 'security', label: 'Security', icon: ShieldAlert, color: '#2AA8D8' },
  { value: 'severe-weather', label: 'Weather', icon: CloudLightning, color: '#8B4FE0' },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: '#E63C2F' },
  { value: 'high', label: 'High', color: '#F07B1D' },
  { value: 'moderate', label: 'Moderate', color: '#1C4FA6' },
  { value: 'low', label: 'Low', color: '#6B6259' },
];

export default function IncidentForm({ onSubmit, submitting = false }) {
  const [type, setType] = useState('fire');
  const [severity, setSeverity] = useState('high');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notes, setNotes] = useState('');
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Describe what you\u2019re seeing.';
    if (!location.trim()) e.location = 'Add a location or landmark.';
    return e;
  };

  useEffect(() => {
    if (!location || location.length < 3 || coordinates) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Location search failed:', err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [location, coordinates]);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    // Use actual coordinates if selected, otherwise generate a mock coordinate around NYC
    const lat = coordinates ? parseFloat(coordinates.lat) : 40.7128 + (Math.random() * 0.1 - 0.05);
    const lng = coordinates ? parseFloat(coordinates.lon) : -74.0060 + (Math.random() * 0.1 - 0.05);

    onSubmit?.({
      type,
      severity,
      title: title.trim(),
      location: { label: location.trim(), lat, lng },
      notes: notes.trim(),
    });

    setSent(true);
    setTitle('');
    setLocation('');
    setNotes('');
    setTimeout(() => setSent(false), 3200);
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 relative">
      <span className="panel-corner tl" />
      <span className="panel-corner tr" />
      <span className="panel-corner bl" />
      <span className="panel-corner br" />

      <div className="flex items-center gap-2 mb-5">
        <Crosshair size={16} className="text-[var(--cyan)]" />
        <h2 className="font-display font-semibold text-lg tracking-wide text-[var(--ink)]">
          Report a Threat
        </h2>
      </div>

      <div className="mb-4">
        <p className="data-label mb-2">THREAT TYPE</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(({ value, label, icon: Icon, color }) => {
            const active = type === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-colors"
                style={{
                  borderColor: active ? color : 'var(--border)',
                  background: active ? `${color}14` : 'transparent',
                }}
              >
                <Icon size={18} style={{ color: active ? color : 'var(--ink-muted)' }} />
                <span className="data-label" style={{ color: active ? color : 'var(--ink-muted)' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="data-label mb-2">SEVERITY</p>
        <div className="flex gap-2">
          {SEVERITIES.map(({ value, label, color }) => {
            const active = severity === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSeverity(value)}
                className="flex-1 py-2 rounded-xl border text-center transition-colors"
                style={{
                  borderColor: active ? color : 'var(--border)',
                  background: active ? `${color}14` : 'transparent',
                  color: active ? color : 'var(--ink-muted)',
                }}
              >
                <span className="data-label">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="data-label block mb-2" htmlFor="incident-title">WHAT'S HAPPENING</label>
        <input
          id="incident-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Smoke coming from second floor"
          className="w-full bg-[var(--panel-raised)] border rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--cyan)] transition-colors"
          style={{ borderColor: errors.title ? 'var(--red)' : 'var(--border)' }}
        />
        {errors.title && <p className="text-[11px] mt-1" style={{ color: 'var(--red)' }}>{errors.title}</p>}
      </div>

      <div className="mb-4 relative">
        <label className="data-label block mb-2" htmlFor="incident-location">LOCATION</label>
        <input
          id="incident-location"
          value={location}
          onChange={(e) => { setLocation(e.target.value); setCoordinates(null); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Address, cross-street, or landmark"
          className="w-full bg-[var(--panel-raised)] border rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--cyan)] transition-colors"
          style={{ borderColor: errors.location ? 'var(--red)' : 'var(--border)' }}
        />
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-10 w-full mt-1 bg-[var(--panel)] border border-[var(--border)] rounded-xl shadow-lg max-h-48 overflow-y-auto"
            >
              {suggestions.map((s, i) => (
                <div 
                  key={i} 
                  className="px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--cyan)] hover:text-[var(--on-accent)] cursor-pointer truncate transition-colors"
                  onClick={() => {
                    setLocation(s.display_name);
                    setCoordinates({ lat: s.lat, lon: s.lon });
                    setShowSuggestions(false);
                  }}
                >
                  {s.display_name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {errors.location && <p className="text-[11px] mt-1" style={{ color: 'var(--red)' }}>{errors.location}</p>}
      </div>

      <div className="mb-5">
        <label className="data-label block mb-2" htmlFor="incident-notes">ADDITIONAL DETAILS (OPTIONAL)</label>
        <textarea
          id="incident-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Number of people affected, hazards, access notes..."
          className="w-full bg-[var(--panel-raised)] border border-[var(--border)] rounded-xl px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none focus:border-[var(--cyan)] transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold tracking-wide text-[var(--on-accent)] transition-opacity disabled:opacity-50"
        style={{ background: 'linear-gradient(90deg, var(--cyan), var(--blue))' }}
      >
        <Send size={15} />
        {submitting ? 'TRANSMITTING TO COMMAND…' : 'ALERT SPIDER-SENSE'}
      </button>

      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center gap-2 text-sm"
            style={{ color: 'var(--green)' }}
          >
            <CheckCircle2 size={15} />
            SPIDER-SENSE ACTIVATED · COMMAND IS REVIEWING YOUR ALERT.
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
