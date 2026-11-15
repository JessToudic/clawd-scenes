import { clawd, pixels, seeded, svg, wear, type Scene, type Wear } from '../kit.ts'

const LIT = '#ee8d60'
const LIT_SHADE = '#c96b45'
const FLY = '#e4ff7a'
const GOLD = '#ffd36e'
const PINE = '#05080f'
const lit = { body: LIT, shade: LIT_SHADE }

const n = (v: number) => +v.toFixed(2)
const px = (x: number, y: number, w: number, h: number, fill: string, extra = '') =>
  `<path d="M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${-n(w)}z" fill="${fill}"${extra}/>`
const at = (x: number, y: number, s: number, inner: string) => `<g transform="translate(${n(x)} ${n(y)}) scale(${s})">${inner}</g>`
const anim = (cls: string, inner: string, style = '') => `<g class="${cls}"${style ? ` style="${style}"` : ''}>${inner}</g>`
const timing = (dur: number, delay: number) => `animation-duration:${n(dur)}s;animation-delay:-${n(delay)}s`

function oval(cx: number, cy: number, rx: number, ry: number, step: number, fill: string) {
  let out = ''
  for (let y = -ry; y < ry; y += step) {
    const mid = (y + step / 2) / ry
    const hw = Math.round((rx * Math.sqrt(Math.max(0, 1 - mid * mid))) / step) * step
    if (hw > 0) out += px(cx - hw, cy + y, hw * 2, step, fill)
  }
  return out
}

const FLAMES = [
  ['......r.......', '.....rr....r..', '..r..rrr..rr..', '..rr.rorr.rr..', '..rrrroorrrr..', '.rrroooyorrr..', '.rrooyyyyoorr.', '.rooyywwyyorr.', 'rrooywwwwyoorr', 'rooyywwwwyyoor', 'rooyywwwwwyoor'],
  ['.........r....', '..r.....rr....', '..rr...rrr..r.', '.rrr..rrorr.r.', '.rorrrroorrrr.', '.rroooooyorr..', 'rrooyyyyyoorr.', '.rooyywwyyoorr', 'rrooywwwwyyorr', 'rooyywwwwwyoor', 'rooyywwwwwyoor'],
  ['....r.........', '....rr...r....', '...rrr..rr..r.', '..rrorr.rr.rr.', '..roorrrrorrr.', '.rrooyoooorr..', '.rooyyyyyoorr.', 'rrooyywwyyorr.', 'rrooywwwwyoorr', 'rooyywwwwyyoor', 'rooyywwwwwyoor'],
]
const FLAME_COLORS = { r: '#e8562a', o: '#ff9a3c', y: GOLD, w: '#fff3c4' }

function fire() {
  const frames = FLAMES.map((rows, i) => anim('fr', pixels(rows, FLAME_COLORS), `animation-delay:-${n(i * 0.15)}s`)).join('')
  const base = pixels(['.sLLgLLLLgLLs.', 'sSsLLLLLLLLsSs', '.sSsSssSsSsSs.'], { L: '#6b3f22', g: '#ff7a2e', s: '#3c3e48', S: '#5a5c68' }, 0, 11)
  const r = seeded(7)
  let embers = ''
  for (let i = 0; i < 9; i++) {
    const c = r.pick([GOLD, '#ff9a3c', '#fff3c4'])
    embers += anim(`ember${i % 2 ? ' b' : ''}`, px(Math.round(r.range(3, 11)), Math.round(r.range(1, 4)), 1, 1, c), timing(r.range(1.4, 2.6), r.range(0, 3)))
  }
  return at(188, 728, 6, `${base}${frames}${embers}`)
}

const flail = (c: string): Wear => ({ front: `<g class="arm-l">${px(0, -2, 2, 6, c)}</g><g class="arm-r">${px(12, -2, 2, 6, c)}</g>` })

const notes: Wear = {
  front: anim('notes', pixels(['.aa', '.a.', 'aa.'], { a: GOLD }, 15, -6)) + anim('notes', pixels(['aaa', 'a.a', 'a.a'], { a: '#ffb38a' }, 18, -3), 'animation-delay:-1.1s'),
}

