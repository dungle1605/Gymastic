import React from 'react';
import { useStore } from '../store/UserActivityStore';

/* ── Color helpers ───────────────────────────────────────────── */
function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}
function darken(hex: string, amt = 30) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(0,r-amt)},${Math.max(0,g-amt)},${Math.max(0,b-amt)})`;
}
function lighten(hex: string, amt = 40) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(255,r+amt)},${Math.min(255,g+amt)},${Math.min(255,b+amt)})`;
}

/* ── Spinner ─────────────────────────────────────────────────── */
const Spinner: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
    <div style={{
      width: 72, height: 72,
      border: '5px solid rgba(255,255,255,0.08)',
      borderTop: '5px solid var(--accent-color)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <p style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
      ✨ AI is painting your anime avatar…
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   ANIME CHARACTER SVG
   ViewBox: 0 0 320 560
   The character stands centred with proportions:
   - Large head (anime ratio ~1:1.5 head-to-body)
   - Huge expressive eyes with iris / highlight / lashes
   - Slim waist, toned limbs
   - Dynamic waving arm
══════════════════════════════════════════════════════════════ */
const AnimeSVG: React.FC = () => {
  const { profile, metrics } = useStore();

  /* ── Body proportions from BMI ── */
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  // bodyW: 0.85 (thin) → 1.0 (normal) → 1.3 (heavy)
  const bodyW = Math.max(0.82, Math.min(1.3, bmi / 21.5));

  /* ── Colours ── */
  const skin       = '#FDDBB4';
  const skinDark   = '#E8A87C';
  const skinLine   = '#c97a40';
  const hair       = profile.hairColor;
  const hairDark   = darken(hair, 50);
  const hairLight  = lighten(hair, 30);
  const isFemale   = profile.gender === 'female';

  // Outfit colours (anime-vivid)
  const shirtA = '#5b8dee';
  const shirtB = '#2e5bcd';
  const pants  = '#212f45';
  const pantsSh= '#111c2d';
  const shoeA  = '#f5f5f5';
  const shoeB  = '#b0b9d0';
  const sockC  = '#ffffff';

  /* ── Mood ── */
  const isTired   = metrics.sleepHours > 0 && metrics.sleepHours < 6;
  const isPumped  = metrics.exerciseMins >= 60;
  const isHappy   = (metrics.exerciseMins >= 30 && metrics.sleepHours >= 7) || isPumped;

  // Eye openness (0.3 when tired, 1 normally)
  const eyeH = isTired ? 0.3 : 1.0;
  // Pupil colour (purple/violet for drama)
  const pupilColor = isPumped ? '#ff4444' : isFemale ? '#7c3aed' : '#1d4ed8';
  // Blush strength
  const blushA = isPumped ? 0.7 : isHappy ? 0.5 : 0.25;
  // Mouth shape
  const smileAmt = isHappy ? 14 : isTired ? -6 : 4;

  /* ── Unique IDs to avoid collision ── */
  const uid = 'av';

  return (
    <svg
      viewBox="0 0 320 560"
      width="100%"
      height="100%"
      style={{ overflow: 'hidden' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* -- Skin -- */}
        <linearGradient id={`${uid}skin`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={skin} />
          <stop offset="100%" stopColor={skinDark} />
        </linearGradient>
        {/* -- Shirt -- */}
        <linearGradient id={`${uid}shirt`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={shirtA} />
          <stop offset="100%" stopColor={shirtB} />
        </linearGradient>
        {/* -- Pants -- */}
        <linearGradient id={`${uid}pants`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pants} />
          <stop offset="100%" stopColor={pantsSh} />
        </linearGradient>
        {/* -- Hair -- */}
        <linearGradient id={`${uid}hair`} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="60%" stopColor={hair} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
        {/* -- Shoe -- */}
        <linearGradient id={`${uid}shoe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shoeA} />
          <stop offset="100%" stopColor={shoeB} />
        </linearGradient>
        {/* -- Aura glow -- */}
        <radialGradient id={`${uid}aura`} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={isPumped ? 'rgba(255,80,50,0.35)' : isHappy ? 'rgba(0,220,120,0.25)' : 'rgba(80,160,255,0.2)'} />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        {/* -- Eye clip -- */}
        <clipPath id={`${uid}eyeL`}>
          <ellipse cx="127" cy="152" rx="18" ry={18 * eyeH} />
        </clipPath>
        <clipPath id={`${uid}eyeR`}>
          <ellipse cx="193" cy="152" rx="18" ry={18 * eyeH} />
        </clipPath>
        {/* -- Drop shadow filter -- */}
        <filter id={`${uid}shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="rgba(0,0,0,0.5)" />
        </filter>
      </defs>

      {/* ── Background aura ── */}
      <ellipse cx="160" cy="320" rx="160" ry="260" fill={`url(#${uid}aura)`} />

      {/* ── Ground shadow ── */}
      <ellipse cx="160" cy="548" rx={68 * bodyW} ry="8" fill="rgba(0,0,0,0.3)" />

      {/* ══════════ SHOES (at bottom, integrated within viewBox) ══════════ */}
      {/* Left shoe */}
      <g>
        <ellipse cx={126 - bodyW * 5} cy="535" rx={26} ry="11" fill={shoeB} />
        <rect x={100 - bodyW * 5} y="522" width="52" height="16" rx="8" fill={`url(#${uid}shoe)`} />
        <rect x={100 - bodyW * 5} y="522" width="52" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
        {/* Sole line */}
        <rect x={100 - bodyW * 5} y="534" width="52" height="3" rx="1.5" fill={shoeB} />
      </g>
      {/* Right shoe */}
      <g>
        <ellipse cx={194 + bodyW * 5} cy="535" rx={26} ry="11" fill={shoeB} />
        <rect x={168 + bodyW * 5} y="522" width="52" height="16" rx="8" fill={`url(#${uid}shoe)`} />
        <rect x={168 + bodyW * 5} y="522" width="52" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
        <rect x={168 + bodyW * 5} y="534" width="52" height="3" rx="1.5" fill={shoeB} />
      </g>

      {/* ══════════ SOCKS ══════════ */}
      <rect x={109 - bodyW * 5} y="500" width="28" height="28" rx="6" fill={sockC} />
      <rect x={183 + bodyW * 5} y="500" width="28" height="28" rx="6" fill={sockC} />

      {/* ══════════ LEGS ══════════ */}
      {/* Left leg */}
      <path
        d={`M ${138 - bodyW * 12} 385 L ${120 - bodyW * 5} 510`}
        stroke={`url(#${uid}pants)`} strokeWidth={30 * bodyW} strokeLinecap="round" fill="none"
      />
      {/* Right leg */}
      <path
        d={`M ${182 + bodyW * 12} 385 L ${200 + bodyW * 5} 510`}
        stroke={`url(#${uid}pants)`} strokeWidth={30 * bodyW} strokeLinecap="round" fill="none"
      />
      {/* Crotch join */}
      <ellipse cx="160" cy="383" rx={42 * bodyW} ry="14" fill={pants} />

      {/* ══════════ SHORTS / WAISTBAND ══════════ */}
      <rect x={108 - bodyW * 18} y="332" width={104 * bodyW + 36} height="58" rx="12" fill={pants} />
      {/* Waistband highlight */}
      <rect x={108 - bodyW * 18} y="332" width={104 * bodyW + 36} height="12" rx="6" fill="rgba(255,255,255,0.1)" />
      {/* Belt loop hint */}
      <rect x="155" y="332" width="10" height="14" rx="3" fill="rgba(255,255,255,0.08)" />

      {/* ══════════ TORSO / SHIRT ══════════ */}
      {/* Main body */}
      <rect
        x={100 - bodyW * 20}
        y="220"
        width={120 * bodyW + 40}
        height="118"
        rx="18"
        fill={`url(#${uid}shirt)`}
      />
      {/* Collar V */}
      <path d={`M 140 224 L 160 254 L 180 224`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
      {/* Shirt highlight strip */}
      <rect x={108 - bodyW * 10} y="228" width={40 * bodyW} height="100" rx="12" fill="rgba(255,255,255,0.06)" />
      {/* Anime muscle cross-shadow */}
      {isPumped && (
        <>
          <path d={`M ${128-bodyW*15} 260 Q 160 280 ${192+bodyW*15} 260`} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="18" strokeLinecap="round" />
        </>
      )}
      {/* Shirt pocket (male only) */}
      {!isFemale && (
        <rect x={184 + bodyW * 2} y="248" width="24" height="20" rx="5" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      )}

      {/* ══════════ NECK ══════════ */}
      <rect x="148" y="182" width="24" height="44" rx="10" fill={`url(#${uid}skin)`} />
      {/* Neck shadow line */}
      <line x1="153" y1="184" x2="153" y2="222" stroke="rgba(0,0,0,0.07)" strokeWidth="5" strokeLinecap="round" />

      {/* ══════════ LEFT ARM (relaxed, gentle swing) ══════════ */}
      <path
        d={`M ${100 - bodyW * 20} 248 Q ${55 - bodyW * 5} 300 ${62} 390`}
        stroke={`url(#${uid}shirt)`} strokeWidth={26 * bodyW} strokeLinecap="round" fill="none"
      />
      {/* Left hand */}
      <circle cx="62" cy="393" r="15" fill={`url(#${uid}skin)`} />
      {/* Finger hint */}
      <ellipse cx="50" cy="388" rx="7" ry="5" fill={`url(#${uid}skin)`} />
      <ellipse cx="56" cy="382" rx="7" ry="5" fill={`url(#${uid}skin)`} />

      {/* ══════════ RIGHT ARM (WAVING — animated) ══════════ */}
      <g
        className="waving-arm"
        style={{ transformOrigin: `${220 + bodyW * 20}px 248px` }}
      >
        {/* Upper arm */}
        <path
          d={`M ${220 + bodyW * 20} 248 Q 270 190 288 108`}
          stroke={`url(#${uid}shirt)`} strokeWidth={26 * bodyW} strokeLinecap="round" fill="none"
        />
        {/* Hand */}
        <circle cx="288" cy="104" r="17" fill={`url(#${uid}skin)`} />
        {/* Fingers splayed (waving) */}
        <ellipse cx="275" cy="90"  rx="7" ry="5" transform="rotate(-20,275,90)"  fill={`url(#${uid}skin)`} />
        <ellipse cx="286" cy="86"  rx="7" ry="5" transform="rotate(-5,286,86)"   fill={`url(#${uid}skin)`} />
        <ellipse cx="297" cy="87"  rx="7" ry="5" transform="rotate(10,297,87)"   fill={`url(#${uid}skin)`} />
        <ellipse cx="305" cy="96"  rx="7" ry="5" transform="rotate(25,305,96)"   fill={`url(#${uid}skin)`} />
        {/* Thumb */}
        <ellipse cx="272" cy="102" rx="6" ry="8" transform="rotate(-40,272,102)" fill={`url(#${uid}skin)`} />
        {/* Knuckle highlights */}
        <ellipse cx="286" cy="87" rx="3" ry="2" fill="rgba(255,255,255,0.35)" transform="rotate(-5,286,87)" />
      </g>

      {/* ══════════ HEAD GROUP ══════════ */}
      <g filter={`url(#${uid}shadow)`}>

        {/* ── HAIR (back layer, rendered behind head) ── */}
        {isFemale ? (
          <>
            {/* Back long hair */}
            <path d={`M ${108} 92 Q 80 160 90 300 Q 100 360 108 380`}
              fill={hair} stroke={hairDark} strokeWidth="1" />
            <path d={`M ${212} 92 Q 240 160 230 300 Q 220 360 212 380`}
              fill={hair} stroke={hairDark} strokeWidth="1" />
            {/* Ponytail or flowing back */}
            <ellipse cx="160" cy="78" rx="58" ry="68" fill={`url(#${uid}hair)`} />
          </>
        ) : (
          /* Male spiky back hair */
          <>
            <path d={`M 108 80 Q 82 60 90 20 Q 110 -5 130 65`} fill={hair} />
            <path d={`M 212 80 Q 238 60 230 20 Q 210 -5 190 65`} fill={hair} />
            <path d={`M 148 62 Q 160 10 172 62`} fill={hair} />
          </>
        )}

        {/* ── HEAD SHAPE (anime = slightly narrow chin, wide cheeks) ── */}
        <ellipse cx="160" cy="108" rx={58 * bodyW} ry="60" fill={`url(#${uid}skin)`} />
        {/* Chin point (anime) */}
        <path d={`M ${130} 152 Q 160 180 ${190} 152`} fill={`url(#${uid}skin)`} />

        {/* ── EARS ── */}
        <ellipse cx={102 - Math.round(bodyW * 4)} cy="112" rx="11" ry="15" fill={skin} />
        <ellipse cx={102 - Math.round(bodyW * 4)} cy="112" rx="6"  ry="9"  fill={skinDark} opacity="0.3" />
        <ellipse cx={218 + Math.round(bodyW * 4)} cy="112" rx="11" ry="15" fill={skin} />
        <ellipse cx={218 + Math.round(bodyW * 4)} cy="112" rx="6"  ry="9"  fill={skinDark} opacity="0.3" />

        {/* ── HAIR (front layer, over head, under eyes) ── */}
        {isFemale ? (
          <>
            {/* Crown / top */}
            <path d={`M 105 75 Q 160 20 215 75 Q 200 100 160 95 Q 120 100 105 75`} fill={`url(#${uid}hair)`} />
            {/* Side bangs framing face */}
            <path d={`M 105 75 Q 100 120 108 168`} fill={hair} />
            <path d={`M 215 75 Q 220 120 212 168`} fill={hair} />
            {/* Center bang wisp */}
            <path d={`M 148 55 Q 155 80 152 98`} fill={hairDark} strokeWidth="0" />
            <path d={`M 172 55 Q 165 80 168 98`} fill={hairDark} strokeWidth="0" />
            {/* Hair highlight shine */}
            <path d={`M 136 35 Q 158 18 182 36`} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          /* Male spiky anime front hair */
          <>
            <path d={`M 106 76 Q 160 22 214 76 Q 205 98 160 94 Q 115 98 106 76`} fill={`url(#${uid}hair)`} />
            {/* Side spike left */}
            <path d={`M 106 76 Q 95 108 106 142`} fill={hair} />
            {/* Side spike right */}
            <path d={`M 214 76 Q 225 108 214 142`} fill={hair} />
            {/* Front spikes */}
            <path d={`M 138 56 L 128 28 L 148 58`} fill={hairDark} />
            <path d={`M 160 50 L 155 18 L 165 50`} fill={hairDark} />
            <path d={`M 182 56 L 192 28 L 172 58`} fill={hairDark} />
            {/* Hair highlight */}
            <path d={`M 138 32 Q 158 18 180 34`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {/* ── EYEBROWS (thick anime brows) ── */}
        <path
          d={`M 112 104 Q 127 ${isTired ? 108 : 97} 142 105`}
          fill="none" stroke={hairDark} strokeWidth="4.5" strokeLinecap="round"
        />
        <path
          d={`M 178 105 Q 193 ${isTired ? 108 : 97} 208 104`}
          fill="none" stroke={hairDark} strokeWidth="4.5" strokeLinecap="round"
        />

        {/* ── EYES (anime style: large, shaded iris) ── */}
        {/* Eye socket (dark outline) */}
        <ellipse cx="127" cy="130" rx="21" ry={21 * eyeH} fill="#1a1a2e" />
        <ellipse cx="193" cy="130" rx="21" ry={21 * eyeH} fill="#1a1a2e" />

        {/* Iris */}
        <ellipse cx="127" cy="132" rx="16" ry={17 * eyeH} fill={pupilColor} clipPath={`url(#${uid}eyeL)`} />
        <ellipse cx="193" cy="132" rx="16" ry={17 * eyeH} fill={pupilColor} clipPath={`url(#${uid}eyeR)`} />

        {/* Iris gradient overlay */}
        <ellipse cx="127" cy="136" rx="14" ry={14 * eyeH} fill="rgba(0,0,0,0.3)" clipPath={`url(#${uid}eyeL)`} />
        <ellipse cx="193" cy="136" rx="14" ry={14 * eyeH} fill="rgba(0,0,0,0.3)" clipPath={`url(#${uid}eyeR)`} />

        {/* Pupil */}
        <ellipse cx="128" cy="132" rx="7" ry={8 * eyeH} fill="#000820" clipPath={`url(#${uid}eyeL)`} />
        <ellipse cx="194" cy="132" rx="7" ry={8 * eyeH} fill="#000820" clipPath={`url(#${uid}eyeR)`} />

        {/* Large specular highlight (anime style) */}
        <ellipse cx="119" cy="122" rx="6" ry={5 * eyeH} fill="rgba(255,255,255,0.9)" clipPath={`url(#${uid}eyeL)`} />
        <ellipse cx="185" cy="122" rx="6" ry={5 * eyeH} fill="rgba(255,255,255,0.9)" clipPath={`url(#${uid}eyeR)`} />
        {/* Small secondary highlight */}
        <ellipse cx="133" cy="138" rx="3" ry={2.5 * eyeH} fill="rgba(255,255,255,0.5)" clipPath={`url(#${uid}eyeL)`} />
        <ellipse cx="199" cy="138" rx="3" ry={2.5 * eyeH} fill="rgba(255,255,255,0.5)" clipPath={`url(#${uid}eyeR)`} />

        {/* Upper eyelash line */}
        <path d={`M 106 ${130 - 21 * eyeH} Q 127 ${122 - 21*eyeH} 148 ${130 - 21 * eyeH}`}
          fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />
        <path d={`M 172 ${130 - 21 * eyeH} Q 193 ${122 - 21*eyeH} 214 ${130 - 21 * eyeH}`}
          fill="none" stroke="#111" strokeWidth="3.5" strokeLinecap="round" />

        {/* Lower lash line */}
        <path d={`M 108 ${130 + 21*eyeH} Q 127 ${134 + 21*eyeH} 146 ${130 + 21*eyeH}`}
          fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
        <path d={`M 174 ${130 + 21*eyeH} Q 193 ${134 + 21*eyeH} 212 ${130 + 21*eyeH}`}
          fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />

        {/* Tired eye-bag lines */}
        {isTired && (
          <>
            <path d="M 108 148 Q 127 156 146 148" fill="none" stroke="rgba(180,130,130,0.5)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 174 148 Q 193 156 212 148" fill="none" stroke="rgba(180,130,130,0.5)" strokeWidth="3" strokeLinecap="round" />
          </>
        )}

        {/* ── NOSE (small anime) ── */}
        <path d="M 160 138 L 156 156 Q 160 162 164 156 Z" fill={skinLine} opacity="0.25" />
        <path d="M 154 158 Q 160 164 166 158" fill="none" stroke={skinLine} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />

        {/* ── BLUSH CHEEKS ── */}
        <ellipse cx="122" cy="158" rx="19" ry="12"
          fill={isPumped ? 'rgba(255,80,60,0.55)' : 'rgba(255,160,140,0.45)'}
          opacity={blushA}
        />
        <ellipse cx="198" cy="158" rx="19" ry="12"
          fill={isPumped ? 'rgba(255,80,60,0.55)' : 'rgba(255,160,140,0.45)'}
          opacity={blushA}
        />

        {/* ── MOUTH ── */}
        <path
          d={`M 148 168 Q 160 ${168 + smileAmt} 172 168`}
          fill="none" stroke="#c0392b" strokeWidth="2.8" strokeLinecap="round"
        />
        {/* Teeth if happy */}
        {isHappy && (
          <path d={`M 150 168 Q 160 ${168 + smileAmt + 2} 170 168`} fill="white" stroke="none" />
        )}
        {/* Anime laugh lines if pumped */}
        {isPumped && (
          <>
            <path d="M 136 162 Q 130 168 133 176" fill="none" stroke={skinLine} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <path d="M 184 162 Q 190 168 187 176" fill="none" stroke={skinLine} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          </>
        )}

      </g>{/* end head group */}

    </svg>
  );
};

/* ══════════════════════════════════════════════════════════════
   AVATAR WRAPPER
══════════════════════════════════════════════════════════════ */
export const Avatar: React.FC = () => {
  const { avatarImageUrl, isGeneratingAvatar, avatarError, metrics, avatarStats, profile } = useStore();

  const isPumped = metrics.exerciseMins >= 60;
  const isHappy  = metrics.exerciseMins >= 30 && metrics.sleepHours >= 7;
  const auraColor = isPumped
    ? 'rgba(255,100,40,0.32)'
    : isHappy
    ? 'rgba(0,210,100,0.22)'
    : 'rgba(80,180,255,0.18)';

  // CSS Scaling based on physical body metrics
  const visualHeightPct = Math.max(65, Math.min(100, (profile.height / 190) * 100));
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  const widthScale = Math.max(0.85, Math.min(1.15, bmi / 22)); // Subtle width stretch/squish for extra realism

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', height: '100%', width: '100%',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: '360px', height: '360px',
        background: `radial-gradient(circle, ${auraColor} 0%, transparent 70%)`,
        borderRadius: '50%', zIndex: 0,
        transition: 'background 0.7s ease',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isGeneratingAvatar ? (
          <Spinner />
        ) : avatarImageUrl ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {avatarStats && (
              <>
                <div className="glass-panel fade-in" style={{ position: 'absolute', top: '15%', left: '0%', zIndex: 0, padding: '12px', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Arm Fat</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-color)' }}>{avatarStats.armFat}%</div>
                </div>
                <div className="glass-panel fade-in" style={{ position: 'absolute', bottom: '25%', left: '5%', zIndex: 0, padding: '12px', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Leg Fat</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-color)' }}>{avatarStats.legFat}%</div>
                </div>
                <div className="glass-panel fade-in" style={{ position: 'absolute', top: '25%', right: '0%', zIndex: 0, padding: '12px', minWidth: '100px', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Fat</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ff6b35' }}>{avatarStats.coreFat}%</div>
                </div>
                <div className="glass-panel fade-in" style={{ position: 'absolute', bottom: '35%', right: '0%', zIndex: 0, padding: '12px', minWidth: '100px', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Muscle Mass</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00ffaa' }}>{avatarStats.musclePercentage}%</div>
                </div>
              </>
            )}
            <img
              src={avatarImageUrl}
              alt="AI Anime Avatar"
              style={{
                height: `${visualHeightPct}%`,
                maxWidth: '100%',
                objectFit: 'contain',
                transform: `scaleX(${widthScale})`,
                transition: 'height 0.4s ease, transform 0.4s ease',
                animation: 'fadeIn 0.7s ease',
                filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.6))',
                zIndex: 1, position: 'relative'
              }}
            />
          </div>
        ) : (
          <div
            className="avatar-svg-wrap"
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <AnimeSVG />
          </div>
        )}
      </div>

      {/* Error toast */}
      {avatarError && (
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          background: 'rgba(180,0,0,0.18)',
          border: '1px solid rgba(200,0,0,0.45)',
          borderRadius: 12, padding: '8px 16px',
          fontSize: '0.78rem', color: '#ff7070',
          textAlign: 'center', zIndex: 2,
          maxHeight: '60px', overflow: 'hidden',
        }}>
          ⚠️ {avatarError.slice(0, 150)}
        </div>
      )}
    </div>
  );
};
