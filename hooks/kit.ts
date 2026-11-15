export type Mode = 'light' | 'dark' | 'both'

export type Mood = 'idle' | 'thinking' | 'building' | 'dizzy' | 'party'

export type Scene = {
  id: string
  title: string
  blurb: string
  mode: Mode
  build: (mood: Mood) => string
}

export type Eyes = 'open' | 'happy' | 'closed' | 'spiral' | 'wink' | 'wide'

export const INK = '#141413'
export const BODY = '#d77655'
export const SHADE = '#b65f40'

export function seeded(seed: number) {
  let a = seed
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const range = (min: number, max: number) => min + next() * (max - min)
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)] as T
  return { next, range, pick }
}

export function pixels(rows: readonly string[], colors: Record<string, string>, ox = 0, oy = 0) {
  // One path per colour: cells never overlap within a call, so the order of
  // colours doesn't matter, and a path is far shorter than a rect per run.
  const runs = new Map<string, string>()
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x] as string
      const fill = colors[ch]
      if (fill === undefined) {
        x++
        continue
      }
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      runs.set(fill, `${runs.get(fill) ?? ''}M${ox + x} ${oy + y}h${end - x}v1h-${end - x}z`)
      x = end
    }
  })
  let out = ''
  for (const [fill, d] of runs) out += `<path fill="${fill}" d="${d}"/>`
  return out
}

export function pixelPath(rows: readonly string[], ch = '#', ox = 0, oy = 0) {
  let d = ''
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] !== ch) {
        x++
        continue
      }
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      d += `M${ox + x} ${oy + y}h${end - x}v1h-${end - x}z`
      x = end
    }
  })
  return d
}

const EYES: Record<Eyes, readonly string[]> = {
  open: ['', '', '....E....E....'],
  wide: ['', '....E....E....', '....E....E....'],
  happy: ['', '....E....E....', '...E.E..E.E...'],
  closed: ['', '', '...EE....EE...'],
  wink: ['', '', '....E....EE...'],
  spiral: ['', '...EEE..EEE...', '...E.E..E.E...', '...EE...EE....'],
}

export type Wear = {
  back?: string
  front?: string
}

export type ClawdOptions = {
  x: number
  y: number
  s?: number
  flip?: boolean
  eyes?: Eyes
  body?: string
  shade?: string
  wear?: readonly Wear[]
  anim?: string
  inner?: string
  walk?: boolean
  blink?: boolean
  delay?: number
  speed?: number
}

const LEGS_A = 'M2 7h1v2h-1zM9 7h1v2h-1z'
const LEGS_B = 'M4 7h1v2h-1zM11 7h1v2h-1z'
const BODY_D = 'M2 0h10v3h2v2h-2v2h-10v-2h-2v-2h2z'
const SHADE_D = 'M2 0h1v7h-1v-2h-2v-2h2z'
const EYE_D = Object.fromEntries((Object.keys(EYES) as Eyes[]).map(k => [k, pixelPath(EYES[k], 'E')])) as Record<Eyes, string>

export function clawd(o: ClawdOptions) {
  const body = o.body ?? BODY
  const shade = o.shade ?? SHADE
  const s = o.s ?? 4
  const eyes = o.eyes ?? 'open'
  const delay = o.delay ?? 0
  const speed = o.speed ?? 1
  const timing = `animation-delay:-${delay.toFixed(2)}s;animation-duration:${(speed).toFixed(2)}s`
  const wear = o.wear ?? []
  const back = wear.map(w => w.back ?? '').join('')
  const front = wear.map(w => w.front ?? '').join('')
  const blink = o.blink ?? (eyes === 'open' || eyes === 'wide')
  const legClass = o.walk ? ' walking' : ''
  const flip = o.flip ? ` transform="translate(14 0) scale(-1 1)"` : ''
  return `<g transform="translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) scale(${s})"><g class="${o.anim ?? ''}" style="${o.anim ? timing : ''}"><g class="${o.inner ?? ''}" style="${o.inner ? timing : ''}"><g transform="translate(0 1)"><g${flip}>${back}<g class="lg-a${legClass}" style="animation-delay:-${(delay % 1).toFixed(2)}s"><path d="${LEGS_A}" fill="${body}"/></g><g class="lg-b${legClass}" style="animation-delay:-${(delay % 1).toFixed(2)}s"><path d="${LEGS_B}" fill="${body}"/></g><path d="${BODY_D}" fill="${body}"/><path d="${SHADE_D}" fill="${shade}"/><g class="${blink ? 'eyes' : ''}" style="animation-delay:-${(delay * 1.7).toFixed(2)}s"><path d="${EYE_D[eyes]}" fill="${INK}"/></g>${front}</g></g></g></g></g>`
}

