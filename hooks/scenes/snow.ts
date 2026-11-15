import { clawd as c, pixels, seeded, svg, wear, type Scene, type Wear } from '../kit.ts'

const SNOW = '#e6edfb'
const MID = '#c3d0ec'
const SHADE = '#a6b6dd'
const WARM = '#ffcf6b'
const CREAM = '#f4efe6'
const BALL = '#f4f8ff'
const HATS = ['#3d7cc9', '#4f9d4a', '#e8b33a', '#8a5cc7', '#2bb3a3', '#e84f6b'] as const
const SKY = ['#0a1029', '#0d1535', '#111b42', '#16234f', '#1b2b5d'] as const
const BANDS = [0, 180, 330, 450, 540, 1000] as const

const hat = (i: number): Wear[] => [wear.beanie(HATS[i % 6], CREAM), wear.scarf(HATS[(i + 3) % 6], CREAM)]
const at = (x: number, y: number, body: string, s = 1) => `<g transform="translate(${f1(x)} ${f1(y)})${s === 1 ? '' : ` scale(${s})`}">${body}</g>`
const anim = (cls: string, body: string, style = '') => `<g class="${cls}"${style ? ` style="${style}"` : ''}>${body}</g>`
const f1 = (n: number) => +n.toFixed(1)
const kf = (name: string, frames: [number, string][]) => `@keyframes ${name}{${frames.map(([p, t]) => `${f1(p)}%{${t}}`).join('')}}`
const tr = (x: number, y: number) => `transform:translate(${f1(x)}px,${f1(y)}px)`

function disc(r: number, ry = r) {
  return Array.from({ length: 2 * ry }, (_, j) => {
    const dy = (j - ry + 0.5) / ry
    const half = Math.round(r * Math.sqrt(Math.max(0, 1 - dy * dy)))
    return '.'.repeat(r - half) + '#'.repeat(2 * half)
  })
}

function ridge(f: (x: number) => number, x0: number, x1: number, q: number, fill: string) {
  let d = `M${x0} 1000`
  for (let x = x0; x < x1; x += 16) d += `V${Math.round(f(x) / q) * q}H${x + 16}`
  return `<path d="${d}V1000Z" fill="${fill}"/>`
}

const layer = (f: (x: number) => number, x0: number, x1: number, cap: string, fill: string) =>
  ridge(f, x0, x1, 8, cap) + ridge(x => f(x) + 8, x0, x1, 8, fill)

function arc(name: string, x0: number, y0: number, x1: number, y1: number, h: number, p0: number, p1: number) {
  const frames: [number, string][] = [[0, `${tr(x0, y0)};opacity:0`], [p0 - 0.1, `${tr(x0, y0)};opacity:0`]]
  for (let i = 0; i <= 8; i++) {
    const t = i / 8
    frames.push([p0 + (p1 - p0) * t, `${tr(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t - 4 * h * t * (1 - t))};opacity:1`])
  }
  frames.push([p1 + 0.1, `${tr(x1, y1)};opacity:0`], [100, `${tr(x1, y1)};opacity:0`])
  return kf(name, frames)
}

const loop = (name: string, r: number, h: number) =>
  kf(name, Array.from({ length: 9 }, (_, i): [number, string] => [i * 12.5, tr(-r * Math.cos((i / 4) * Math.PI), h * Math.sin((i / 4) * Math.PI))]))

const PINE = ['.....s.....', '....sgs....', '...sgggs...', '...ggGGG...', '..ssgggss..', '..gggGGGG..', '.ggggGGGGG.', '.sssgggsss.', '.gggggGGGG.', 'ggggggGGGGG', 'ssgsgsgsGss', 'gggggggGGGG', '....ttt....', '....ttt....']
const CABIN = [
  '..................ss.....', '...........sss....kk.....', '.........sssssss..kk.....', '.......sssssssssss.kk....', '.....sssssssssssssss.....',
  '...sssssssssssssssssss...', '.sssssssssssssssssssssss.', '.rrrrrrrrrrrrrrrrrrrrrrr.', '..LLLLLLLLLLLLLLLLLLLLL..', '..lllDDDDllllllllllllll..',
  '..LLLDDDDLLLfffffffLLLL..', '..lllDDDDlllfwwfwwfllll..', '..LLLDDyDLLLfwwfwwfLLLL..', '..lllDDDDlllfffffffllll..', '..LLLDDDDLLLfwwfwwfLLLL..',
  '..lllDDDDlllfwwfwwfllll..', '..LLLDDDDLLLfffffffLLLL..', '..lllDDDDllllllllllllll..', 'sssssssssssssssssssssssss',
]
const FLAKE = ['...#...', '.#.#.#.', '..###..', '#######', '..###..', '.#.#.#.', '...#...']
const PUFF = ['.##.', '####', '.##.']
const FORT = ['aa.aa.aa.aa', 'aaaaaaaaaaa', 'bbbbbbbbbbb', 'aaabaaaabaa', 'aaabaaaabaa']

