import { BODY, clawd, pixels, svg, wear, type ClawdOptions, type Scene, type Wear } from '../kit.ts'

const SAND = '#f4e1b5'
const SEA = ['#5aaec4', '#6dbdcd', '#85cad5', '#a3dbd9'] as const
const FOAM = '#f4fcfb'

const P = (rows: readonly string[], colors: Record<string, string>, x: number, y: number, u: number, cls = '') =>
  `<g transform="translate(${x} ${y}) scale(${u})"${cls ? ` class="${cls}"` : ''}>${pixels(rows, colors)}</g>`

const g = (cls: string, body: string, style = '') => `<g class="${cls}"${style ? ` style="${style}"` : ''}>${body}</g>`

const own = (front: string, back = ''): Wear => ({ front, back })

const board = own(pixels(['.bbbbbbbbsssbbbbbbb.', 'bbbbbbbbbsssbbbbbbbb', '.dddddddddddddddddd.'], { b: '#ffd166', s: '#e84f6b', d: '#d9a441' }, -3, 10))
const lolly = own(`${pixels(['.pp.', 'pppp', 'pwpp', 'pppp', 'oooo', '.s..', '.s..'], { p: '#ff8fb8', w: '#ffd0e2', o: '#ffb347', s: '#c99d58' }, 13, -3)}<g class="drip">${pixels(['.p'], { p: '#ff8fb8' }, 13, 2)}</g>`)
const pincers = own(`<g class="snip">${pixels(['b.b..........b.b'], { b: BODY }, -1, 0)}</g>${pixels(['bbb..........bbb', '.b............b.'], { b: BODY }, -1, 1)}`)
const cup = own(pixels(['..r', '.r.', 'yyy', 'yoy', 'yyy'], { r: '#e84f6b', y: '#fbf6ee', o: '#ffb347' }, 14, 0))
const mask = own(pixels(['.............o', '.............t', '.............t', '..kkkkkkkkkk.t', '..kg.gggg.gk.t', '..kkkkkkkkkkkt'], { k: '#2a4f86', g: '#a7e3f2', t: '#3aa0c8', o: '#ffb347' }, 0, -2))
const sunhat = own(pixels(['....hhhhhh....', '...hhrrrrhh...', 'hhhhhhhhhhhhhh'], { h: '#f2d27a', r: '#e84f6b' }, 0, -3))

const CASTLE = [
  ['sssssssssssssssssss', 'ssshssssddsssssssss', 'sssssssddddssssssss', 'ddddddddddddddddddd'],
  ['.s.s.s.......s.s.s.', '.sssss.......sssss.', '.shsssssssssssshssd', '.sssssssssssssssssd'],
  ['......s.s.s.s......', '......sssssss......', '......sssdsss......', '......shssssd......', '......ssssssd......'],
  ['.........krr.......', '.........krrr......', '.........k.........'],
] as const
const CASTLE_Y = [60, 40, 15, 0] as const
const CASTLE_C = { s: '#e8bf74', h: '#f7dfa8', d: '#c99a52', k: '#7a4b2a', r: '#e84f6b' }

function tongue() {
  const h = 20
  const half = (r: number) => (r >= h ? 0 : Math.round(22 * Math.sqrt(1 - (r / h) ** 2)) + (r % 3 === 1 ? 1 : 0))
  return Array.from({ length: h }, (_, r) => {
    let row = ''
    for (let x = 0; x < 46; x++) {
      const d = Math.abs(x + 0.5 - 23)
      row += d >= half(r) ? '.' : d >= half(r + 1) - 2 || d >= half(r) - 1 ? 'f' : 'w'
    }
    return row
  })
}

function canopy() {
  const rows = [2, 6, 9, 11, 12].map(hw => {
    let row = ''
    for (let x = 0; x < 24; x++) {
      const i = x - (12 - hw)
      row += i < 0 || i >= hw * 2 ? '.' : Math.floor((i / (hw * 2)) * 6) % 2 ? 'w' : 'r'
    }
    return row
  })
  return [...rows, 'r.rr.ww.rr.ww.rr.ww.rr.r']
}