const W = (front: string, back = ''): Wear => ({ front, back })

export const wear = {
  headphones: (band = '#2a4f86') =>
    W(pixels(['...########...', '..#........#..', '.#..........#.', '##..........##', '##..........##'], { '#': band }, 0, -2)),
  partyHat: (a = '#e84f6b', b = '#ffd166') =>
    W(pixels(['...b...', '..aaa..', '..aba..', '.aaaaa.', '.ababa.'], { a, b }, 4, -5)),
  beanie: (a = '#3d7cc9', b = '#f4efe6') =>
    W(pixels(['.....b.....', '....bbb....', '..aaaaaaa..', '.aaaaaaaaa.', '.bbbbbbbbb.'], { a, b }, 2, -4)),
  hardHat: (a = '#f2b632', b = '#c98c12') =>
    W(pixels(['....aaaa....', '...aaaaaa...', '..aaaabaaa..', 'bbbbbbbbbbbb'], { a, b }, 1, -4)),
  chefHat: (a = '#fbf8f2', b = '#ded6c8') => W(pixels(['.aa.aa.', 'aaaaaaa', 'aaaaaaa', '.bbbbb.'], { a, b }, 4, -4)),
  bowlerHat: (a = '#141413', b = '#5c3a17') =>
    W(pixels(['...aaaaaa...', '..aaaaaaaa..', '..bbbbbbbb..', 'aaaaaaaaaaaa'], { a, b }, 1, -4)),
  crown: (a = '#f2c14e') => W(pixels(['a.a.a', 'aaaaa', 'aaaaa'], { a }, 5, -3)),
  sunglasses: (a = '#141413') => W(pixels(['..aaaaaaaaaa..', '...aa....aa...'], { a }, 0, 2)),
  scarf: (a = '#d64545', b = '#f4efe6') => W(pixels(['..abababab..', '.........ab.', '.........ba.'], { a, b }, 1, 5)),
  snorkel: (a = '#3aa0c8', b = '#a7e3f2') =>
    W(pixels(['.............a', '...bbbbbbbbb.a', '...bbbbbbbbbaa'], { a, b }, 0, 1)),
  heart: (a = '#e2504f') => W(pixels(['.a.a.', 'aaaaa', 'aaaaa', '.aaa.', '..a..'], { a }, -2, -7)),
  bulb: (a = '#ffd36e', b = '#9b9b95', c = '#fff3c4') =>
    W(pixels(['.aaa.', 'acaca', 'aaaaa', '.aaa.', '.bbb.', '..b..'], { a, b, c }, 5, -8)),
  mug: (a = '#5d7184', b = '#2c1e14', steam = '#b8b2a7') =>
    W(`<g class="steam">${pixels(['.s.s', 's.s.'], { s: steam }, 15, 0)}</g>${pixels(['aaaa', 'abba', 'aaaaa', 'aaaa.', 'aaaa.'], { a, b }, 14, 2)}`),
  sparkler: (stick = '#141413', a = '#ffd36e', b = '#fff6d6') =>
    W(`${pixels(['ssss'], { s: stick }, 14, 3)}<g class="sparks">${pixels(['.a.b.', 'b.a.a', '.aba.', 'a.b.b', '.b.a.'], { a, b }, 17, 1)}</g>`),
  magnifier: (a = '#3b3a8f', g = '#cfe3ff') =>
    W(pixels(['.aaa.', 'aggga', 'aggga', 'aggga', '.aaa.', '....a', '.....a'], { a, g }, 9, 1)),
  stick: (a = '#7a4b2a', m = '#fbf6ee', t = '#e7b071') => W(pixels(['aaaaaaa', '.......mm', '.......tm'], { a, m, t }, 13, 3)),
  wateringCan: (a = '#5b9fd6', b = '#3d7fb8') =>
    W(pixels(['...aaa...', '..a...a..', 'bbbbbbb.a', 'bbbbbbbaa', 'bbbbbbb..'], { a, b }, 13, 1)),
  spade: (a = '#7a4b2a', b = '#a8b0b8') => W(pixels(['a', 'a', 'a', 'b', 'bb'], { a, b }, 14, 1)),
  bucket: (a = '#e84f6b', b = '#ffd166') => W(pixels(['.b..b.', 'aaaaaa', 'aaaaaa', '.aaaa.'], { a, b }, 14, 3)),
  laptop: (a = '#5a5a58', b = '#9fd3ff') => W(pixels(['aaaaaa', 'abbbba', 'abbbba', 'aaaaaa', 'aaaaaaaa'], { a, b }, 3, 4)),
  book: (a = '#4f7d4a', b = '#f4efe6') => W(pixels(['aaaaaa', 'abbbba', 'abbbba'], { a, b }, 4, 4)),
  zzz: (a = '#ffffff') => W(`<g class="zzz">${pixels(['aaa', '.a.', 'aaa'], { a }, 13, -6)}${pixels(['aa', 'aa'], { a }, 17, -9)}</g>`),
  note: (a = '#141413') => W(`<g class="notes">${pixels(['.aa', '.a.', 'aa.'], { a }, 14, -6)}</g>`),
  flower: (a = '#ff8fb8', b = '#ffd166', g = '#4f9d4a') => W(pixels(['.a.', 'aba', '.a.', '.g.', '.g.'], { a, b, g }, 14, 0)),
  umbrella: (a = '#e84f6b', b = '#141413') =>
    W(pixels(['....aaaaa....', '..aaaaaaaaa..', '.aaaaaaaaaaa.', 'a.a..a..a..a.', '......b......', '......b......', '......b......'], { a, b }, 7, -7)),
}