const blades: Wear = { front: pixels(['.bbbbb..bbbbb.'], { b: '#dfe6f2' }, 0, 10) }
const sticks: Wear = { front: pixels(['b.b.', '.b..', '..b.', '...b'], { b: '#6b4029' }, -4, 0) + pixels(['.b.b', '..b.', '.b..', 'b...'], { b: '#6b4029' }, 14, 0) }
const sled: Wear = { front: pixels(['...............b', 'wwwwwwwwwwwwwwwb', '.b..b.....b..b..', 'bbbbbbbbbbbbbbb.'], { w: '#2bb3a3', b: '#2b3450' }, 0, 8) }
const towSled: Wear = { front: pixels(['..r', '.r.', 'r..'], { r: '#e9dfc9' }, -3, 4) + pixels(['....ww', '..ww..', 'ww....'], { w: '#e8b33a' }, -9, 7) }
const tail = (dy: number, delay: string) => `<g class="flap" style="animation-delay:${delay}">${pixels(['abab'], { a: '#3d7cc9', b: CREAM }, -3, 5)}${pixels(['ab'], { a: '#3d7cc9', b: CREAM }, -5, 5 + dy)}</g>`
const ball = (x: number, y: number) => at(x, y, pixels(disc(2), { '#': BALL }) + pixels(['', '', '...#', '.##'], { '#': SHADE }), 3)
const splat = (cls: string, x: number, y: number) => anim(cls, at(x, y, pixels(['#..#..#', '.#.#.#.', '..###..', '###.###', '..###..', '.#.#.#.', '#..#..#'], { '#': BALL }), 3))
const fort = (x: number, y: number) => at(x, y, pixels(FORT, { a: SNOW, b: SHADE }), 7)