function sky() {
  const cloud = (x: number, y: number, dur: number, delay: number, big: boolean) =>
    g('drift', P(big ? ['.....www.......', '...wwwwwww.ww..', '.wwwwwwwwwwwwww.', 'wwwwwwwwwwwwwwww', '.bbbbbbbbbbbbbb.'] : ['...www....', '.wwwwwww..', 'wwwwwwwwww', '.bbbbbbbb.'], { w: '#fbfdfd', b: '#e3f1f5' }, x, y, 8), `animation-duration:${dur}s;animation-delay:-${delay}s`)
  const gull = (x: number, y: number, dur: number, delay: number) => {
    const colors = { g: '#7d8a92', w: '#ffffff', o: '#ffb347' }
    const A = P(['g.......g', '.g.....g.', '..gwwwg..', '....wwo..'], colors, 0, 0, 4, 'flapA')
    const B = P(['.........', 'ggg...ggg', '...gwwgo.', '....ww...'], colors, 0, 0, 4, 'flapB')
    const timing = `animation-duration:${dur}s;animation-delay:-${delay}s`
    return `<g transform="translate(${x} ${y})">${g('patrol', g('turn', g('glide', A + B, `animation-delay:-${delay / 3}s`), timing), timing)}</g>`
  }
  return `<rect width="1600" height="540" fill="#cfe9f3"/><rect y="250" width="1600" height="200" fill="#dbeff4"/><rect y="450" width="1600" height="90" fill="#e7f5f2"/><rect y="242" width="1600" height="8" fill="url(#dither-a)"/><rect y="442" width="1600" height="8" fill="url(#dither-b)"/>${cloud(0, 90, 50, 20, true)}${cloud(200, 230, 64, 40, false)}${cloud(1190, 210, 56, 10, true)}${cloud(1250, 400, 70, 50, false)}${gull(20, 160, 22, 6)}${gull(60, 310, 26, 17)}${gull(1200, 240, 24, 3)}`
}

function sea() {
  const band = (y: number, h: number, c: string) => `<rect y="${y}" width="1600" height="${h}" fill="${c}"/>`
  const crest = (y: number, cls: string, pat: string, dur: number) =>
    `<g transform="translate(0 ${y})">${g(cls, `<rect x="-128" width="1856" height="12" fill="url(#${pat})"/>`, `animation-duration:${dur}s`)}</g>`
  const boat = g('boat', P(['....w...', '...ww...', '..www...', '.wwwwr..', 'bbbbbbbb', '.bbbbbb.'], { w: '#fbfdfd', r: '#e84f6b', b: '#a0613c' }, 1196, 516, 4))
  return `${band(540, 16, SEA[0])}${band(556, 56, SEA[1])}${band(612, 56, SEA[2])}${band(668, 48, SEA[3])}${boat}<g clip-path="url(#sides)">${crest(566, 'wl', 'crest-a', 7)}${crest(592, 'wr', 'crest-b', 9)}${crest(628, 'wl', 'crest-b', 6)}${crest(652, 'wr', 'crest-a', 8)}${crest(686, 'wl', 'crest-b', 5)}</g><rect y="716" width="1600" height="24" fill="#e4c993"/><g clip-path="url(#sides)"><g transform="translate(0 708)">${g('lap', `<rect x="-64" width="1728" height="12" fill="url(#foam)"/>`)}</g></g>`
}

function sand() {
  const shell = (x: number, y: number) => P(['.p.', 'ppp', 'qpq'], { p: '#f7b7a3', q: '#e08f7a' }, x, y, 4)
  const star = (x: number, y: number) => P(['..o..', 'ooooo', '.ooo.', '.o.o.'], { o: '#f08a5d' }, x, y, 4)
  return `<rect y="740" width="1600" height="260" fill="${SAND}"/><rect y="740" width="1600" height="260" fill="url(#speck)"/>${shell(372, 968)}${star(1200, 966)}${shell(1574, 976)}${star(392, 860)}`
}

function water(x: number, y: number, w: number, c: string, s: number) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${s * 8}" fill="${c}"/>${g('ripple', P(['f.ff..ffff..ff.f', '.f..ff....ff..f.'], { f: FOAM }, x + (w - 16 * s) / 2, y - s, s))}`
}

type C = Omit<ClawdOptions, 's'> & { s?: number }
const c = (o: C) => clawd({ s: 4.5, ...o })

