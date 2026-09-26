/**
 * Emblem — original comic-burst insignia used across the app (nav logo,
 * hero badges, closing CTA). A jagged 12-point starburst with a thick
 * ink outline, styled after vintage comic sound-effect graphics — kept
 * deliberately abstract and geometric so it reads as "hero network"
 * without echoing any specific studio's shield, star, or insignia.
 */
function burstPoints(cx, cy, rOuter, rInner, points = 12) {
  const step = Math.PI / points;
  let d = '';
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const angle = i * step - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

export default function Emblem({ size = 32, color = 'var(--cyan)', icon: Icon, iconSize }) {
  const path = burstPoints(16, 16, 15, 10.5, 12);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" className="absolute inset-0" width={size} height={size}>
        <path
          d={path}
          fill={color}
          fillOpacity="0.16"
          stroke="var(--ink)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="16" r="7.5" fill={color} fillOpacity="0.22" stroke="var(--ink)" strokeWidth="1.2" />
      </svg>
      {Icon && <Icon size={iconSize ?? Math.round(size * 0.4)} style={{ color }} className="relative z-10" strokeWidth={2.4} />}
    </div>
  );
}