const guitar: Wear = {
  front: `${pixels(['..dd.............', '.dyyd.........tt.', 'dyhhydnnnnnnnnnnt', 'dyhhyd........tt.', '.dyyd............', '..dd.............'], { y: '#f0b552', d: '#6b3a1c', h: '#2a1a10', n: '#3a2414', t: '#e8d9b5' }, 1, 2)}${anim('strum', px(3, 4, 2, 1, LIT_SHADE))}`,
}

function sparklerWear(): Wear {
  let trail = ''
  for (let i = 0; i < 7; i++) {
    const a = ((-60 + i * 12) * Math.PI) / 180
    trail += anim('tr', px(Math.round(13 + 8 * Math.cos(a)), Math.round(3.5 + 8 * Math.sin(a)), 1, 1, i % 2 ? GOLD : '#fff6d6'), timing(0.5, i * 0.13))
  }
  const head = anim('sparks', pixels(['.a.b.', 'b.a.a', '.aba.', 'a.b.b', '.b.a.'], { a: GOLD, b: '#fff6d6' }, 18, 1))
  return { front: `${trail}<g class="wave">${px(13, 3, 6, 1, '#4a4a52')}${head}</g>` }
}

const flaming: Wear = { front: anim('flick', pixels(['r.', 'ro', 'yo'], { r: '#e8562a', o: '#ff9a3c', y: GOLD }, 20, 1)) }
const smore: Wear = { front: pixels(['ccc', 'mmm', 'kkk', 'ccc'], { c: '#d9a35a', m: '#fbf6ee', k: '#5a3420' }, 12, 2) }
const bag = (a: string, b: string): Wear => ({ front: pixels(['.bbbbbbbbbbbb.', 'aaaaaaaaaaaaaa', 'aaaaaaaaaaaaaa', 'aaaaaaaaaaaaaa', 'aaaaaaaaaaaaaa', '.aaaaaaaaaaaa.'], { a, b }, 0, 5) })
const logs = (c: string): Wear => ({ front: `${px(0, -2, 2, 6, c)}${px(12, -2, 2, 6, c)}${pixels(['...LLLLLLLLee.', '...LLLLLLLLee.', '.eeLLLLLLLLLL.', '.eeLLLLLLLLLL.'], { L: '#7a4b2a', e: '#e0b77a' }, 0, -5)}` })

const lantern: Wear = {
  front: `<g opacity="0.14">${oval(16, 3.5, 5, 5, 1, GOLD)}</g><g opacity="0.22">${oval(16, 3.5, 3, 3, 1, GOLD)}</g>${pixels(['.hh.', 'h..h', 'ffff', 'fyyf', 'fyyf', 'ffff'], { h: '#8a8a90', f: '#3a3a40', y: GOLD }, 14, 0)}`,
}

const jar: Wear = {
  front: `${px(15, 2, 4, 3, FLY, ' opacity="0.25"')}${pixels(['.cccc.', 'g....g', 'g....g', 'g....g', '.gggg.'], { c: '#9b9b95', g: '#8fa3b8' }, 14, 1)}${anim('jf', px(15, 3, 1, 1, FLY))}${anim('jf', px(17, 4, 1, 1, FLY), 'animation-delay:-0.45s')}${anim('jf', px(16, 2, 1, 1, FLY), 'animation-delay:-0.2s')}`,
}

const mallet: Wear = { front: anim('mallet', pixels(['hhhh', 'hhhh', '.s..', '.s..', '.s..', '.s..'], { h: '#8a5a32', s: '#c9a06a' }, 12, -3)) }

function beamWear(): Wear {
  let beam = ''
  for (let j = 1; j <= 40; j += 2) {
    const w = 2 + Math.floor(j * 0.45)
    beam += px(14.5 - w / 2, -j - 1, w, 2, '#ffe9a8')
  }
  return { front: `<g class="sweep" opacity="0.09">${beam}</g>${px(14, 0, 1, 4, '#6b6b70')}${px(14, -1, 1, 1, '#fff3c4')}` }
}