export const KIT_CSS = `
  .walking { animation: step 0.5s steps(1) infinite }
  .lg-b.walking { animation-name: step-b }
  @keyframes step { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-1px) } }
  @keyframes step-b { 0%, 100% { transform: translateY(-1px) } 50% { transform: translateY(0) } }

  .eyes { transform-box: fill-box; transform-origin: center; animation: blink 5s steps(1) infinite }
  @keyframes blink { 0%, 95%, 100% { transform: scaleY(1) } 96%, 98% { transform: scaleY(0.2) } }

  .hop { animation: hop 1.6s ease-in-out infinite }
  @keyframes hop { 0%, 55%, 100% { transform: translateY(0) } 70% { transform: translateY(-5px) } 80% { transform: translateY(-5px) } 90% { transform: translateY(0) } }

  .bounce { animation: bounce 0.6s ease-in-out infinite alternate }
  @keyframes bounce { from { transform: translateY(0) } to { transform: translateY(-2px) } }

  .bob { animation: bob 2.4s ease-in-out infinite alternate }
  @keyframes bob { from { transform: translateY(0) } to { transform: translateY(-1px) } }

  .nod { animation: nod 0.9s ease-in-out infinite }
  @keyframes nod { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(1px) } }

  .wiggle { transform-box: fill-box; transform-origin: 50% 100%; animation: wiggle 1.2s ease-in-out infinite alternate }
  @keyframes wiggle { from { transform: rotate(-5deg) } to { transform: rotate(5deg) } }

  .spin { transform-box: fill-box; transform-origin: center; animation: spin 2s linear infinite }
  @keyframes spin { to { transform: rotate(360deg) } }

  .pace-s, .pace-m, .pace-l { animation-timing-function: linear; animation-iteration-count: infinite }
  .pace-s { animation-name: pace-s } .pace-m { animation-name: pace-m } .pace-l { animation-name: pace-l }
  @keyframes pace-s { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(16px) } }
  @keyframes pace-m { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(36px) } }
  @keyframes pace-l { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(70px) } }
  .turn { transform-box: fill-box; transform-origin: center; animation: turn 1s steps(1) infinite }
  @keyframes turn { 0%, 49.9% { transform: scaleX(1) } 50%, 100% { transform: scaleX(-1) } }

  .steam { animation: rise 1.6s ease-out infinite }
  @keyframes rise { 0% { transform: translateY(0); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(-4px); opacity: 0 } }
  .sparks { transform-box: fill-box; transform-origin: center; animation: sparks 0.3s steps(2) infinite }
  @keyframes sparks { 0% { transform: rotate(0) scale(1) } 100% { transform: rotate(90deg) scale(1.15) } }
  .zzz { animation: zzz 3s ease-in-out infinite }
  @keyframes zzz { 0% { transform: translate(0, 0); opacity: 0 } 25% { opacity: 1 } 100% { transform: translate(3px, -5px); opacity: 0 } }
  .notes { animation: notes 2.2s ease-out infinite }
  @keyframes notes { 0% { transform: translate(0, 0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translate(4px, -7px); opacity: 0 } }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-play-state: paused !important }
  }
`


export function svg(viewW: number, viewH: number, css: string, body: string, defs = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" font-family="monospace" color="#888"><style>${KIT_CSS}${css}</style>${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`
}
