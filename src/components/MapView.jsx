import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Crosshair, Compass, Navigation2 } from 'lucide-react';

/**
 * MapView — precision tactical overlay
 * Role reference: Hawkeye — nothing decorative, every mark is
 * measurement. Adds a reticle + distance rings on the selected target,
 * a live coordinate/bearing readout, and targeting-bracket markers in
 * place of plain pins. Props are unchanged from v1 (incidents, units,
 * center, onSelectIncident, loading) plus an optional
 * `selectedIncidentId` for external control — everything else is
 * computed internally so existing integrations keep working.
 */

const SEVERITY_COLOR = { critical: '#E63C2F', high: '#F07B1D', moderate: '#1C4FA6', low: '#6B6259' };
const UNIT_COLOR = { fire: '#E63C2F', medical: '#2E9E4F', hazmat: '#F07B1D', tactical: '#1C4FA6', air: '#2AA8D8' };

function bracketIcon(color, isCritical, isSelected) {
  const size = isSelected ? 34 : 22;
  return divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${isCritical ? `<span style="position:absolute;inset:0;border-radius:50%;background:${color}44;animation:pulse-ring 1.8s ease-out infinite;"></span>` : ''}
        ${isSelected ? `
          <svg width="${size}" height="${size}" viewBox="0 0 34 34" style="position:absolute;inset:0;">
            <path d="M2 9V2h7" stroke="${color}" stroke-width="1.6" fill="none"/>
            <path d="M32 9V2h-7" stroke="${color}" stroke-width="1.6" fill="none"/>
            <path d="M2 25v7h7" stroke="${color}" stroke-width="1.6" fill="none"/>
            <path d="M32 25v7h-7" stroke="${color}" stroke-width="1.6" fill="none"/>
          </svg>` : ''}
        <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};border:2px solid #ffffff;"></span>
      </div>`,
  });
}

function unitIcon(color, callSign) {
  const initials = callSign ? callSign.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  return divIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div style="width:36px;height:36px;border-radius:50%;border:2px solid ${color};box-shadow:0 0 12px ${color}88;background:#05070a;display:flex;align-items:center;justify-content:center;color:#fff;font-family:monospace;font-weight:bold;font-size:14px;">${initials}</div>`,
  });
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function bearing(a, b) {
  const y = Math.sin(((b.lng - a.lng) * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180);
  const x =
    Math.cos((a.lat * Math.PI) / 180) * Math.sin((b.lat * Math.PI) / 180) -
    Math.sin((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.cos(((b.lng - a.lng) * Math.PI) / 180);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

function Recenter({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, Math.max(map.getZoom(), 13), { duration: 0.6 });
  }, [target, map]);
  return null;
}

export default function MapView({
  incidents = [],
  units = [],
  center,
  onSelectIncident,
  selectedIncidentId,
  loading = false,
}) {
  const mapCenter = useMemo(() => center ?? [40.7128, -74.006], [center]);
  const [internalSelected, setInternalSelected] = useState(null);
  const activeId = selectedIncidentId ?? internalSelected;
  const active = incidents.find((i) => i.id === activeId);

  const handleSelect = (inc) => {
    setInternalSelected(inc.id);
    onSelectIncident?.(inc);
  };

  const nearestUnit = useMemo(() => {
    if (!active || units.length === 0) return null;
    
    // If the incident is already dispatched, track the assigned unit instead of the nearest available
    if (active.assignedUnitIds?.length > 0) {
      const assigned = units.filter((u) => active.assignedUnitIds.includes(u.id));
      if (assigned.length > 0) {
        return assigned
          .map((u) => ({ u, d: haversineKm(active.location, u.location) }))
          .sort((a, b) => a.d - b.d)[0];
      }
    }

    // Otherwise show nearest unit as a recommended projection
    return units
      .filter((u) => u.status === 'available')
      .map((u) => ({ u, d: haversineKm(active.location, u.location) }))
      .sort((a, b) => a.d - b.d)[0];
  }, [active, units]);

  const isLightMode = typeof document !== 'undefined' && document.body.className.includes('theme-home');
  const mapStyle = isLightMode ? 'light_all' : 'dark_all';

  if (loading) {
    return (
      <div className="glass-panel h-full flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 scan-line opacity-20 pointer-events-none" />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Radar size={26} className="text-[var(--cyan)] animate-spin" style={{ animationDuration: '2.4s' }} />
          <p className="data-label text-[var(--cyan)]">JARVIS ACQUIRING SATELLITE FEED…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel h-full relative overflow-hidden">
      <span className="panel-corner tl" /><span className="panel-corner tr" />
      <span className="panel-corner bl" /><span className="panel-corner br" />

      <div className="absolute top-3 left-3 z-[500] flex items-center gap-2 glass-panel px-3 py-1.5">
        <Crosshair size={13} className="text-[var(--cyan)]" />
        <span className="data-label">PRECISION OVERWATCH</span>
      </div>

      <div className="absolute top-3 right-3 z-[500] glass-panel px-3 py-1.5 hidden sm:flex items-center gap-3">
        {Object.entries(SEVERITY_COLOR).map(([sev, color]) => (
          <span key={sev} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
            <span className="data-label capitalize" style={{ color }}>{sev}</span>
          </span>
        ))}
      </div>

      {/* Target readout — bearing, distance, coordinates of the active lock */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute bottom-3 left-3 z-[500] glass-panel px-3 py-2 lock-on"
          >
            <p className="data-label text-[var(--cyan)] mb-1 flex items-center gap-1.5">
              <Crosshair size={11} /> TARGET LOCK · {active.code}
            </p>
            <p className="font-mono text-[11px] text-[var(--ink-muted)]">
              {active.location.lat.toFixed(4)}, {active.location.lng.toFixed(4)}
            </p>
            {nearestUnit && (
              <div className="mt-1 pt-1 border-t border-[var(--border-bright)]">
                <p className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--amber)]">
                  <Navigation2
                    size={11}
                    style={{ transform: `rotate(${bearing(nearestUnit.u.location, active.location)}deg)` }}
                  />
                  {active.assignedUnitIds?.length > 0 ? 'LIVE TRACKING' : 'NEAREST HERO'} · {nearestUnit.u.callSign}
                </p>
                <p className="font-mono text-[10px] text-[var(--ink-muted)] mt-0.5 ml-4">
                  DIST: {nearestUnit.d.toFixed(1)} km · ETA: {Math.max(1, Math.ceil(nearestUnit.d * 1.5))} MIN
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 right-3 z-[500] glass-panel px-2.5 py-1.5 flex items-center gap-1.5">
        <Compass size={12} className="text-[var(--ink-faint)]" />
        <span className="data-label text-[var(--ink-faint)]">GRID REF · LIVE</span>
      </div>

      <MapContainer
        key={mapStyle} // force re-render when theme changes
        center={mapCenter}
        zoom={12}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: 'var(--void)' }}
      >
        <TileLayer
          url={import.meta.env.VITE_MAP_TILE_URL || `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`}
          attribution='&copy; OpenStreetMap contributors'
          className={mapStyle === 'dark_all' ? 'map-dark-mode' : ''}
        />

        {active && <Recenter target={[active.location.lat, active.location.lng]} />}

        {active && nearestUnit && (
          <Polyline
            positions={[
              [nearestUnit.u.location.lat, nearestUnit.u.location.lng],
              [active.location.lat, active.location.lng],
            ]}
            pathOptions={{ color: '#27C5E8', weight: 2, dashArray: '4 8', opacity: 0.8, className: 'animated-route' }}
          />
        )}

        {incidents.filter(inc => inc.location?.lat != null && inc.location?.lng != null).map((inc) => {
          const isActive = inc.id === activeId;
          const color = SEVERITY_COLOR[inc.severity] ?? '#6B6259';
          return (
            <div key={inc.id}>
              {isActive && (
                <>
                  <Circle center={[inc.location.lat, inc.location.lng]} radius={400} pathOptions={{ color, fillOpacity: 0, weight: 1, opacity: 0.9 }} />
                  <Circle center={[inc.location.lat, inc.location.lng]} radius={800} pathOptions={{ color, fillOpacity: 0, weight: 1, opacity: 0.4 }} />
                </>
              )}
              <Circle
                center={[inc.location.lat, inc.location.lng]}
                radius={inc.severity === 'critical' ? 650 : 350}
                pathOptions={{ color, fillOpacity: 0.06, weight: 1, opacity: 0.35 }}
              />
              <Marker
                position={[inc.location.lat, inc.location.lng]}
                icon={bracketIcon(color, inc.severity === 'critical', isActive)}
                eventHandlers={{ click: () => handleSelect(inc) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    <strong>{inc.code}</strong> — {inc.title}
                    <br />
                    {inc.location.label} · {inc.severity.toUpperCase()}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}

        {units.map((u) => (
          <Marker key={u.id} position={[u.location.lat, u.location.lng]} icon={unitIcon(UNIT_COLOR[u.type] ?? '#1C4FA6', u.callSign)}>
            <Popup>
              <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                <strong>{u.callSign}</strong>
                <br />
                {u.type.toUpperCase()} · {u.status.toUpperCase()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
