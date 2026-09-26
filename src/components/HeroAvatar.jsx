/**
 * HeroAvatar — original cartoon "responder mascot" bust icon.
 *
 * Purely geometric, invented character design (cowl + collar + emblem
 * chevron) with a small accessory that varies per unit discipline. This
 * is NOT modeled on, and does not reference, any existing comic, film,
 * or studio character — it exists so unit cards and rosters have a
 * friendly in-house mascot instead of a generic line icon.
 *
 * `variant` matches the unit type keys already used in TYPE_META:
 * 'fire' | 'medical' | 'hazmat' | 'tactical' | 'air'
 */
export default function HeroAvatar({ variant = 'tactical', color = 'var(--cyan)', size = 36 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        {/* cape collar */}
        <path
          d="M20 19 L6 32 C10 27 15 24.5 20 24.5 C25 24.5 30 27 34 32 Z"
          fill={color}
          stroke="var(--ink)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* air-support fins sit behind the head */}
        {variant === 'air' && (
          <path
            d="M8 17 L2 13 L8 14.5 Z M32 17 L38 13 L32 14.5 Z"
            fill={color}
            stroke="var(--ink)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        )}

        {/* fire crest — small stylised flame tip */}
        {variant === 'fire' && (
          <path
            d="M20 3 C22 6 23.5 7.8 21.6 10 C23 9.4 23.8 8 23.6 6.4 C25.6 8.4 25.4 11.4 23.4 13 C21 15 17.6 13.6 17.4 10.6 C17.2 7.8 18.6 5 20 3 Z"
            fill="var(--yellow)"
            stroke="var(--ink)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        )}

        {/* head / cowl */}
        <circle cx="20" cy="17" r="11" fill={color} stroke="var(--ink)" strokeWidth="1.6" />

        {/* hazmat goggles */}
        {variant === 'hazmat' ? (
          <g stroke="var(--ink)" strokeWidth="1.3">
            <circle cx="15.5" cy="17" r="3.4" fill="var(--panel)" />
            <circle cx="24.5" cy="17" r="3.4" fill="var(--panel)" />
            <line x1="18.9" y1="17" x2="21.1" y2="17" />
            <circle cx="15.5" cy="17" r="1.4" fill={color} opacity="0.5" />
            <circle cx="24.5" cy="17" r="1.4" fill={color} opacity="0.5" />
          </g>
        ) : (
          /* domino mask band, shared by fire / medical / tactical / air */
          <path
            d="M11.5 15.5 C14 14 17 13.3 20 13.3 C23 13.3 26 14 28.5 15.5 C28.5 18 26.8 19.6 24.6 19.6 C22.8 19.6 21.4 18.2 21 16.6 C20.7 18.4 19.3 19.6 18 19.6 C17 19.6 16 19 15.2 18 C13.6 18 11.9 17.2 11.5 15.5 Z"
            fill="var(--ink)"
            opacity="0.88"
          />
        )}

        {/* medical cross accent on the crown */}
        {variant === 'medical' && (
          <g fill="var(--panel)" stroke="var(--ink)" strokeWidth="1">
            <rect x="18.1" y="6" width="3.8" height="9" rx="0.8" />
            <rect x="15.1" y="9" width="9.8" height="3.8" rx="0.8" />
          </g>
        )}

        {/* tactical ear fin */}
        {variant === 'tactical' && (
          <path
            d="M9.5 13.5 L5 9 L9.5 10.8 Z M30.5 13.5 L35 9 L30.5 10.8 Z"
            fill={color}
            stroke="var(--ink)"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        )}

        {/* chest emblem chevron */}
        <path
          d="M17 27.5 L20 25.5 L23 27.5 L23 30.5 L20 32.2 L17 30.5 Z"
          fill="var(--yellow)"
          stroke="var(--ink)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