const CSS = `
  .tw { animation: tw 3s steps(1) infinite } @keyframes tw { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
  .sway { animation: sway 6s ease-in-out infinite alternate } @keyframes sway { from { transform: translateX(-12px) } to { transform: translateX(12px) } }
  .flap { animation: flap .3s steps(1) infinite } @keyframes flap { 0% { opacity: 1 } 50% { opacity: 0 } }
  .squish { transform-box: fill-box; transform-origin: 50% 100%; animation: squish .8s linear infinite } @keyframes squish { 0%, 60% { transform: none } 70%, 90% { transform: scale(1.03, .96) } }
  .patf { animation: patf .8s linear infinite } @keyframes patf { 0%, 60% { transform: none } 70%, 90% { transform: translateX(1px) } }
  .patb { animation: patb .8s linear infinite } @keyframes patb { 0%, 60% { transform: none } 70%, 90% { transform: translateX(-1px) } }
  .pop { animation: pop .8s steps(1) infinite } @keyframes pop { 0%, 65% { opacity: 0 } 70%, 92% { opacity: 1 } }
  .glow { animation: glow 2.4s steps(3) infinite alternate } @keyframes glow { from { opacity: .1 } to { opacity: .2 } }
  .smoke { transform-box: fill-box; transform-origin: center; animation: smoke 4.5s steps(9) infinite } @keyframes smoke { 0% { transform: translate(0, 0) scale(.6); opacity: 0 } 20% { opacity: .7 } 100% { transform: translate(26px, -90px) scale(1.5); opacity: 0 } }
  .peek { animation: peek 7s ease-in-out infinite } @keyframes peek { 0%, 30%, 85%, 100% { transform: translateY(8px) } 40%, 75% { transform: translateY(0) } }
  .push { animation: push 6s steps(12) infinite } @keyframes push { 0% { transform: translateX(0); opacity: 0 } 6% { opacity: 1 } 88% { transform: translateX(4px); opacity: 1 } 96%, 100% { transform: translateX(4px); opacity: 0 } }
  .roll { transform-box: fill-box; transform-origin: center; animation: spin 1s steps(4) infinite }
  .shoot { animation: shoot 11s ease-out infinite } @keyframes shoot { 0%, 60% { transform: translate(0, 0); opacity: 0 } 61% { opacity: 1 } 66%, 100% { transform: translate(-220px, 110px); opacity: 0 } }
  .arms { animation: flap 1s steps(1) infinite }
  .toss { animation: toss 1.6s steps(6) infinite } @keyframes toss { 0%, 40% { transform: translate(0, 0); opacity: 0 } 50% { opacity: 1 } 100% { transform: translate(30px, -26px); opacity: 0 } }
  .sledrun { animation: sledrun 7s linear infinite } @keyframes sledrun { 0% { ${tr(0, 0)}; opacity: 0 } 4% { opacity: 1 } 12% { ${tr(0, 0)}; animation-timing-function: ease-in } 52% { ${tr(200, 150)}; opacity: 1 } 55%, 100% { ${tr(206, 155)}; opacity: 0 } }
  .puff, .s1, .s2 { transform-box: fill-box; transform-origin: center }
  .puff { animation: puff 7s ease-out infinite } @keyframes puff { 0%, 51% { transform: scale(.3); opacity: 0 } 54% { transform: scale(1); opacity: 1 } 66%, 100% { transform: scale(1.4); opacity: 0 } }
  .trudge { animation: trudge 18s linear infinite } @keyframes trudge { 0% { ${tr(0, 0)}; opacity: 0 } 5% { opacity: 1 } 92% { opacity: 1 } 100% { ${tr(-200, -150)}; opacity: 0 } }
  .fa { animation: fa 6s ease-out infinite } @keyframes fa { 0%, 4% { transform: none } 7%, 11% { transform: translateY(-8px) } 15%, 100% { transform: none } }
  .fan { animation: fan 6s steps(1) infinite } @keyframes fan { 0%, 69.9% { opacity: 1 } 70%, 92.9% { opacity: 0 } 93%, 100% { opacity: 1 } }
  .fad { animation: fad 6s steps(1) infinite } @keyframes fad { 0%, 69.9% { opacity: 0 } 70%, 92.9% { opacity: 1 } 93%, 100% { opacity: 0 } }
  .fb { animation: fb 6s ease-in-out infinite } @keyframes fb { 0%, 16% { transform: none } 20%, 38% { transform: translateY(16px) } 42% { transform: none } 45%, 49% { transform: translateY(-8px) } 53%, 100% { transform: none } }
  .b1 { animation: b1 6s linear infinite } .b2 { animation: b2 6s linear infinite }
  .s1 { animation: s1 6s ease-out infinite } @keyframes s1 { 0%, 29.9% { transform: scale(.4); opacity: 0 } 30% { transform: scale(1); opacity: 1 } 40% { opacity: 1 } 45%, 100% { transform: scale(1.2); opacity: 0 } }
  .s2 { animation: s2 6s ease-out infinite } @keyframes s2 { 0%, 69.9% { transform: scale(.4); opacity: 0 } 70% { transform: scale(1); opacity: 1 } 80% { opacity: 1 } 85%, 100% { transform: scale(1.2); opacity: 0 } }
`