function left() {
  const wave = P(
    ['...fffff......................', '.fflllllff....................', 'fllmmmmmllff..................', 'flmmddddmmllf.................', 'fmdbbbbbdmmmlf................', 'ffbbbbbbbdmmmlff..............', 'fbbbbbbbbbdmmmmlff............', 'fbbbbbbbbbddmmmmmlff..........', 'ffbbbbbbbddddmmmmmmlfff.......', 'fbbbbbbbdddddddmmmmmmmllff....', 'ffbbbbddddddddddddmmmmmmmmllff', 'dddddddddddddddddddddddddddddd'],
    { f: FOAM, l: '#b9e6ea', m: '#8fd0da', d: SEA[1], b: '#4b9fb6' },
    0, 492, 10,
  )
  const surfer = `${wave}${g('ride', `${g('spray', P(['f.f.', '.f.f', 'f..f', '.ff.'], { f: FOAM }, 104, 574, 4))}${c({ x: 132, y: 530, wear: [board], eyes: 'happy', anim: 'bob', speed: 0.8 })}`)}`
  const snorkel = `${g('float', c({ x: 330, y: 606, wear: [mask], delay: 2 }), 'animation-duration:2.2s')}${water(324, 632, 76, SEA[2], 4)}`
  const wader = `${g('float', c({ x: 24, y: 650, s: 3.8, wear: [sunhat], anim: 'hop', speed: 2.4, delay: 0.7 }), 'animation-duration:1.7s;animation-delay:-0.6s')}${water(14, 674, 72, SEA[3], 4)}`
  const castle = CASTLE.map((rows, i) => g(`cl cl${i}`, P(rows, CASTLE_C, 180, 785 + CASTLE_Y[i]!, 5))).join('')
  const lump = g('cl lump', P(['....ssshss....', '.sssssssssssss.', 'ddddddddddddddd'], CASTLE_C, 192, 850, 5))
  const wash = `<g clip-path="url(#shore)">${g('wash', P(tongue(), { w: SEA[3], f: FOAM }, 44, 716, 8))}</g>`
  const builders = `${g('startle', c({ x: 100, y: 816, s: 5, wear: [wear.spade()], anim: 'nod', speed: 0.7 }))}${g('startle', c({ x: 296, y: 816, s: 5, flip: true, wear: [wear.bucket()], anim: 'nod', speed: 1.1, delay: 0.4 }), 'animation-delay:-0.2s')}`
  const buried = `${c({ x: 324, y: 912, s: 4, delay: 3 })}${P(['....hhhhhhhhhh....', '..hhhhhhhhhhhhhh..', 'hhssssssssssssssss', 'sssssssssssssssss.'], { h: '#f8e8c2', s: '#e9cf98' }, 312, 924, 4)}${P(['a', 'a', 'a', 'b', 'bb'], { a: '#7a4b2a', b: '#a8b0b8' }, 399, 912, 4)}`
  const crabs = `${c({ x: 160, y: 900, s: 4.2, wear: [pincers], anim: 'pace-s crab', walk: true, speed: 9, delay: 5 })}${c({ x: 300, y: 762, s: 3.6, wear: [pincers], anim: 'pace-s crab', walk: true, speed: 5, delay: 1 })}${c({ x: 20, y: 770, s: 3.6, wear: [pincers], anim: 'pace-m crab', walk: true, speed: 6, delay: 2 })}`
  const lollyC = c({ x: 40, y: 900, s: 5, wear: [lolly], eyes: 'happy', anim: 'bob', speed: 1.6, delay: 1 })
  return `${surfer}${snorkel}${wader}${castle}${lump}${wash}${builders}${buried}${crabs}${lollyC}`
}