function telescope(x: number, y: number, s: number) {
  const tube = pixels(['.........bb', '.......tttb', '.....tttt..', '...tttt....', '.dttt......', 'dd.........'], { t: '#8fa3c4', b: '#d8b45a', d: '#5d7184' }, 11, -5)
  let legs = px(15, 0, 1, 10, '#7d828f')
  for (let i = 0; i < 10; i++) legs += px(15 - Math.floor(i / 3), i, 1, 1, '#9aa0ad') + px(15 + Math.floor(i / 2), i, 1, 1, '#9aa0ad')
  return at(x, y, s, `<g transform="translate(14 0) scale(-1 1)">${legs}${tube}</g>`)
}

function tent() {
  const rows: string[] = []
  for (let i = 0; i < 13; i++) {
    const hw = i < 4 ? -1 : Math.floor((i - 3) * 0.75)
    let row = ''
    for (let c = 0; c < 25; c++) {
      const d = c - 12
      row += Math.abs(d) > i ? '.' : Math.abs(d) <= hw ? 'd' : d === -hw - 1 && hw >= 0 ? 'c' : d < 0 ? 'a' : 'b'
    }
    rows.push(row)
  }
  const art = pixels(rows, { a: '#3e7a8c', b: '#2c5866', c: '#64a6b6', d: '#090c14' })
  return at(1200, 723, 9, `${px(-2, 13, 29, 1, '#0d130f')}${px(12, -1, 1, 1, '#a8703e')}${art}${px(-1, 11, 1, 2, '#c9a06a')}${px(25, 11, 1, 2, '#c9a06a')}`)
}

function owl() {
  const body = pixels(['.t....t.', '.oooooo.', 'oooooooo', 'oooooooo', 'ooobbooo', 'offffffo', '.offffo.', '..t..t..'], { o: '#7a5a3e', f: '#c9a77a', t: '#4a3626', b: '#e8a33a' })
  const eyes = anim('owl-eye', pixels(['WW..WW', 'Wk..Wk'], { W: GOLD, k: '#141413' }, 1, 2))
  return `${px(1395, 428, 110, 10, PINE)}${at(1408, 390, 5, `${body}${eyes}`)}`
}

const PINE_ROWS = ['.......#.......', '......###......', '......###......', '.....#####.....', '....#######....', '.....#####.....', '....#######....', '...#########...', '.....#####.....', '....#######....', '...#########...', '..###########..', '....#######....', '...#########...', '..###########..', '.#############.', '...#########...', '..###########..', '.#############.', '###############', '......###......', '......###......']

const pine = (x: number, base: number, s: number, fill: string) => `<use href="#pine" fill="${fill}" transform="translate(${n(x)} ${n(base - 22 * s)}) scale(${s})"/>`

function flies(r: ReturnType<typeof seeded>, count: number, x0: number, x1: number, y0: number, y1: number) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = Math.round(r.range(x0, x1) / 4) * 4
    const y = Math.round(r.range(y0, y1) / 4) * 4
    out += anim(`ff${r.next() < 0.5 ? ' b' : ''}`, `${px(x - 4, y - 4, 12, 12, FLY, ' opacity="0.18"')}${px(x, y, 4, 4, FLY)}`, timing(r.range(5, 9), r.range(0, 9)))
  }
  return out
}

