import { clawd, svg, wear, type ClawdOptions } from './kit.ts'

type Look = { sky: string; ground: string; horizon: number; extras: string; clawds: string }

const at = (x: number, y: number, extra: Omit<ClawdOptions, 'x' | 'y'> = {}) => clawd({ ...extra, x, y, s: 2.4, delay: (x * 7) % 5 })

const LOOKS: Record<string, Look> = {
  off: {
    sky: '#efeae2',
    ground: '#efeae2',
    horizon: 100,
    extras: '',
    clawds: '',
  },
  cafe: {
    sky: '#f6eedd',
    ground: '#e9d6b6',
    horizon: 64,
    extras: '<rect x="8" y="12" width="34" height="26" fill="#bfe0ef"/><rect x="8" y="12" width="34" height="5" fill="#6aa58a"/><rect x="112" y="10" width="40" height="26" fill="#3b4a40"/><rect x="104" y="58" width="56" height="8" fill="#9ccfbd"/>',
    clawds: at(12, 64, { wear: [wear.mug()], anim: 'bob', speed: 2.4 }) + at(118, 40, { wear: [wear.chefHat()], anim: 'nod', speed: 0.8 }) + at(120, 74, { wear: [wear.headphones()], anim: 'nod', speed: 0.9 }),
  },
  beach: {
    sky: '#d3eaf3',
    ground: '#f4dfb0',
    horizon: 62,
    extras: '<rect x="0" y="48" width="160" height="14" fill="#69bacb"/><rect x="136" y="8" width="12" height="12" fill="#ffd166"/><rect x="104" y="40" width="30" height="5" fill="#e84f6b"/><rect x="118" y="45" width="2" height="22" fill="#7a4b2a"/>',
    clawds: at(10, 70, { anim: 'pace-s', walk: true, speed: 3 }) + at(36, 76, { wear: [wear.bucket()], anim: 'nod', speed: 1 }) + at(124, 72, { wear: [wear.sunglasses()], anim: 'bob', speed: 2 }),
  },
  garden: {
    sky: '#d6ebf5',
    ground: '#9fd18a',
    horizon: 60,
    extras: '<rect x="6" y="30" width="26" height="30" fill="#7fb39a"/><rect x="4" y="24" width="30" height="8" fill="#c85b4a"/><rect x="132" y="22" width="22" height="20" fill="#5aa64a"/><rect x="141" y="42" width="4" height="18" fill="#7a4b2a"/><rect x="136" y="8" width="10" height="10" fill="#ffd166"/>',
    clawds: at(10, 66, { wear: [wear.wateringCan()], anim: 'nod', speed: 1.2 }) + at(112, 70, { wear: [wear.heart()], anim: 'hop', speed: 1.6 }) + at(36, 76, { wear: [wear.flower()], anim: 'bob', speed: 2 }),
  },
  snow: {
    sky: '#121a3a',
    ground: '#c6d2ea',
    horizon: 62,
    extras: '<rect x="134" y="8" width="12" height="12" fill="#f4efd9"/><rect x="0" y="54" width="44" height="8" fill="#c6d2ea"/><rect x="118" y="44" width="30" height="18" fill="#6b4630"/><rect x="114" y="38" width="38" height="7" fill="#eef2fb"/><rect x="128" y="50" width="8" height="6" fill="#ffd36e"/>',
    clawds: at(10, 70, { wear: [wear.beanie(), wear.scarf('#3d7cc9')], anim: 'bob', speed: 2 }) + at(36, 44, { wear: [wear.beanie('#4f9d4a')], anim: 'hop', speed: 1.4 }) + at(120, 76, { wear: [wear.beanie('#8a5cc7')], anim: 'pace-s', walk: true, speed: 3 }),
  },
  campfire: {
    sky: '#0b1027',
    ground: '#1c2a1f',
    horizon: 66,
    extras: '<rect x="128" y="10" width="12" height="12" fill="#f1ead2"/><rect x="26" y="70" width="12" height="6" fill="#5c3a22"/><rect x="28" y="62" width="8" height="8" fill="#ff9a3c"/><rect x="30" y="58" width="4" height="5" fill="#ffd36e"/><rect x="112" y="56" width="26" height="14" fill="#3a8fa3"/>',
    clawds: at(4, 68, { wear: [wear.stick()], anim: 'nod', speed: 1.2 }) + at(42, 66, { wear: [wear.sparkler()], anim: 'bounce', speed: 0.6 }) + at(118, 76, { wear: [wear.zzz('#9a948b')], eyes: 'closed', anim: 'bob', speed: 3 }),
  },
}

// A tile is drawn 112x60px, so 160 units are 112px and the scene's top and
// bottom 7 units are trimmed. The radius and ring are drawn on that 160x86 window,
// so the corners stay round: a radius of 11 is about 8px, a stroke of 4 about 1.4px.
const RADIUS = 11
// A still tile: its Clawds hold their pose; only the picked tile moves.
const STILL = '*{animation-play-state:paused!important}'
const STROKE = '#d97757'

// The highlight is drawn inside the picture, so a picked tile keeps its size and place.
export function thumb(id: string, isOn = false) {
  const look = LOOKS[id]
  if (look === undefined) return undefined
  const scene = `<rect width="160" height="100" fill="${look.sky}"/><rect y="${look.horizon}" width="160" height="${100 - look.horizon}" fill="${look.ground}"/>${look.extras}${look.clawds}`
  // Inset by half the stroke so the clip to the tile's edge doesn't cut the ring in half.
  // 2.86 units is 2px at the tile's 112px width.
  const ring = isOn ? `<rect x="1.43" y="8.43" width="157.14" height="83.14" rx="${RADIUS - 1.43}" fill="none" stroke="${STROKE}" stroke-width="2.86"/>` : ''
  return svg(160, 100, isOn ? '' : STILL, `<g clip-path="url(#tile)">${scene}${ring}</g>`, `<clipPath id="tile"><rect y="7" width="160" height="86" rx="${RADIUS}"/></clipPath>`)
}