function right() {
  const dots = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y]) => `<rect x="${1408 + x * 8}" y="${28 + y * 8}" width="8" height="8" fill="#ffd36e"/>`).join('')
  const sun = `${g('ray-a', dots([[8, 0], [9, 0], [8, 1], [9, 1], [8, 16], [9, 16], [8, 17], [9, 17], [0, 8], [0, 9], [1, 8], [1, 9], [16, 8], [16, 9], [17, 8], [17, 9]]))}${g('ray-b', dots([[2, 2], [3, 3], [15, 2], [14, 3], [2, 15], [3, 14], [15, 15], [14, 14]]))}${P(['...oooo...', '.oooyyooo.', '.ooyyyyoo.', 'ooyyyyyyoo', 'ooyyyyyyoo', 'ooyyyyyyoo', 'ooyyyyyyoo', '.ooyyyyoo.', '.oooooooo.', '...oooo...'], { o: '#ffc94d', y: '#ffe7a0' }, 1440, 60, 8)}`
  const ring = own(pixels(['pwwppwwppwwppwwp', 'pwwppwwppwwppwwp'], { p: '#e84f6b', w: '#fbf6ee' }, -1, 5))
  const floater = `${g('float', c({ x: 1200, y: 598, s: 4, wear: [ring, wear.sunglasses()], anim: 'nod', speed: 2.6 }), 'animation-duration:2.8s;animation-delay:-1s')}${water(1188, 628, 80, SEA[2], 4)}`
  const hopper = `${c({ x: 1426, y: 672, s: 4.2, anim: 'hop', eyes: 'happy', speed: 1.2 })}${g('spray', P(['f..f..f..f', '.f.ff..ff.', 'ffffffffff'], { f: FOAM }, 1418, 706, 8), 'animation-duration:1.2s')}`
  const string = Array.from({ length: 48 }, (_, i) => `<rect x="${Math.round((-200 * i) / 192) * 4}" y="${Math.round((-470 * i) / 192) * 4}" width="4" height="4" fill="#7d776e"/>`).join('')
  const kite = `<g transform="translate(1554 784)">${g('kite', `${string}${P(['...r...', '..rry..', '.rrryy.', 'rrrryyy', '.bbbyy.', '..bby..', '...b...', '...k...', '..k....', '...k...'], { r: '#e84f6b', y: '#ffd166', b: '#3d7cc9', k: '#7d776e' }, -228, -510, 8)}`)}</g>`
  const flyer = c({ x: 1490, y: 766, s: 5, wear: [sunhat], anim: 'bob', speed: 1.4 })
  const shadow = P(['...ssssssssssssssssss...', 'ssssssssssssssssssssssss', '...ssssssssssssssssss...'], { s: '#e8cf9a' }, 1190, 796, 10)
  const towel = P(['bwbwbwbwbwbwbwbwbwbwbwbwbwbwb', 'bwbwbwbwbwbwbwbwbwbwbwbwbwbwb'], { b: '#3d7cc9', w: '#fbf6ee' }, 1200, 806, 8)
  const parasol = `${P(canopy(), { r: '#e84f6b', w: '#fbf6ee' }, 1214, 636, 8)}<rect x="1306" y="676" width="8" height="140" fill="#7a4b2a"/>`
  const loungers = `${c({ x: 1214, y: 760, s: 5, wear: [wear.sunglasses(), cup], anim: 'nod', speed: 2.4 })}${c({ x: 1350, y: 772, s: 4.2, flip: true, eyes: 'closed', wear: [wear.zzz('#7d8a92')], anim: 'bob', speed: 3, delay: 1 })}`
  const players = `${g('hit', c({ x: 1190, y: 900, s: 5, eyes: 'happy', anim: 'bounce', speed: 0.5 }))}${g('hit', c({ x: 1520, y: 900, s: 5, flip: true, eyes: 'happy', anim: 'bounce', speed: 0.5, delay: 0.3 }), 'animation-delay:-1.6s')}`
  const ball = `<g transform="translate(1228 868)">${g('ballx', g('bally', g('ballspin', P(['..rrww..', '.rrrwww.', 'yyyrwbbb', 'yyyywbbb', 'yyyywbbb', 'yyywwbbb', '.wwwwww.', '..wwww..'], { r: '#e84f6b', w: '#fbf6ee', y: '#ffd166', b: '#3d7cc9' }, 0, 0, 4))))}</g>`
  const crabs = `${c({ x: 1440, y: 852, s: 3.6, wear: [pincers], anim: 'pace-s crab', walk: true, speed: 6, delay: 3 })}${c({ x: 1260, y: 952, s: 3.6, wear: [pincers], anim: 'pace-m crab', walk: true, speed: 8, delay: 6 })}`
  return `${sun}${floater}${hopper}${kite}${flyer}${shadow}${towel}${parasol}${loungers}${crabs}${players}${ball}`
}