function backdrop() {
  const r = seeded(11)
  const bands = [['#0a0f26', 0], ['#0d1430', 260], ['#111a3a', 430], ['#162146', 560], ['#1b284f', 640]] as const
  let sky = ''
  bands.forEach(([c, y], i) => {
    sky += px(0, y, 1600, 1000 - y, c)
    if (i > 0) sky += `<pattern id="d${i}" width="16" height="8" patternUnits="userSpaceOnUse">${px(0, 0, 8, 8, c)}</pattern>${px(0, y - 8, 1600, 8, `url(#d${i})`)}`
  })
  const groups = ['', '', '', '']
  for (let i = 0; i < 260; i++) {
    const x = Math.round(r.range(0, 1600) / 4) * 4
    const y = Math.round(r.range(8, 600) / 4) * 4
    if (x > 412 && x < 1184) continue
    if (Math.hypot(x - 1300, y - 150) < 100) continue
    const c = r.pick(['#fff6d8', '#cfd8ff', '#ffe9b0'])
    const big = r.next() < 0.12
    const g = i % 4
    groups[g] += big ? `${px(x - 4, y, 12, 4, c)}${px(x, y - 4, 4, 12, c)}` : px(x, y, r.next() < 0.7 ? 4 : 6, r.next() < 0.7 ? 4 : 6, c)
  }
  const stars = groups.map((g, i) => anim('tw', g, timing(2.4 + i * 0.9, i * 0.7))).join('')
  let hills = ''
  for (let x = 0; x < 1600; x += 16) hills += px(x, Math.round((636 + 22 * Math.sin(x / 170) + 12 * Math.sin(x / 63 + 1)) / 8) * 8, 16, 80, '#111933')
  let trees = ''
  for (let x = -20; x < 1620; x += r.range(20, 38)) trees += pine(x, 714, r.pick([2.6, 3, 3.4, 4]), '#0a1122')
  let ground = px(0, 710, 1600, 290, '#121a16') + px(0, 790, 1600, 210, '#151e18') + px(0, 900, 1600, 100, '#18221a')
  for (let i = 0; i < 46; i++) {
    const fill = r.pick(['#1f2c1e', '#233222', '#1b261b'])
    const x = Math.round(r.range(0, 1600) / 4) * 4
    const y = Math.round(r.range(730, 990) / 4) * 4
    if (x > 404 && x < 1180) continue
    ground += `<use href="#tuft" fill="${fill}" x="${x}" y="${y}"/>`
  }
  return `${sky}${stars}${hills}${trees}${ground}`
}

function leftSide() {
  const r = seeded(3)
  const pool = `<g opacity="0.6">${oval(230, 815, 170, 74, 8, '#2a2419')}</g><g class="glow"><g opacity="0.07">${oval(230, 808, 186, 92, 8, '#ff9a3c')}</g><g opacity="0.09">${oval(230, 808, 130, 60, 8, '#ff9a3c')}</g><g opacity="0.1">${oval(230, 808, 80, 36, 8, '#ffb35a')}</g></g>`
  const aura = `<g class="glow" style="animation-delay:-0.4s"><g opacity="0.05">${oval(230, 770, 180, 180, 12, '#ffb35a')}</g><g opacity="0.05">${oval(230, 770, 116, 116, 12, '#ffb35a')}</g></g>`
  const shoot = anim('shoot', `${px(330, 60, 6, 6, '#ffffff')}${Array.from({ length: 8 }, (_, k) => px(330 + (k + 1) * 7, 60 - (k + 1) * 3.2, 7, 3, '#cfd8ff', ` opacity="${n(0.9 - k * 0.11)}"`)).join('')}`)
  const pines = pine(-90, 712, 22, PINE) + pine(70, 716, 12, PINE) + pine(-40, 730, 9, '#080c16')
  const back = [
    clawd({ x: 112, y: 697, s: 3.8, ...lit, eyes: 'happy', wear: [wear.scarf('#3d7cc9', '#f4efe6'), wear.mug('#c84f4f', '#5a3420', '#9aa0b0')], anim: 'bob', speed: 2.4, delay: 1 }),
    clawd({ x: 202, y: 688, s: 4, ...lit, flip: true, eyes: 'wide', wear: [flail(LIT)], anim: 'bounce', speed: 0.45, delay: 2 }),
    clawd({ x: 296, y: 700, s: 4, ...lit, eyes: 'happy', wear: [sparklerWear()], anim: 'bounce', speed: 0.7, delay: 3 }),
  ].join('')
  const front = [
    clawd({ x: 40, y: 745, s: 3.8, ...lit, eyes: 'happy', wear: [wear.beanie('#c84f4f', '#f4efe6')], anim: 'hop', speed: 0.9, delay: 4 }),
    clawd({ x: 108, y: 770, s: 4.5, ...lit, wear: [wear.stick('#8a5a32', '#fbf6ee', '#e7b071')], anim: 'bob', speed: 2.6, delay: 5 }),
    clawd({ x: 296, y: 775, s: 4.5, ...lit, flip: true, eyes: 'wide', wear: [wear.stick('#8a5a32', '#3a2a20', '#1a1410'), flaming], anim: 'wiggle', speed: 0.5, delay: 6 }),
    clawd({ x: 18, y: 828, s: 5, ...lit, eyes: 'happy', wear: [guitar, notes], anim: 'nod', speed: 0.8, delay: 7 }),
    clawd({ x: 336, y: 850, s: 4.8, ...lit, flip: true, eyes: 'happy', wear: [smore], anim: 'nod', speed: 0.5, delay: 8 }),
    clawd({ x: 236, y: 925, s: 4.6, ...lit, eyes: 'closed', wear: [bag('#6a8f3a', '#9cc26a'), wear.zzz('#dfe6ff')], anim: 'bob', speed: 3, delay: 9 }),
    clawd({ x: 24, y: 945, s: 4.2, wear: [logs('#d77655')], anim: 'pace-m', inner: 'turn', walk: true, speed: 8, delay: 2 }),
  ].join('')
  return `<g class="side-l">${shoot}${pines}${pool}${back}${fire()}${front}${aura}${flies(r, 9, 20, 388, 440, 690)}${flies(r, 3, 20, 388, 880, 990)}</g>`
}

function rightSide() {
  const r = seeded(5)
  const moon = `<g opacity="0.05">${oval(1300, 150, 112, 112, 8, '#f2ead0')}</g><g opacity="0.06">${oval(1300, 150, 82, 82, 8, '#f2ead0')}</g>${oval(1300, 150, 56, 56, 8, '#f2ead0')}${px(1268, 118, 16, 16, '#d8ceb0')}${px(1316, 166, 24, 16, '#d8ceb0')}${px(1292, 182, 8, 8, '#d8ceb0')}${px(1324, 126, 8, 8, '#d8ceb0')}`
  const pines = pine(1360, 714, 20, PINE) + pine(1520, 730, 11, '#080c16')
  const people = [
    clawd({ x: 1287, y: 804, s: 3.6, eyes: 'closed', wear: [bag('#a8503c', '#e8b07a'), wear.zzz('#dfe6ff')], anim: 'bob', speed: 3.4, delay: 1 }),
    clawd({ x: 1450, y: 715, s: 4.5, flip: true, eyes: 'wink', blink: false, anim: 'nod', speed: 3.2, delay: 2 }),
    clawd({ x: 1432, y: 800, s: 4.2, flip: true, wear: [mallet], anim: 'bob', speed: 1.1, delay: 3 }),
    clawd({ x: 1300, y: 890, s: 4.8, wear: [beamWear()], anim: 'bob', speed: 2.2, delay: 4 }),
    clawd({ x: 1190, y: 880, s: 4.5, eyes: 'happy', wear: [jar], anim: 'hop', speed: 1.4, delay: 5 }),
    clawd({ x: 1500, y: 860, s: 4.6, wear: [wear.beanie('#3d7cc9', '#f4efe6'), wear.book('#3d5a8a', '#e8d9b5')], anim: 'bob', speed: 2, delay: 6 }),
    clawd({ x: 1190, y: 950, s: 4.2, wear: [lantern], anim: 'pace-l', inner: 'turn', walk: true, speed: 12, delay: 7 }),
  ]
  const [sleeper = '', stargazer = '', ...rest] = people
  return `<g class="side-r">${moon}${pines}${owl()}${tent()}${sleeper}${stargazer}${telescope(1450, 715, 4.5)}${rest.join('')}${flies(r, 9, 1200, 1580, 440, 720)}${flies(r, 3, 1200, 1580, 880, 990)}</g>`
}

const CSS = `
  .fr { animation: fr 0.45s steps(1) infinite }
  @keyframes fr { 0%, 33.3% { opacity: 1 } 33.4%, 100% { opacity: 0 } }
  .ember { animation: ember 2s steps(9) infinite }
  .ember.b { animation-name: ember-b }
  @keyframes ember { 0% { transform: translate(0, 0); opacity: 1 } 60% { opacity: 1 } 100% { transform: translate(3px, -17px); opacity: 0 } }
  @keyframes ember-b { 0% { transform: translate(0, 0); opacity: 1 } 60% { opacity: 1 } 100% { transform: translate(-3px, -14px); opacity: 0 } }
  .glow { animation: glow 1.3s steps(1) infinite }
  @keyframes glow { 0%, 100% { opacity: 1 } 25% { opacity: 0.72 } 45% { opacity: 0.94 } 70% { opacity: 0.8 } }
  .tw { animation: tw 3s steps(1) infinite }
  @keyframes tw { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
  .ff { animation: ff 7s ease-in-out infinite }
  .ff.b { animation-name: ff-b }
  @keyframes ff { 0% { transform: translate(0, 0); opacity: 0.1 } 25% { transform: translate(12px, -10px); opacity: 1 } 50% { transform: translate(20px, 4px); opacity: 0.25 } 75% { transform: translate(6px, 12px); opacity: 1 } 100% { transform: translate(0, 0); opacity: 0.1 } }
  @keyframes ff-b { 0% { transform: translate(0, 0); opacity: 1 } 30% { transform: translate(-14px, 8px); opacity: 0.2 } 60% { transform: translate(-6px, -14px); opacity: 1 } 100% { transform: translate(0, 0); opacity: 1 } }
  .flick { animation: tr 0.3s steps(1) infinite }
  .tr { animation: tr 0.5s steps(1) infinite }
  @keyframes tr { 0%, 100% { opacity: 1 } 50% { opacity: 0.15 } }
  .jf { animation: tr 0.9s steps(1) infinite }
  .arm-l, .arm-r { transform-box: fill-box; transform-origin: 50% 100%; animation: arm-l 0.35s ease-in-out infinite alternate }
  .arm-r { animation-name: arm-r; animation-delay: -0.17s }
  @keyframes arm-l { from { transform: rotate(-50deg) } to { transform: rotate(10deg) } }
  @keyframes arm-r { from { transform: rotate(50deg) } to { transform: rotate(-10deg) } }
  .wave { transform-box: fill-box; transform-origin: 0% 50%; animation: wave 0.8s ease-in-out infinite alternate }
  @keyframes wave { from { transform: rotate(-60deg) } to { transform: rotate(15deg) } }
  .strum { animation: strum 0.3s steps(1) infinite }
  @keyframes strum { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(1px) } }
  .mallet { transform-box: fill-box; transform-origin: 37.5% 100%; animation: mallet 1.1s ease-in infinite }
  @keyframes mallet { 0%, 50% { transform: rotate(-30deg) } 75% { transform: rotate(70deg) } 82% { transform: rotate(60deg) } 100% { transform: rotate(-30deg) } }
  .sweep { transform-box: fill-box; transform-origin: 50% 100%; animation: sweep 4s ease-in-out infinite alternate }
  @keyframes sweep { from { transform: rotate(4deg) } to { transform: rotate(38deg) } }
  .owl-eye { transform-box: fill-box; transform-origin: center; animation: owlb 4.5s steps(1) infinite }
  @keyframes owlb { 0%, 86%, 92%, 100% { transform: scaleY(1) } 88%, 90%, 94% { transform: scaleY(0.2) } }
  .shoot { animation: shoot 11s linear infinite }
  @keyframes shoot { 0%, 86% { transform: translate(0, 0); opacity: 0 } 87% { opacity: 1 } 95%, 100% { transform: translate(-240px, 110px); opacity: 0 } }
`

const DEFS = `<g id="pine">${pixels(PINE_ROWS, { '#': 'inherit' })}</g><g id="tuft">${px(0, 4, 4, 8, 'inherit')}${px(6, 0, 4, 12, 'inherit')}${px(12, 4, 4, 8, 'inherit')}</g>`

export const campfire: Scene = {
  id: 'campfire',
  title: 'Campfire',
  blurb: 'Clawds round a crackling fire under the stars, toasting marshmallows and telling stories',
  mode: 'dark',
  build: () => svg(1600, 1000, CSS, `${backdrop()}${leftSide()}${rightSide()}`, DEFS),
}
