import { clawd, pixels, seeded, svg, wear, type Scene, type Wear } from '../kit.ts'

const LEAF = '#4f9d4a'
const LEAF2 = '#6cbf5a'
const SOIL = '#8a5a38'
const SOIL2 = '#74472b'
const WOOD = '#b07a46'
const WOOD2 = '#8a5a2e'
const CREAM = '#fbf6ec'
const STRAW = '#e8c36a'

const at = (x: number, y: number, k: number, body: string) => `<g transform="translate(${x} ${y}) scale(${k})">${body}</g>`
const anim = (cls: string, dur: number, delay: number, body: string) => `<g class="${cls}" style="animation-duration:${dur}s;animation-delay:-${delay.toFixed(2)}s">${body}</g>`
const box = (c: string, x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
const own = (front: string): Wear => ({ front })

const strawHat = (band = '#e2504f') => own(pixels(['....aaaaaa....', '....bbbbbb....', '.aaaaaaaaaaaa.'], { a: STRAW, b: band }, 0, -3))
const sunHat = own(pixels(['......aaaa......', '.....aaaaaa.....', '.....bbbbbb.....', 'aaaaaaaaaaaaaaaa'], { a: '#f2d27a', b: '#ff8fb8' }, -1, -4))
const bigSpade = own(pixels(['aaa', '.a.', '.a.', '.a.', '.a.', 'bbb', 'bbb', '.b.'], { a: WOOD2, b: '#a8b0b8' }, 13, 1))
const net = own(pixels(['....wwww.', '...wmmmmw', '...wmmmmw', '....wwww.', '...h.....', '..h......', '.h.......', 'h........'], { w: CREAM, m: '#dfe9ec', h: WOOD2 }, 13, -4))
const packet = own(pixels(['ppp', 'prp', 'ppp'], { p: '#f2d27a', r: '#e2504f' }, 13, 2))
const barrow = own(
  pixels(['......gggg.....', '....gGggggGg...', 'hhhrrrrrrrrrrrr', '...rRRRRRRRRRRr', '....rRRRRRRRRr.', '.....sssssssss.', '......k..ww....', '......k.w..w...', '.........ww....'], { g: LEAF2, G: LEAF, h: WOOD2, r: '#4f8fc6', R: '#6aaee0', s: '#3d7fb8', k: WOOD2, w: '#3a3a38' }, 13, 1) +
    anim('spoke', 0.4, 0, box('#3a3a38', 22, 8, 1, 1)) +
    anim('spoke', 0.4, 0.2, box('#3a3a38', 23, 8, 1, 1)),
)

function flower(x: number, y: number, k: number, petal: string, grow: number | null) {
  const stem = pixels(['..g..', '.Lg..', '..g..', '..gL.', '..g..', '.Lg..', '..g..'], { g: LEAF, L: LEAF2 }, 0, -7)
  const head = pixels(['.a.a.', 'aaaaa', '.aca.', 'aaaaa', '.a.a.'], { a: petal, c: '#ffd166' }, 0, -11)
  if (grow === null) return at(x, y, k, stem + head)
  const bud = pixels(['..b..', '.bpb.'], { b: LEAF, p: petal }, 0, -9)
  return at(x, y, k, anim('grow', 9, grow, stem) + anim('bud', 9, grow, bud) + anim('bloom', 9, grow, head))
}

const lettuce = (x: number, y: number) => at(x, y, 5, pixels(['.g.g.', 'gLgLg', 'LgLgL'], { g: LEAF, L: LEAF2 }, 0, -3))

const bee = (x: number, y: number, dur: number, delay: number) =>
  `<g transform="translate(${x} ${y})">${anim('buzz', dur, delay, at(0, 0, 4, anim('flap', 0.16, delay, pixels(['..ww.'], { w: '#ffffff' })) + pixels(['', 'ybybk', 'ybyb.'], { y: '#f2c14e', b: '#141413', k: '#141413' })))}</g>`

const butterfly = (x: number, y: number, a: string, flight: string, dur: number) =>
  `<g transform="translate(${x} ${y})">${anim(flight, dur, 0, at(0, 0, 4, anim('flutter', 0.35, 0, pixels(['aa...aa', 'aaa.aaa', '.aa.aa.', '.aa.aa.'], { a })) + pixels(['', '...b...', '...b...', '...b...'], { b: '#3a3a38' })))}</g>`

const drops = (x: number, y: number, c: string) => [0, 0.27, 0.54].map(d => anim('drip', 0.8, d, box(c, x, y, 4, 4))).join('')

function sky() {
  const rays = (list: number[][]) => list.map(([a = 0, b = 0, c = 1, d = 1]) => box('#ffcf5a', a, b, c, d)).join('')
  const sun = at(1290, 40, 8,
    anim('ray', 2.4, 0, rays([[5, -4, 1, 2], [5, 13, 1, 2], [-4, 5, 2, 1], [13, 5, 2, 1]])) +
      anim('ray', 2.4, 1.2, rays([[-1, -1], [-2, -2], [11, -1], [12, -2], [-1, 11], [-2, 12], [11, 11], [12, 12]])) +
      pixels(['....aaa....', '..aaaaaaa..', '.abbaaaaaa.', '.abbaaaaaa.', 'aaaaaaaaaaa', 'aaaaaaaaaaa', 'aaaaaaaaaaa', '.aaaaaaaaa.', '.aaaaaaaaa.', '..aaaaaaa..', '....aaa....'], { a: '#ffd66e', b: '#fff1b8' }))
  const big = ['......aaaa......', '..aaa.aaaaaa....', '.aaaaaaaaaaaaa..', 'aaaaaaaaaaaaaaaa', '.bbbbbbbbbbbbbb.']
  const small = ['...aaa....', '.aaaaaaa..', 'aaaaaaaaaa', '.bbbbbbbb.']
  const cloud = (x: number, y: number, k: number, rows: string[], dur: number, f: number) => anim('drift', dur, dur * f, at(x, y, k, pixels(rows, { a: '#ffffff', b: '#e6f1f5' })))
  return `<rect width="1600" height="1000" fill="#d3eaf4"/>${box('#dcf0f3', 0, 300, 1600, 110)}${box('#e5f4f0', 0, 410, 1600, 200)}<g class="side-r">${sun}</g>${cloud(30, 60, 7, big, 70, 0.1)}${cloud(210, 210, 5, small, 55, 0.45)}${cloud(1190, 250, 6, small, 60, 0.7)}${cloud(1440, 40, 5, small, 65, 0.3)}`
}

const hillY = (x: number, base: number, amp: number, ph: number) => Math.round((base - amp * (0.6 * Math.sin(x / 190 + ph) + 0.4 * Math.sin(x / 83 + ph * 2))) / 8) * 8

function hills() {
  const path = (base: number, amp: number, ph: number, c: string) => {
    let d = `M-480 1000V${hillY(-480, base, amp, ph)}`
    for (let x = -480; x <= 2080; x += 24) d += `H${x}V${hillY(x, base, amp, ph)}`
    return `<path d="${d}H2080V1000Z" fill="${c}"/>`
  }
  return path(520, 34, 1, '#cbe5bd') + path(580, 20, 4, '#b5d99e')
}

function ground() {
  const r = seeded(11)
  let dots = ''
  for (let i = 0; i < 80; i++) {
    const x = Math.round(r.range(-440, 2040) / 4) * 4
    const y = Math.round(r.range(664, 850) / 4) * 4
    if (x > 416 && x < 1180) continue
    dots += box(r.pick(['#ffffff', '#ffd166', '#ff8fb8', '#b18be0']), x, y, 4, 4)
  }
  const fence = (x: number, w: number) => box('#e6dbc6', x, 584, w, 8) + box('#e6dbc6', x, 622, w, 8) + `<rect x="${x}" y="560" width="${w}" height="90" fill="url(#pk)"/>`
  return `${box('#a3d087', -440, 642, 2480, 358)}<rect x="-440" y="642" width="2480" height="358" fill="url(#tuft)"/>${fence(-440, 840)}${fence(1200, 840)}${box(WOOD, 400, 550, 10, 104)}${box(WOOD, 1190, 550, 10, 104)}${dots}`
}

function shed() {
  let roof = ''
  for (let i = 0; i < 12; i++) roof += box(i % 2 ? '#b5523f' : '#c4634b', 12 - i, i, 2 * i + 2, 1)
  const planks = [5, 9, 13, 17, 21].map(c => box('#73a07f', c, 13, 1, 21)).join('')
  const back = at(20, 330, 10, `${roof}${box('#8f3d2f', 0, 12, 26, 1)}${box('#86b392', 2, 13, 22, 21)}${planks}${box(CREAM, 4, 17, 8, 17)}${box('#3f3a33', 5, 18, 6, 16)}${box(CREAM, 14, 17, 8, 8)}${box('#4b5752', 15, 18, 6, 6)}${box('#6b3328', 12, 6, 2, 3)}`)
  const front = at(20, 330, 10, `${box('#a86b3f', 13, 24, 10, 2)}${pixels(['.p.y.p.w.', 'gLgLgLgLg'], { p: '#ff8fb8', y: '#ffd166', w: '#ffffff', g: LEAF, L: LEAF2 }, 13, 22)}${box('#9fc3cf', 20, 18, 1, 1)}`)
  const peek = clawd({ x: 174, y: 522, s: 3.8, eyes: 'wink', anim: 'bob', speed: 2, delay: 0.5 })
  const mug = clawd({ x: 68, y: 624, s: 4.6, wear: [wear.mug()], anim: 'bob', speed: 2.8, delay: 1.4 })
  const flier = clawd({ x: 122, y: 300, s: 4, eyes: 'happy', anim: 'bob', speed: 1.4, delay: 0.6 })
  const string = Array.from({ length: 30 }, (_, i) => box('#8a8f86', Math.round(176 + (175 * i) / 30), Math.round(312 - (150 * i) / 30 + Math.sin((i / 30) * Math.PI) * 18), 3, 3)).join('')
  const kite = anim('kite', 3, 0, at(330, 120, 6, pixels(['...a...', '..aab..', '.aaabb.', 'aaaabbb', '.cccdd.', '..ccd..', '...c...', '...e...', '..e....', '...e...', '....e..', '...e...'], { a: '#5b9fd6', b: '#8cc4ef', c: '#ffd166', d: '#ffe7a3', e: '#e2504f' })))
  return back + peek + front + mug + string + kite + flier
}

function deckchair() {
  const stripes = (y: number, h: number) => Array.from({ length: 7 }, (_, i) => box(i % 2 ? CREAM : '#e86a5c', 4 + i * 2, y, 2, h)).join('')
  const back = at(262, 560, 6, `${box(WOOD2, 1, 17, 1, 5)}${box(WOOD2, 20, 17, 1, 5)}${box(WOOD, 3, 0, 16, 1)}${box(WOOD, 3, 0, 1, 14)}${box(WOOD, 18, 0, 1, 14)}${stripes(1, 13)}`)
  const front = at(262, 560, 6, `${box(WOOD, 0, 12, 22, 2)}${stripes(14, 3)}${box(WOOD2, 3, 14, 1, 8)}${box(WOOD2, 18, 14, 1, 8)}${pixels(['..k', '.k.', 'ww.', 'yy.', 'yy.'], { k: '#e2504f', w: CREAM, y: '#ffe08a' }, 19, 7)}`)
  const napper = clawd({ x: 293, y: 614, s: 5, eyes: 'closed', wear: [sunHat, wear.zzz('#8a8f86')], anim: 'bob', speed: 3.2, delay: 2 })
  return back + napper + front
}

function sunflowers() {
  const head = pixels(['..y.y.y..', '.yyyyyyy.', 'yyybbbyyy', '.ybbbbby.', 'yybbbbbyy', '.ybbbbby.', 'yyybbbyyy', '.yyyyyyy.', '..y.y.y..'], { y: '#ffcf3a', b: '#8a5a2e' })
  const one = (x: number, h: number, delay: number) =>
    `<g transform="translate(${x} ${690 - (9 + h) * 5})">${anim('sway', 3.4, delay, at(0, 0, 5, `${box(LEAF, 4, 9, 1, h)}${box(LEAF2, 5, 14, 2, 1)}${box(LEAF2, 2, 19, 2, 1)}${box(LEAF2, 5, h + 4, 2, 1)}${head}`))}</g>`
  return one(318, 30, 0) + one(366, 21, 1.7)
}

function left() {
  const bed = `${box(SOIL, -440, 860, 860, 14)}${box('#cf9d68', -440, 872, 860, 8)}${box('#b98552', -440, 880, 860, 120)}${[904, 936, 968].map(y => box('#9c6b3e', -440, y, 860, 4)).join('')}${box('#9c6b3e', 412, 860, 8, 140)}`
  const waterer = (x: number, delay: number, band: string) =>
    clawd({ x, y: 806, s: 5.2, wear: [strawHat(band), wear.wateringCan()], anim: 'pour', speed: 2.6, delay }) + anim('wet', 5.2, delay, drops(x + 110, 832, '#5aa9e0'))
  const plants = [
    lettuce(20, 864), lettuce(182, 866), lettuce(286, 864),
    flower(113, 864, 4.5, '#ff8fb8', 2), flower(349, 864, 4.5, '#b18be0', 6),
    flower(236, 866, 4.5, '#e2504f', 4.5), flower(390, 866, 4.5, '#ffffff', null), flower(-40, 864, 4.5, '#ff8fb8', null),
  ].join('')
  const digger = `${box(SOIL2, 322, 756, 30, 6)}${box(SOIL, 344, 742, 40, 20)}${box(SOIL, 352, 734, 24, 8)}${clawd({ x: 244, y: 712, s: 5, wear: [strawHat('#5b9fd6'), bigSpade], anim: 'dig', speed: 2, eyes: 'happy', delay: 0 })}${anim('toss', 2, 0, `${box(SOIL, 332, 744, 6, 6)}${box(SOIL2, 342, 738, 6, 6)}${box(SOIL, 326, 732, 4, 4)}`)}`
  const chaser = `<g transform="translate(40 700)">${anim('hopper', 0.36, 0, clawd({ x: 0, y: 0, s: 4.4, wear: [net], anim: 'pace-s', inner: 'turn', walk: true, speed: 3.5, eyes: 'wide', delay: 0 }))}</g>`
  return `<g class="side-l">${shed()}${sunflowers()}${deckchair()}${digger}${chaser}${butterfly(40, 700, '#b18be0', 'flit', 7)}${bee(340, 470, 2.8, 0)}${bee(362, 610, 3.4, 1.1)}${bee(350, 800, 3, 2)}${waterer(14, 0, '#e2504f')}${waterer(250, 1.3, '#4f9d4a')}${bed}${plants}</g>`
}

function tree() {
  const blobs = [[10, 14, 9], [21, 10, 10], [27, 18, 7.5], [15, 22, 8], [5, 20, 6]]
  const lights = [[9, 11, 6], [19, 7, 6.5]]
  const near = (list: number[][], x: number, y: number) => list.some(([cx = 0, cy = 0, r = 0]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r)
  const rows = Array.from({ length: 31 }, (_, y) => Array.from({ length: 34 }, (_, x) => (!near(blobs, x + 0.5, y + 0.5) ? '.' : near(lights, x + 0.5, y + 0.5) ? 'L' : y > 22 ? 'd' : 'g')).join(''))
  const apples = [[8, 12], [14, 7], [23, 13], [28, 19], [18, 18], [11, 23], [24, 5], [4, 19], [20, 25]].map(([x = 0, y = 0]) => box('#e2504f', x, y, 2, 2) + box('#ff8a7a', x, y, 1, 1)).join('')
  const trunk = box(WOOD2, 15, 24, 4, 37) + box('#6e4424', 15, 24, 1, 37) + box(WOOD2, 13, 59, 8, 2)
  let ladder = ''
  for (let k = 0; k < 10; k++) ladder += box(WOOD, 1440 - k * 6, 420 + k * 30, 6, 30) + box(WOOD, 1476 - k * 6, 420 + k * 30, 6, 30) + box('#9c6b3e', 1446 - k * 6, 432 + k * 30, 30, 5)
  const picker = clawd({ x: 1424, y: 446, s: 4.4, wear: [strawHat('#e2504f'), own(pixels(['.g', 'rr', 'rr'], { g: LEAF, r: '#e2504f' }, 15, 0))], anim: 'bounce', speed: 1.4, delay: 0.3 })
  const basket = own(pixels(['.hhhhh.', 'h.rr..h', 'wwwwwww', 'wWwWwWw', '.wwwww.'], { h: WOOD2, r: '#e2504f', w: '#d9a35f', W: '#b98245' }, 13, 1))
  const catcher = clawd({ x: 1262, y: 640, s: 4.6, eyes: 'wide', wear: [basket], anim: 'bob', speed: 1.5, delay: 0.2 })
  const fall = anim('fall', 3.6, 0, box('#e2504f', 1334, 436, 10, 10) + box('#ff8a7a', 1334, 436, 5, 5))
  return at(1320, 200, 8, trunk + pixels(rows, { g: '#5aa64f', L: '#79c160', d: '#4b9142' }) + apples) + ladder + fall + catcher + picker
}

function right() {
  const carrot = pixels(['..g..g..g..', '..gg.g.gg..', '...ggggg...', '....ggg....', '..ooooooo..', '.ooooooooo.', '.oodoooooo.', '.ooooooooo.', '..ooooodo..', '..ooooooo..', '...ooooo...', '...odooo...', '....ooo....', '....ooo....', '.....o.....'], { g: LEAF, o: '#f28b30', d: '#d06a1c' })
  const patch = `${box('#9a6a45', 1180, 830, 864, 6)}${box(SOIL, 1180, 836, 864, 164)}<rect x="1180" y="836" width="864" height="164" fill="url(#ct)"/>`
  const pullers = anim('tug', 4, 0, clawd({ x: 1377, y: 813, s: 5, eyes: 'wide', delay: 0.3 }) + clawd({ x: 1437, y: 813, s: 5, eyes: 'closed', wear: [strawHat('#ffd166')], delay: 0 }))
  const sparkle = `${box('#ffd166', 1470, 770, 6, 6)}${box('#ffffff', 1576, 778, 6, 6)}${box('#ffd166', 1566, 756, 4, 4)}`
  const giant = `${anim('pluck', 4, 0, at(1490, 812, 7, carrot))}${box(SOIL, 1482, 861, 94, 90)}${at(1482, 855, 7, pixels(['..mmmmmmmmm..', 'mmmmmmmmmmmmm'], { m: '#9a6a45' }))}${anim('pop', 4, 0, sparkle)}`
  const planter = `${clawd({ x: 1190, y: 852, s: 4.6, wear: [strawHat('#b18be0'), packet], anim: 'nod', speed: 1.1, delay: 0.2 })}${[0, 0.4].map(d => anim('seed', 1.1, d, box('#5c3a17', 1260, 878, 4, 4))).join('')}${flower(1276, 936, 3.5, '#ff8fb8', 1)}${flower(1314, 940, 3.5, '#ffd166', 5)}`
  const clump = ['#ff8fb8', '#ffffff', '#e2504f'].map((c, i) => flower(1184 + i * 26, 656, 4, c, null)).join('')
  const giver = clawd({ x: 1192, y: 758, s: 4.8, wear: [own(pixels(['.a.a.', 'aaaaa', 'aaaaa', '.aaa.', '..a..'], { a: '#e2504f' }, 5, -7)), wear.flower('#ff8fb8')], anim: 'offer', speed: 3, delay: 0.5 })
  const taker = clawd({ x: 1282, y: 758, s: 4.8, flip: true, eyes: 'happy', anim: 'hop', speed: 1.8, delay: 1 })
  const hearts = [0, 0.8, 1.6].map((d, i) => anim('float', 2.4, d, at(1260 + i * 12, 736, 4, pixels(['a.a', 'aaa', '.a.'], { a: '#e2504f' })))).join('')
  const sitter = clawd({ x: 1196, y: 532, s: 3.8, walk: true, eyes: 'happy', wear: [wear.note('#7d776e')], anim: 'bob', speed: 1.6, delay: 0.4 })
  const wheel = clawd({ x: 1184, y: 700, s: 4.4, wear: [strawHat('#5b9fd6'), barrow], anim: 'pace-m', inner: 'turn', walk: true, speed: 8.5, delay: 2 })
  return `<g class="side-r">${clump}${sitter}${tree()}${wheel}${giver}${taker}${hearts}${patch}${planter}${giant}${pullers}${bee(1220, 620, 3.2, 0.6)}${bee(1330, 480, 2.6, 1.9)}${bee(1556, 790, 3.6, 0.2)}${butterfly(1190, 420, '#f28b30', 'flit2', 11)}</g>`
}

const CSS = `
  .drift { animation: drift 60s ease-in-out infinite alternate }
  @keyframes drift { from { transform: translateX(0) } to { transform: translateX(80px) } }
  .ray { animation: ray 2.4s steps(1) infinite }
  @keyframes ray { 50% { opacity: .25 } }
  .grow, .bloom { transform-box: fill-box; transform-origin: 50% 100% }
  .grow { animation: grow 9s steps(1) infinite }
  @keyframes grow { 0% { transform: scaleY(.2) } 12% { transform: scaleY(.45) } 24% { transform: scaleY(.7) } 36%, 94% { transform: scaleY(1) } 97%, 100% { transform: scaleY(.2) } }
  .bud { animation: bud 9s steps(1) infinite }
  @keyframes bud { 0%, 35% { opacity: 0 } 36%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
  .bloom { animation: bloom 9s steps(1) infinite }
  @keyframes bloom { 0%, 49% { opacity: 0; transform: scale(.6) } 50% { opacity: 1; transform: scale(.8) } 54%, 94% { opacity: 1; transform: scale(1) } 95%, 100% { opacity: 0; transform: scale(1) } }
  .drip { animation: drip .8s steps(4) infinite }
  @keyframes drip { from { transform: translateY(0); opacity: 1 } to { transform: translateY(28px); opacity: .3 } }
  .drip-s { animation: drip-s .5s steps(3) infinite }
  @keyframes drip-s { from { transform: translateY(0) } to { transform: translateY(14px) } }
  .seed { animation: seed 1.1s steps(3) infinite }
  @keyframes seed { from { transform: translateY(0); opacity: 1 } to { transform: translateY(18px); opacity: 0 } }
  .wet { animation: wet 5.2s steps(1) infinite }
  @keyframes wet { 0% { opacity: 0 } 25%, 74% { opacity: 1 } 75%, 100% { opacity: 0 } }
  .pour { transform-box: fill-box; transform-origin: 20% 100%; animation: pour 2.6s ease-in-out infinite alternate }
  @keyframes pour { from { transform: rotate(0) } to { transform: rotate(6deg) } }
  .dig { transform-box: fill-box; transform-origin: 50% 100%; animation: dig 2s steps(1) infinite }
  @keyframes dig { 25% { transform: translateY(1px) rotate(4deg) } 50% { transform: rotate(-6deg) } 75% { transform: rotate(-2deg) } }
  .toss { animation: toss 2s steps(1) infinite }
  @keyframes toss { 0%, 49% { opacity: 0; transform: translate(0, 0) } 50% { opacity: 1; transform: translate(4px, -14px) } 60% { opacity: 1; transform: translate(12px, -22px) } 70% { opacity: 1; transform: translate(18px, -12px) } 78%, 100% { opacity: 0; transform: translate(20px, 0) } }
  .hopper { animation: hopper .36s steps(2) infinite alternate }
  @keyframes hopper { to { transform: translateY(-8px) } }
  .offer { animation: offer 3s steps(1) infinite }
  @keyframes offer { 0%, 40% { transform: translateX(0) } 45%, 90% { transform: translateX(2px) } }
  .tug { animation: tug 4s steps(1) infinite }
  @keyframes tug { 15% { transform: translateX(-5px) } 30% { transform: translateX(0) } 45% { transform: translateX(-6px) } 60% { transform: translateX(-1px) } 70% { transform: translateX(-9px) } 78%, 92% { transform: translateX(-16px) } }
  .pluck { animation: pluck 4s steps(1) infinite }
  @keyframes pluck { 15% { transform: translateY(-4px) } 30% { transform: translateY(0) } 45% { transform: translateY(-8px) } 60% { transform: translateY(-2px) } 70% { transform: translateY(-14px) } 78%, 92% { transform: translateY(-36px) } }
  .pop { animation: pop 4s steps(1) infinite }
  @keyframes pop { 0%, 77% { opacity: 0 } 78%, 92% { opacity: 1 } 93%, 100% { opacity: 0 } }
  .spoke { animation: spoke .4s steps(1) infinite }
  @keyframes spoke { 50% { opacity: 0 } }
  .float { animation: float 2.4s ease-out infinite }
  @keyframes float { 0% { transform: translateY(0); opacity: 0 } 20% { opacity: 1 } 100% { transform: translateY(-36px); opacity: 0 } }
  .sway { transform-box: fill-box; transform-origin: 50% 100%; animation: sway 3.4s steps(3) infinite alternate }
  @keyframes sway { from { transform: rotate(-2deg) } to { transform: rotate(2deg) } }
  .flap { animation: flap .16s steps(1) infinite }
  @keyframes flap { 50% { opacity: .15 } }
  .flutter { transform-box: fill-box; transform-origin: center; animation: flutter .35s steps(1) infinite }
  @keyframes flutter { 50% { transform: scaleX(.35) } }
  .buzz { animation: buzz 3s linear infinite }
  @keyframes buzz { 0%, 100% { transform: translate(0, 0) } 12% { transform: translate(18px, -10px) } 25% { transform: translate(30px, 0) } 37% { transform: translate(18px, 10px) } 50% { transform: translate(0, 0) } 62% { transform: translate(-18px, -10px) } 75% { transform: translate(-30px, 0) } 87% { transform: translate(-18px, 10px) } }
  .flit { animation: flit 7s ease-in-out infinite }
  @keyframes flit { 0%, 100% { transform: translate(80px, -44px) } 25% { transform: translate(150px, -66px) } 50% { transform: translate(230px, -40px) } 75% { transform: translate(140px, -74px) } }
  .flit2 { animation: flit2 11s ease-in-out infinite }
  .kite { animation: kite 3s steps(1) infinite }
  @keyframes kite { 33% { transform: translate(4px, -6px) } 66% { transform: translate(-3px, -2px) } }
  .fall { animation: fall 3.6s cubic-bezier(.5, 0, 1, 1) infinite }
  @keyframes fall { 0%, 40% { opacity: 0; transform: translateY(0) } 41%, 50% { opacity: 1; transform: translateY(0) } 72% { opacity: 1; transform: translateY(214px) } 73%, 100% { opacity: 0; transform: translateY(214px) } }
  @keyframes flit2 { 0%, 100% { transform: translate(0, 0) } 20% { transform: translate(70px, -30px) } 40% { transform: translate(150px, 10px) } 60% { transform: translate(210px, -40px) } 80% { transform: translate(90px, 20px) } }
`

const DEFS = `<pattern id="pk" width="40" height="90" y="640" patternUnits="userSpaceOnUse"><g transform="translate(5 0) scale(5)">${pixels(['..aa..', '.aaaa.', ...Array<string>(16).fill('aaaaab')], { a: CREAM, b: '#e2d8c6' })}</g></pattern><pattern id="tuft" width="64" height="44" patternUnits="userSpaceOnUse">${box('#8fc274', 12, 20, 4, 8)}${box('#8fc274', 8, 24, 4, 4)}${box('#8fc274', 16, 24, 4, 4)}${box('#96c87a', 44, 6, 4, 4)}</pattern><pattern id="ct" width="52" height="40" patternUnits="userSpaceOnUse">${box(SOIL2, 0, 30, 52, 4)}${box(LEAF, 22, 18, 4, 12)}${box(LEAF2, 16, 22, 4, 8)}${box(LEAF2, 28, 22, 4, 8)}</pattern>`

export const garden: Scene = {
  id: 'garden',
  title: 'Garden',
  blurb: 'An allotment of Clawds watering, digging, napping and pulling up a giant carrot',
  mode: 'light',
  build: () => svg(1600, 1000, CSS, `${sky()}${hills()}${ground()}${left()}${right()}`, DEFS),
}