function build() {
  const r = seeded(2026)
  const css: string[] = [CSS, arc('b1', 114, 902, 276, 918, 70, 10, 30), arc('b2', 290, 902, 76, 900, 80, 50, 70)]

  const sky = SKY.map((col, i) => `<rect y="${BANDS[i]}" width="1600" height="${(BANDS[i + 1] ?? 1000) - (BANDS[i] ?? 0)}" fill="${col}"/>`).join('')
    + SKY.slice(1).map((_, i) => `<rect y="${(BANDS[i + 1] ?? 0) - 8}" width="1600" height="8" fill="url(#d${i})"/>`).join('')
  let stars = ''
  for (let i = 0; i < 150; i++) {
    const x = Math.round(r.range(0, 400)) * 4
    const y = Math.round(r.range(4, 140)) * 4
    const fill = r.pick(['#dfe6ff', '#a9b6e8', '#fff3c4', '#7f8fcf'])
    const big = r.next() < 0.14
    const twinkle = r.next() < 0.35
    if (x > 1240 && x < 1530 && y < 250) continue
    if (x > 408 && x < 1180) continue
    const star = at(x, y, big ? pixels(['.#.', '###', '.#.'], { '#': fill }) : `<rect width="1" height="1" fill="${fill}"/>`, 4)
    stars += twinkle ? anim('tw', star, `animation-delay:-${r.range(0, 3).toFixed(2)}s`) : star
  }

  const moon = at(1288, 16, pixels(disc(13), { '#': '#0f1838' }), 8) + at(1312, 40, pixels(disc(10), { '#': '#142045' }), 8)
    + at(1336, 64, pixels(disc(7), { '#': '#f6efd2' }) + pixels(['', '', '.........cc', '...cc....cc', '...cc', '', '.......ccc', '.......ccc', '..c', '.....cc', '..........c'], { c: '#e2d8b4' }), 8)

  const flakes = (id: string, w: number, h: number, n: number, shape: readonly string[], s: number, fill: string) => {
    css.push(`@keyframes fall${id} { to { transform: translateY(${h}px) } }`)
    let out = ''
    for (let i = 0; i < n; i++) out += at(Math.round(r.range(10, w - 30)), Math.round(((i + r.range(0.1, 0.7)) * (h - 30)) / n), pixels(shape, { '#': fill }), s)
    return `<pattern id="f${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${out}</pattern>`
  }
  const snowLayer = (id: string, h: number, dur: number) =>
    anim('sway', anim('', [-40, 1192].map(x => `<rect y="-${h}" x="${x}" width="448" height="${1000 + h}" fill="url(#f${id})"/>`).join(''), `animation:fall${id} ${dur}s linear infinite`), `animation-duration:${dur * 0.6}s`)
  const defs = SKY.slice(1).map((col, i) => `<pattern id="d${i}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${col}"/><rect x="4" y="4" width="4" height="4" fill="${col}"/></pattern>`).join('')
    + flakes('a', 420, 300, 9, ['#'], 4, '#9fb0dc') + flakes('b', 560, 380, 6, ['.#.', '###', '.#.'], 4, '#dce5f8') + flakes('c', 820, 520, 4, FLAKE, 3, '#f4f7ff')
    + `<g id="pine">${pixels(PINE, { s: SNOW, g: '#1f4a48', G: '#173836', t: '#4a2e1e' })}</g><g id="pinef">${pixels(PINE, { s: '#5d72b0', g: '#1d2b5c', G: '#1d2b5c', t: '#1d2b5c' })}</g>`
  const pine = (x: number, y: number, s: number, far = false) => `<use href="#pine${far ? 'f' : ''}" transform="translate(${f1(x)} ${f1(y)}) scale(${s})"/>`

  const farF = (x: number) => 640 + 30 * Math.sin(x / 140) + 18 * Math.sin(x / 57 + 1)
  const midF = (x: number) => 720 + 24 * Math.sin(x / 190 + 2) + 12 * Math.sin(x / 70)
  const lantern: Wear = { front: anim('glow', pixels(['###', '###', '###'], { '#': WARM }, 14, 1), 'opacity:.6') + pixels(['k', 'w'], { k: '#2b3450', w: WARM }, 15, 2) }
  const PEAKS = [[80, 368], [336, 464], [-208, 336], [1248, 480], [1488, 384], [1808, 336]] as const
  const peakF = (x: number) => Math.min(...PEAKS.map(([px, py]) => py + Math.abs(x - px)))
  const hills = ridge(peakF, -480, 2080, 16, '#24336a') + PEAKS.map(([px, py]) => at(px - 32, py, pixels(['..#', '.###', '#####'], { '#': '#7186c0' }), 16)).join('') + layer(farF, -480, 2080, '#4b62a3', '#2e4079')
    + [60, 150, 230, 1220, 1290, 1420, 1500].map((x, i) => pine(x, farF(x) - 14 * (3 + (i % 2)) + 10, 3 + (i % 2), true)).join('')
    + c({ x: 372, y: farF(386) - 14, s: 2, eyes: 'happy', anim: 'bob', speed: 3, wear: [wear.beanie('#e8b33a', CREAM), lantern] })
    + layer(midF, -480, 2080, '#8ea2d6', '#5f76b4')
  let ground = layer(x => 788 + 6 * Math.sin(x / 90), -480, 2080, SNOW, MID)
  for (let i = 0; i < 40; i++) {
    const x = Math.round(r.range(0, 200)) * 8
    const y = Math.round(r.range(102, 123)) * 8
    const w = r.pick([16, 24, 32])
    if (x + w > 420 && x < 1180) continue
    ground += `<rect x="${x}" y="${y}" width="${w}" height="8" fill="${SHADE}"/>`
  }

  const hillF = (x: number) => (x < 110 ? 580 : Math.min(800, 580 + (x - 110) * 0.75))
  const imprint = pixels(['..#######', '.#########', '##########', '##########', '.#########..##', ...Array.from({ length: 15 }, () => '..##############'), '.#########..##', '##########', '##########', '.#########', '..#######'], { '#': SHADE }, -3, -19)
  const arms: Wear = { front: anim('arms', pixels(['.aa', 'aa'], { a: '#d77655' }, -2, 1) + pixels(['aa.', '.aa'], { a: '#d77655' }, 14, 1)) }
  const angel = `<g transform="translate(108 770) scale(3.2)">${imprint}<g transform="rotate(-90)">${c({ x: 0, y: 0, s: 1, eyes: 'happy', walk: true, wear: [wear.beanie('#8a5cc7', CREAM), arms] })}</g></g>`
  const left = [
    anim('shoot', at(380, 140, pixels(['......bb', '....bb..', '..aa....', 'aa......'], { a: '#fff6d6', b: '#7f8fcf' }), 4)),
    pine(-40, 486, 7), pine(84, 500, 6), pine(196, 582, 6), pine(286, 632, 7),
    layer(hillF, -480, 400, SNOW, MID),
    angel,
    c({ x: 64, y: 542, s: 3.6, eyes: 'happy', anim: 'hop', speed: 1.3, delay: 0.4, wear: hat(0) }),
    at(358, 766, anim('trudge', c({ x: -7 * 3.6, y: -36, s: 3.6, flip: true, walk: true, delay: 0.3, wear: [...hat(2), towSled] }))),
    at(140, 602, anim('sledrun', `<g transform="rotate(36.9)">${c({ x: -28, y: -44, s: 4, eyes: 'happy', wear: [wear.beanie('#e84f6b', CREAM), { front: tail(-1, '0s') + tail(1, '-.15s') }, sled] })}</g>`)),
    at(340, 762, pixels(['...####....', '.########..', '###########'], { '#': SNOW }) + pixels(['', '', '.....###...'], { '#': MID }), 6),
    anim('puff', at(336, 732, pixels(['#..#...#..#', '..#.#.#.#..', '.#..###..#.', '...#####...'], { '#': BALL }), 6)),
    c({ x: 236, y: 718, s: 3.8, eyes: 'happy', anim: 'hop', speed: 1.1, delay: 0.7, wear: hat(4) }),
    anim('fa', anim('fan', c({ x: 50, y: 900, s: 4.2, wear: hat(1), delay: 1.1 }))),
    anim('fad', c({ x: 50, y: 900, s: 4.2, eyes: 'spiral', anim: 'wiggle', speed: 0.3, wear: hat(1) })),
    anim('fb', c({ x: 282, y: 902, s: 4.2, flip: true, wear: hat(3), delay: 2.3 })),
    fort(44, 924), fort(274, 926),
    c({ x: 368, y: 928, s: 3.6, flip: true, anim: 'nod', speed: 0.7, wear: hat(5), delay: 0.2 }),
    ball(352, 950) + ball(364, 950) + ball(358, 939),
    anim('b1', ball(0, 0)), anim('b2', ball(0, 0)),
    splat('s1', 264, 902), splat('s2', 56, 892),
  ].join('')

  const lap = (i: number, rr: number, h: number, T: number, d: number, s: number) => {
    css.push(loop(`sk${i}`, rr, h))
    return at(1390, 945, anim('', c({ x: -7 * s, y: -11 * s, s, inner: 'turn', speed: T, delay: d, walk: true, eyes: i === 1 ? 'happy' : 'open', wear: [...hat(i + 1), blades] }), `animation:sk${i} ${T}s linear infinite;animation-delay:-${d}s`))
  }
  const smoke = (x: number, y: number, d: number) => at(x, y, anim('smoke', pixels(PUFF, { '#': '#7d89b3' }), `animation-delay:-${d}s`), 8)
  const pond = at(1196, 897, pixels(disc(24, 6), { '#': '#6d8cc9' }), 8) + at(1204, 905, pixels(disc(23, 5), { '#': '#8fb4e6' }), 8)
    + at(1204, 905, pixels(['', '......##.......##', '.........##', '', '.....................###....##', '............##'], { '#': '#c9def8' }), 8)
  const ballRoll = { front: `<g transform="translate(14 2)"><g class="roll">${pixels(disc(4), { '#': BALL })}${pixels(['', '', '..#', '.....#', '', '...#'], { '#': SHADE })}</g></g>` }
  const spark = pixels(['#.#', '.#.', '#.#'], { '#': '#ffffff' })
  const right = [
    pine(1555, 678, 8),
    smoke(1476, 616, 0) + smoke(1472, 620, 1.5) + smoke(1480, 612, 3),
    at(1340, 640, pixels(CABIN, { s: SNOW, r: '#7d8fc4', k: '#7a5a52', L: '#6e4430', l: '#5a3524', D: '#3d2418', y: '#e8b84a', f: '#2e1a10', w: WARM }), 8),
    `<rect class="glow" x="1444" y="728" width="40" height="40" fill="#fff3c4"/><clipPath id="win"><rect x="1444" y="728" width="40" height="40"/></clipPath><g clip-path="url(#win)">${c({ x: 1443, y: 738, s: 3, anim: 'peek', speed: 7, wear: [wear.beanie('#4f9d4a', CREAM)] })}</g>`,
    at(1340, 640, pixels(CABIN, { f: '#2e1a10' }), 8),
    at(1418, 704, pixels(['.k.', 'kwk', 'kwk', 'kkk'], { k: '#2b3450', w: WARM }), 4),
    c({ x: 1222, y: 742, s: 4, eyes: 'happy', anim: 'bob', speed: 2.6, wear: [...hat(2), wear.mug(CREAM, '#5a3524', '#c9d3ee')] }),
    c({ x: 1318, y: 744, s: 3.8, flip: true, eyes: 'closed', anim: 'bob', speed: 3.1, delay: 1.2, wear: [...hat(4), wear.mug('#e84f6b', '#5a3524', '#c9d3ee')] }),
    `<rect x="1218" y="778" width="160" height="12" fill="#6e4430"/><rect x="1214" y="778" width="8" height="12" fill="#c08a5c"/><rect x="1374" y="778" width="8" height="12" fill="#c08a5c"/>`,
    c({ x: 1548, y: 752, s: 3.8, flip: true, anim: 'nod', speed: 0.8, wear: [...hat(3), wear.spade()] }) + anim('toss', at(1528, 748, pixels(['.#', '##'], { '#': SNOW }), 4)),
    c({ x: 1297, y: 804, s: 6, body: '#eef3fd', shade: '#c9d5ee', blink: false, anim: 'squish', speed: 0.8, wear: [sticks, wear.scarf('#e84f6b', CREAM), wear.beanie('#3d7cc9', CREAM)] }),
    c({ x: 1230, y: 824, s: 4.2, anim: 'patf', speed: 0.8, wear: hat(0) }),
    c({ x: 1384, y: 824, s: 4.2, flip: true, anim: 'patb', speed: 0.8, eyes: 'happy', wear: hat(5) }),
    anim('pop', at(1286, 832, spark, 3) + at(1380, 824, spark, 3)),
    c({ x: 1478, y: 834, s: 3.8, anim: 'push', speed: 6, walk: true, wear: [...hat(1), ballRoll] }),
    pond,
    at(1225, 945, c({ x: -7 * 3.5, y: -10 * 3.5, s: 3.5, eyes: 'spiral', anim: 'wiggle', speed: 0.5, wear: [...hat(3), blades] }) + anim('spin', at(-26, -60, pixels(['..y..', 'y...y', '..y..'], { y: '#ffd166' }), 3))),
    lap(1, 120, 18, 10, 0, 3.5), lap(2, 96, 10, 7.5, 3, 3.4), lap(3, 60, 6, 5.5, 1, 3.3),
    at(1545, 945, c({ x: -7 * 3.5, y: -11 * 3.5, s: 3.5, eyes: 'happy', inner: 'turn', speed: 0.5, wear: [...hat(5), blades] })),
  ].join('')

  const body = sky + stars + `<g class="side-r">${moon}</g>` + snowLayer('a', 300, 24) + hills + snowLayer('b', 380, 15) + ground
    + `<g class="side-l">${left}</g><g class="side-r">${right}</g>` + snowLayer('c', 520, 10)
  return svg(1600, 1000, css.join(''), body, defs)
}

export const snow: Scene = {
  id: 'snow',
  title: 'Snow Day',
  blurb: 'Clawds sledging, skating and building a snow-Clawd under the moon',
  mode: 'dark',
  build,
}