const CSS = `
  .drift { animation: drift ease-in-out infinite alternate } @keyframes drift { to { transform: translateX(120px) } }
  .patrol { animation: patrol linear infinite } @keyframes patrol { 0%, 100% { transform: translateX(300px) } 50% { transform: translateX(0) } }
  .glide { animation: glide 3s ease-in-out infinite alternate } @keyframes glide { to { transform: translateY(14px) } }
  .flapA { animation: flick 0.7s steps(1) infinite } .flapB { animation: flick 0.7s steps(1) infinite reverse }
  @keyframes flick { 0%, 49.9% { opacity: 1 } 50%, 100% { opacity: 0 } }
  .ray-a { animation: flick 1.8s steps(1) infinite } .ray-b { animation: flick 1.8s steps(1) infinite reverse }
  .ripple, .spray { animation: flick 0.8s steps(1) infinite }
  .wl { animation: wl linear infinite; animation-timing-function: steps(8) } @keyframes wl { to { transform: translateX(-128px) } }
  .wr { animation: wr linear infinite; animation-timing-function: steps(6) } @keyframes wr { to { transform: translateX(96px) } }
  .lap { animation: lap 2.4s steps(3) infinite alternate } @keyframes lap { to { transform: translate(16px, 8px) } }
  .boat { animation: boat 60s steps(30) infinite alternate } @keyframes boat { to { transform: translateX(160px) } }
  .ride { animation: ride 7s steps(14) infinite alternate } @keyframes ride { 0% { transform: translate(0, 0) } 50% { transform: translate(-24px, 10px) } 100% { transform: translate(18px, -6px) } }
  .float { animation: float 2s steps(3) infinite alternate } @keyframes float { to { transform: translateY(4px) } }
  .crab { animation-timing-function: steps(40) }
  .snip { animation: flick 0.5s steps(1) infinite }
  .drip { animation: drip 2.6s steps(5) infinite } @keyframes drip { 0%, 50% { transform: translateY(0); opacity: 0 } 55% { opacity: 1 } 100% { transform: translateY(7px); opacity: 0 } }
  .kite { transform-box: fill-box; transform-origin: 100% 100%; animation: kite 2.6s steps(4) infinite alternate } @keyframes kite { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
  .ballx { animation: bx 1.6s linear infinite alternate } @keyframes bx { to { transform: translateX(260px) } }
  .bally { animation: by 0.8s ease-out infinite alternate } @keyframes by { to { transform: translateY(-80px) } }
  .ballspin { transform-box: fill-box; transform-origin: center; animation: spin 0.8s steps(4) infinite }
  .hit { animation: hit 3.2s ease-out infinite } @keyframes hit { 0%, 100% { transform: translateY(-8px) } 10%, 90% { transform: translateY(0) } }
  .cl, .wash, .startle { animation-duration: 20s; animation-iteration-count: infinite }
  .cl0 { animation-name: cl0 } .cl1 { animation-name: cl1 } .cl2 { animation-name: cl2 } .cl3 { animation-name: cl3 } .lump { animation-name: lump }
  @keyframes cl0 { 0%, 4.9% { opacity: 0 } 5%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 } }
  @keyframes cl1 { 0%, 13.9% { opacity: 0 } 14%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 } }
  @keyframes cl2 { 0%, 22.9% { opacity: 0 } 23%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 } }
  @keyframes cl3 { 0%, 31.9% { opacity: 0 } 32%, 57.9% { opacity: 1 } 58%, 100% { opacity: 0 } }
  @keyframes lump { 0%, 4.9% { opacity: 1 } 5%, 57.9% { opacity: 0 } 58%, 100% { opacity: 1 } }
  .wash { animation-name: wash; animation-timing-function: steps(5) }
  @keyframes wash { 0%, 52% { transform: translateY(-168px) } 58%, 64% { transform: translateY(0) } 76%, 100% { transform: translateY(-168px) } }
  .startle { animation-name: startle; animation-timing-function: ease-out }
  @keyframes startle { 0%, 53%, 100% { transform: translateY(0) } 55% { transform: translateY(-18px) } 57% { transform: translateY(0) } 59% { transform: translateY(-10px) } 61% { transform: translateY(0) } }
`

const DEFS = `<pattern id="dither-a" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#dbeff4"/></pattern><pattern id="dither-b" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#e7f5f2"/></pattern><pattern id="crest-a" width="128" height="12" patternUnits="userSpaceOnUse"><g transform="scale(4)">${pixels(['......ccc...................', '....cc...cc.................'], { c: '#d8f2f3' })}</g></pattern><pattern id="crest-b" width="96" height="12" patternUnits="userSpaceOnUse"><g transform="scale(4)">${pixels(['...........cc...........', '.........cc..ccc........'], { c: '#eefafa' })}</g></pattern><pattern id="foam" width="64" height="12" patternUnits="userSpaceOnUse"><g transform="scale(4)">${pixels(['ffffffffffffffff', '.ffffff..ffffff.', '..ffff....ffff..'], { f: FOAM })}</g></pattern><pattern id="speck" width="96" height="72" patternUnits="userSpaceOnUse"><rect x="12" y="8" width="4" height="4" fill="#e9cf98"/><rect x="60" y="28" width="4" height="4" fill="#e9cf98"/><rect x="36" y="52" width="4" height="4" fill="#ddbf86"/><rect x="84" y="60" width="4" height="4" fill="#e9cf98"/><rect x="28" y="32" width="4" height="4" fill="#fbecc9"/></pattern><clipPath id="shore"><rect x="0" y="716" width="420" height="284"/></clipPath><clipPath id="sides"><rect width="420" height="1000"/><rect x="1180" width="420" height="1000"/></clipPath>`

function build() {
  return svg(1600, 1000, CSS, `${sky()}${sea()}${sand()}<g class="side-l">${left()}</g><g class="side-r">${right()}</g>`, DEFS)
}

export const beach: Scene = {
  id: 'beach',
  title: 'Beach Day',
  blurb: 'Clawds scuttling sideways, building sandcastles and surfing',
  mode: 'light',
  build,
}
