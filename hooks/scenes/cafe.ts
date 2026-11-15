import { BODY, clawd, pixels, seeded, svg, wear, type ClawdOptions, type Scene, type Wear } from '../kit.ts'

type Box = readonly [number, number, number, number, string]
type Sitter = Omit<ClawdOptions, 'x' | 'y' | 's' | 'flip'>
type Rng = ReturnType<typeof seeded>

const WOOD = '#8f5f3a'
const DARK_WOOD = '#6e4128'
const LIGHT_WOOD = '#a8764a'
const CREAM = '#fbf6ee'
const GREEN = '#3f6f5c'
const BOARD = '#36433d'
const STEAM = '#c9bfb2'

const at = (x: number, y: number, s: number, body: string) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`
const boxes = (list: readonly Box[]) => list.map(([x, y, w, h, f]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`).join('')
const anim = (cls: string, delay: number, body: string, dur = 0) =>
  `<g class="${cls}" style="animation-delay:-${delay.toFixed(2)}s${dur ? `;animation-duration:${dur}s` : ''}">${body}</g>`

const sipMug = (delay: number, cup: string): Wear => ({
  front: anim('sip', delay, `${anim('steam', delay * 0.7, pixels(['.s.s', 's.s.'], { s: STEAM }, 15, 0))}${pixels(['aaaa', 'abba', 'aaaaa', 'aaaa.', 'aaaa.'], { a: cup, b: '#6b4426' }, 14, 2)}`, 4 + (delay % 2)),
})
const bulb = (delay: number): Wear => ({
  front: pixels(['.ooo.', 'ooooo', 'ooooo', '.ooo.', '.kkk.', '..k..'], { o: '#e6dcbc', k: '#9b9b95' }, 5, -8) +
    anim('flick', delay, pixels(['.yyy.', 'yWyWy', 'yyyyy', '.yyy.'], { y: '#ffd36e', W: '#fff3c4' }, 5, -8) + pixels(['r..r..r', '.......', '.......', 'r.....r'], { r: '#f2b632' }, 4, -10)),
})
const waiterKit: Wear = {
  front: pixels(['aa', 'aa', 'ab', 'a.', 'b.'], { a: CREAM, b: '#d9cfc0' }, 0, 3) + anim('steam', 0.4, pixels(['s.', '.s'], { s: STEAM }, 11, -5)) +
    pixels(['.cc..cc..', '.cc..cc..', 'ttttttttt', '...b.....', '...b.....', '...b.....'], { c: CREAM, t: '#9aa3ab', b: BODY }, 10, -3),
}
const baristaKit: Wear = { front: pixels(['.sss', 'hsss', 'hsss', '.sss'], { s: '#c9cfd4', h: '#8f979e' }, 14, 2) }
const cap: Wear = { front: pixels(['.aaaaaaaa...', 'aaaaaaaaaabbb'], { a: GREEN, b: '#2f5446' }, 2, -2) }
const beret: Wear = { front: pixels(['.....a....', '..aaaaaaa.', '.aaaaaaaaa'], { a: '#2a3f66' }, 2, -3) + pixels(['.c', 'c.'], { c: CREAM }, 14, 2) }
const phone: Wear = { front: pixels(['kkk', 'kbk', 'kbk', 'kkk'], { k: '#2b2b2b', b: '#9fd3ff' }, 14, 1) }
const croissant: Wear = { front: pixels(['.cc.', 'cCCc', 'c..c'], { c: '#d99a45', C: '#f0bf6e' }, 14, 3) }
const book: Wear = { front: pixels(['.b..b.', 'bbbbbb', 'aaaaaa'], { a: '#c2553f', b: CREAM }, 13, 2) }
const blanket: Wear = { front: pixels(['.aaaaaaaaaa.', 'bbbbbbbbbbbb'], { a: '#7aa7c7', b: '#5d87ad' }, 1, 5) }
const broom: Wear = { front: pixels(['a...', '.a..', '.a..', '..a.', '..a.', '..a.', '...a', '..bbb', '.bbbbb', '.b.b.b'], { a: LIGHT_WOOD, b: '#e0b25c' }, 14, -1) }
const water: Wear = { front: anim('water', 0, pixels(['w', '.', 'w'], { w: '#5b9fd6' }, 22, 4)) }

function lamp(x: number, len: number, shade: string, rim: string, delay: number) {
  const halo = `<g opacity="0.8">${pixels(['..hhhhhhhhhh..', '.hhhhhhhhhhhh.', 'hhhhhhhhhhhhhh', '.hhhhhhhhhhhh.', '..hhhhhhhhhh..'], { h: '#fff1c2' }, -2, 4)}</g>`
  const head = pixels(['....kk....', '...ssss...', '..ssssss..', '.ssssssss.', 'ssssssssss', 'rrrrrrrrrr', '...bbbb...', '....bb....'], { k: '#5a4a3c', s: shade, r: rim, b: '#fff1b8' })
  return anim('sway', delay, boxes([[x - 2, 0, 4, len, '#5a4a3c']]) + at(x - 25, len, 5, halo + head))
}

function tableSet(x: number, floor: number, s: number, a: Sitter, b: Sitter, top: string) {
  const y = floor - 17 * s
  const stool = (o: number) => boxes([[o + 2, 10, 9, 1, WOOD], [o + 3, 11, 7, 1, DARK_WOOD], [o + 3, 12, 1, 5, DARK_WOOD], [o + 9, 12, 1, 5, DARK_WOOD]])
  const table = boxes([[12, 7, 17, 1, LIGHT_WOOD], [13, 8, 15, 1, WOOD], [19, 9, 3, 7, DARK_WOOD], [16, 16, 9, 1, DARK_WOOD]])
  const shade = `<g opacity="0.5">${boxes([[1, 16.5, 38, 1, '#c9b18a'], [3, 17.5, 34, 0.6, '#c9b18a']])}</g>`
  return at(x, y, s, shade + stool(0) + stool(26)) + clawd({ ...a, x, y, s }) + clawd({ ...b, x: x + 26 * s, y, s, flip: true }) + at(x, y, s, top + table)
}

const VASE = pixels(['.f.', 'fyf', '.g.', '.v.', '.v.'], { f: '#ff8fb8', y: '#ffd166', g: '#4f9d4a', v: '#7aa7c7' }, 19, 2)
const CAKE = pixels(['..r..', '.www.', '.ppp.', 'kkkkk'], { r: '#d64545', w: CREAM, p: '#f2a7b8', k: '#d9d2c8' }, 18, 3)
const SUGAR = pixels(['.k.', 'ggg', 'gwg', 'ggg'], { k: '#9aa3ab', g: '#cfe2e6', w: CREAM }, 19, 3)

function windowView(r: Rng) {
  let stripes = ''
  for (let i = 0; i < 12; i++) {
    const c = i % 2 ? '#fdf7ec' : '#6aa889'
    const sx = 128 + i * 24
    stripes += boxes([[sx, 188, 24, 34, c], [sx + 4, 222, 16, 4, c], [sx + 8, 226, 8, 4, c]])
  }
  let windows = ''
  for (const [bx, by, cols, rows] of [[140, 314, 3, 3], [222, 278, 3, 4], [318, 306, 3, 3]] as const) {
    for (let c = 0; c < cols; c++) for (let w = 0; w < rows; w++) windows += boxes([[bx + c * 26, by + w * 30, 14, 18, '#bcd6df'], [bx + c * 26, by + w * 30 + 18, 14, 4, CREAM]])
  }
  const cloud = (x: number, y: number, delay: number) => `<g transform="translate(${x} ${y})">${anim('drift', delay, at(0, 0, 6, pixels(['..www....', '.wwwwwww.', 'wwwwwwwwww'], { w: '#ffffff' })))}</g>`
  const tree = at(338, 374, 8, pixels(['..ggg...', '.gGggg..', 'gggGgggg', 'gGggggGg', '.gggggg.', '...tt...', '...tt...'], { g: '#7fb069', G: '#9cc77f', t: '#8a6a4a' }))
  const outside = boxes([[128, 188, 284, 270, '#d6ecf2']]) + cloud(150, 238, 3) + cloud(300, 256, 11) +
    boxes([[128, 300, 84, 130, '#efd0ae'], [124, 292, 92, 8, '#d9a982'], [212, 262, 96, 168, '#e3dccf'], [208, 254, 104, 8, '#c9c0b2'], [308, 292, 104, 138, '#eec3a6'], [304, 284, 112, 8, '#d69f86']]) +
    windows + tree + boxes([[128, 430, 284, 28, '#dcd0bd'], [128, 430, 284, 4, '#c5b7a1']]) +
    clawd({ x: 70, y: 422, s: 3, anim: 'stroll', walk: true, speed: 17, delay: r.range(0, 17), wear: [wear.bowlerHat()] }) +
    clawd({ x: 420, y: 422, s: 3, anim: 'stroll-b', walk: true, flip: true, speed: 23, delay: r.range(0, 23), wear: [wear.beanie('#e6c27a'), wear.scarf('#6aa889')] }) +
    boxes([[128, 188, 284, 6, '#4f8a6d']]) + stripes
  const pot = (x: number, p: string) => at(x, 438, 4, pixels(['.g...g.', 'gGg.gGg', '.gGgGg.', '..gGg..', 'qqqqqqq', '.ppppp.', '.ppppp.', '..ppp..'], { g: '#4f9d4a', G: '#7fb069', p, q: '#e8eef2' }))
  return `<g transform="translate(-24 0)">` + boxes([[110, 170, 320, 306, '#d9c8ae'], [116, 176, 308, 294, CREAM]]) + `<g clip-path="url(#cf-glass)">${outside}</g>` +
    boxes([[267, 188, 6, 270, CREAM], [128, 320, 284, 6, CREAM], [100, 470, 340, 14, CREAM], [104, 484, 332, 6, '#d9c8ae']]) +
    pot(136, '#6d8fb3') + pot(384, '#e6a35a') +
    clawd({ x: 300, y: 449, s: 3, eyes: 'happy', anim: 'bob', speed: 2.2, delay: r.range(0, 5), wear: [sipMug(r.range(0, 4), '#e6c27a')] }) + '</g>'
}

function armchair(x: number, y: number, napper: string) {
  const [a, b, c] = ['#d9a441', '#b8862e', '#e8bb5d'] as const
  const back = boxes([[3, 0, 20, 1, b], [2, 1, 22, 13, b], [3, 1, 20, 12, a], [3, 1, 20, 1, c], [7, 4, 1, 1, b], [12, 4, 1, 1, b], [18, 4, 1, 1, b], [9, 8, 1, 1, b], [15, 8, 1, 1, b]])
  const front = boxes([
    [0, 8, 5, 12, b], [1, 9, 3, 10, a], [1, 8, 3, 1, c], [21, 8, 5, 12, b], [22, 9, 3, 10, a], [22, 8, 3, 1, c],
    [5, 14, 16, 2, c], [5, 16, 16, 3, a], [5, 19, 16, 1, b], [0, 19, 26, 1, b], [2, 20, 2, 2, DARK_WOOD], [22, 20, 2, 2, DARK_WOOD],
  ])
  return at(x, y, 7, `<g opacity="0.5">${boxes([[-1, 21.5, 28, 1, '#c9b18a']])}</g>` + back) + napper + at(x, y, 7, front)
}

const CLOCK = at(150, 92, 4, pixels(['...ooooo...', '..offfffo..', '.offfffffo.', 'offfffffffo', 'offfffffffo', 'offfffffffo', 'offfffffffo', 'offfffffffo', '.offfffffo.', '..offfffo..', '...ooooo...'], { o: WOOD, f: CREAM }) + boxes([[5, 5, 3, 1, '#2b2b2b']]) + `<g class="tick"><rect width="11" height="11" fill="none"/>${boxes([[5, 2, 1, 4, '#2b2b2b']])}</g>`)
const rug = () => boxes([[16, 950, 400, 30, '#4f8a8b'], [16, 954, 400, 4, '#e9d8b4'], [16, 972, 400, 4, '#e9d8b4']]) + Array.from({ length: 20 }, (_, i) => boxes([[24 + i * 20, 962, 8, 6, '#e6c27a'], [16 + i * 20, 980, 4, 6, '#e9d8b4'], [26 + i * 20, 980, 4, 6, '#e9d8b4']])).join('')

const MONSTERA = ['......g......', '.gg..ggg.....', 'gGgg.gGg..gg.', 'gGGg.gGg.gGgg', '.gGgggGggGGg.', 'g.gGggGgGgg..', 'gg.gggGggg.gg', 'gGg..gGg..gGg', '.gGg.gGg.gGg.', '..ggggGgggg..', '....ggGgg....', '......G......', '..qqqqqqqqq..', '..ppppppppp..', '...ppppppp...', '...ppppppp...', '....ppppp....']

function left(r: Rng) {
  const d = () => r.range(0, 10)
  const plant = at(20, 581, 7, pixels(MONSTERA, { g: '#4f8f52', G: '#7fb069', p: '#f0e6d6', q: '#d9cbb5' }))
  const waterer = clawd({ x: 116, y: 665, s: 4, flip: true, anim: 'bob', speed: 2, delay: d(), wear: [wear.wateringCan(), water] })
  const l1 = tableSet(170, 790, 4.8, { anim: 'bob', speed: 2.6, delay: d(), wear: [bulb(d())] }, { anim: 'bob', speed: 3, delay: d(), wear: [book] }, VASE)
  const waiter = clawd({ x: 220, y: 794, s: 4.4, anim: 'pace-w', inner: 'turn', walk: true, speed: 8, delay: d(), wear: [waiterKit] })
  const napper = clawd({ x: 76, y: 869, s: 5, eyes: 'closed', anim: 'bob', speed: 3.2, delay: d(), wear: [blanket, wear.zzz('#9a948b')] })
  const l2 = tableSet(214, 972, 5, { eyes: 'happy', anim: 'bob', speed: 2.4, delay: d(), wear: [sipMug(d(), GREEN)] }, { anim: 'bob', speed: 2.8, delay: d(), wear: [sipMug(d(), '#5d7184')] }, CAKE)
  return lamp(48, 250, GREEN, '#2f5446', 0) + lamp(250, 110, '#e6c27a', '#c99c4a', 2) +
    CLOCK + windowView(r) + plant + waterer + l1 + waiter + rug() + armchair(20, 806, napper) + l2
}

function menuBoard(r: Rng) {
  const scribble = (x: number, y: number, cols: number, color: string) => {
    let out = ''
    let c = 0
    while (c < cols) {
      const len = Math.min(cols - c, 2 + Math.floor(r.next() * 5))
      for (let i = 0; i < len; i++) {
        const tall = r.next() < 0.18
        out += boxes([[x + (c + i) * 4, y + (tall ? -4 : (c + i) % 2 ? 4 : 0), 4, tall ? 8 : 4, color]])
      }
      c += len + 1
    }
    return out
  }
  let chalk = scribble(1200, 186, 22, '#f2c14e') + boxes([[1192, 202, 104, 3, '#f2c14e']]) + pixels(['.a.a.', 'aaaaa', '.aaa.', '..a..'], { a: '#ff8fb8' }, 1304, 184)
  for (let i = 0; i < 5; i++) {
    const y = 224 + i * 27
    chalk += scribble(1156, y, 14 + Math.floor(r.next() * 12), CREAM) + boxes([[1352, y, 8, 4, '#ffd166'], [1364, y + 4, 8, 4, '#ffd166']])
  }
  chalk += at(1340, 352, 4, pixels(['.s.s.', '.....', 'cccc.', 'c..cc', 'c..c.', '.cc..'], { s: '#d9d2c8', c: CREAM }))
  const drawing = scribble(1156, 366, 34, '#9fd3ff') + anim('cover', 0, boxes([[1152, 358, 140, 20, BOARD]]))
  return `<g transform="translate(1192 156) scale(0.8) translate(-1120 -156)">${boxes([[1120, 156, 290, 252, DARK_WOOD], [1124, 160, 282, 244, WOOD], [1136, 172, 258, 220, BOARD]]) + chalk + drawing}</g>`
}

function shelves(r: Rng) {
  const planks = boxes([[1436, 282, 156, 4, LIGHT_WOOD], [1436, 286, 156, 10, WOOD], [1452, 296, 6, 14, DARK_WOOD], [1570, 296, 6, 14, DARK_WOOD], [1436, 382, 156, 4, LIGHT_WOOD], [1436, 386, 156, 10, WOOD], [1452, 396, 6, 14, DARK_WOOD], [1570, 396, 6, 14, DARK_WOOD]])
  const jar = (x: number, bean: string) => at(x, 358, 4, pixels(['.kkk.', 'ggggg', 'gbbbg', 'gbgbg', 'gbbbg', 'ggggg'], { k: GREEN, g: '#d7e7ea', b: bean }))
  const mug = (x: number, a: string) => at(x, 270, 4, pixels(['aaaa.', 'aaaaa', 'aaaa.'], { a }))
  const vine = at(1548, 262, 4, pixels(['..g.g..', '.gggGg.', '..ggg..', '.ppppp.', '.ppppp.', '.......', '.......', '.......', '.g...g.', '.g...g.', 'gg..g..', '.g...gg', '..g..g.', '.gg....', '..g....'], { g: '#4f9d4a', G: '#7fb069', p: '#e8eef2' }))
  const sitter = clawd({ x: 1494, y: 261, s: 3, eyes: 'happy', anim: 'bob', walk: true, speed: 2, delay: r.range(0, 4), wear: [wear.heart()] })
  return planks + jar(1446, '#6b4426') + jar(1488, '#8a5a3c') + jar(1530, '#4a3020') + mug(1446, '#7aa7c7') + mug(1468, '#e6c27a') + vine + sitter
}

function machine(r: Rng) {
  const rows = [
    '.....ww...ww...ww.........', '....wwww.wwww.wwww........', '...ttttttttttttttttttttttt', '...smmmmmmmmmmmmmmmmmmmmms', '...sgggmmmmmmmmmmmmmmmmms',
    '...sgkgmmmmmmmmmmmmmmkkms', '...sgggmmmmmmmmmmmmmmkkms', '..ksmmmmmmmmmmmmmmmmmmmmms', '..ksrrrrrrrrrrrrrrrrrrrrrs', '.k.smmmmmmmmmmmmmmmmmmmmms',
    '.k.smmkkkkmmmmmmmmmkkkkmms', 'k..smmmkkmmmmmmmmmmmkkmmms', 'k..sdddddddddddddddddddddds', '...sddwwwwdddddddddwwwwddds', '...sddwwwwdddddddddwwwwddds', '...ttttttttttttttttttttttt',
  ]
  const art = pixels(rows, { w: '#fbf8f2', t: '#5b6168', s: '#8f979e', m: '#c9cfd4', g: CREAM, k: '#3a3f45', r: GREEN, d: '#4a4f55' })
  const pours = anim('pour', r.range(0, 3), boxes([[7.25, 12, 0.5, 1, '#6b4426'], [20.25, 12, 0.5, 1, '#6b4426']]))
  const puff = (x: number, y: number, delay: number, dur: number) => `<g transform="translate(${x} ${y})">${anim('puff', delay, at(0, 0, 4, pixels(['.aaa.', 'aaaaa', '.bbb.'], { a: '#ffffff', b: '#e3d9cb' })), dur)}</g>`
  return at(1470, 560, 5, art + pours) + puff(1462, 596, 0, 2.4) + puff(1462, 596, 0.8, 2.4) + puff(1462, 596, 1.6, 2.4) + puff(1500, 548, 0.5, 3.4) + puff(1558, 548, 2.2, 3.4)
}

function counter() {
  let slats = ''
  for (let x = 1192; x < 1600; x += 24) slats += boxes([[x, 662, 4, 56, '#a9cdbb']])
  const pastries = pixels(['..cc..', '.cCCc.', 'cc..cc'], { c: '#d99a45', C: '#f0bf6e' }, 2, 3) + pixels(['.r..', 'wwww', 'pppp', 'wwww', 'pppp'], { r: '#d64545', w: CREAM, p: '#f2a7b8' }, 9, 1) +
    pixels(['.pppp.', 'pp..pp', '.dddd.'], { p: '#ff8fb8', d: '#c98c5a' }, 14, 3) + pixels(['.bbb.', 'bbbbb', '.www.', '.www.'], { b: '#8a5a3c', w: '#e8d7b9' }, 2, 7) +
    pixels(['.bbb.', 'bbbbb', '.www.', '.www.'], { b: '#e6a35a', w: '#e8d7b9' }, 8, 7) + pixels(['cccc', 'kkkk', 'cccc'], { c: '#c98c5a', k: '#6b4426' }, 15, 8)
  const pastryCase = at(1186, 588, 4, boxes([[0, 0, 22, 13, WOOD], [1, 1, 20, 10, '#e4f1f2'], [1, 6, 20, 1, '#c9dde0'], [1, 1, 1, 4, '#ffffff'], [0, 11, 22, 2, DARK_WOOD]]) + pastries)
  const register = at(1280, 608, 4, pixels(['..kkkkkkk..', '..kgggggk..', '..kkkkkkk..', '.rrrrrrrrr.', 'rrwrwrwrrrr', 'rrrrrrrrrrr', 'rrrrrrrrrrr', 'kkkkkkkkkkk'], { k: '#3a3f45', g: '#9fe0b8', r: '#7fb7a4', w: CREAM }))
  return boxes([[1180, 732, 420, 8, '#d3bc94'], [1180, 640, 420, 4, '#a8764a'], [1180, 644, 420, 12, DARK_WOOD], [1180, 656, 420, 66, '#bcdccb'], [1180, 656, 420, 4, '#e3f1e9'], [1180, 722, 420, 10, '#7fa894']]) + slats + pastryCase + register
}

function right(r: Rng) {
  const d = () => r.range(0, 10)
  const ladder = boxes([[1190, 362, 6, 278, LIGHT_WOOD], [1220, 362, 6, 278, LIGHT_WOOD], [1196, 400, 24, 5, '#c08a5c'], [1196, 440, 24, 5, '#c08a5c'], [1196, 480, 24, 5, '#c08a5c'], [1196, 520, 24, 5, '#c08a5c'], [1196, 560, 24, 5, '#c08a5c'], [1196, 600, 24, 5, '#c08a5c'], [1184, 358, 48, 8, WOOD]])
  const artist = clawd({ x: 1184, y: 318, s: 4, anim: 'wiggle', speed: 1.6, delay: d(), wear: [beret] })
  const cashier = clawd({ x: 1332, y: 606.4, s: 4.8, anim: 'bob', speed: 2, delay: d(), wear: [cap] })
  const barista = clawd({ x: 1400, y: 603.6, s: 5.2, eyes: 'happy', anim: 'jig', inner: 'nod', speed: 0.8, delay: d(), wear: [wear.chefHat(), baristaKit] })
  const queue = clawd({ x: 1196, y: 693.8, s: 4.8, anim: 'bob', speed: 2.2, delay: d(), wear: [phone] }) + clawd({ x: 1282, y: 690, s: 5.2, eyes: 'wide', anim: 'hop', speed: 1.8, delay: d() })
  const r2 = tableSet(1395, 905, 5, { eyes: 'happy', anim: 'nod', speed: 0.9, delay: d(), wear: [wear.headphones('#2a4f86'), wear.note('#7d776e')] }, { eyes: 'happy', anim: 'bob', speed: 2.2, delay: d(), wear: [croissant] }, SUGAR)
  const sweeper = clawd({ x: 1290, y: 751, s: 4.4, anim: 'pace-s', inner: 'turn', walk: true, speed: 6, delay: d(), wear: [broom] })
  const r1 = tableSet(1180, 982, 5, { anim: 'nod', speed: 0.45, delay: d(), wear: [wear.laptop()] }, { anim: 'bob', speed: 2.6, delay: d(), wear: [sipMug(d(), '#7aa7c7')] }, VASE)
  return lamp(1225, 100, '#e6c27a', '#c99c4a', 1) + lamp(1330, 100, GREEN, '#2f5446', 3) + lamp(1515, 180, '#e6c27a', '#c99c4a', 5) +
    menuBoard(r) + ladder + artist + shelves(r) + cashier + barista + machine(r) + counter() + queue + sweeper + r2 + r1
}


const CSS = `
  .sway { transform-box: fill-box; transform-origin: 50% 0; animation: sway 5s steps(6) infinite alternate }
  @keyframes sway { from { transform: rotate(-1deg) } to { transform: rotate(1deg) } }
  .sip { animation: sip 4s steps(1) infinite }
  @keyframes sip { 0% { transform: translate(0, 0) } 62% { transform: translate(-2px, -2px) } 90% { transform: translate(0, 0) } }
  .flick { animation: flick 6s steps(1) infinite }
  @keyframes flick { 0% { opacity: 0 } 50% { opacity: 1 } 53% { opacity: 0 } 56% { opacity: 1 } 90% { opacity: 0 } }
  .pour { animation: pour 3s steps(1) infinite }
  @keyframes pour { 0% { opacity: 1 } 55% { opacity: 0 } }
  .puff { transform-box: fill-box; transform-origin: center; animation: puff 2.4s ease-out infinite }
  @keyframes puff { 0% { transform: translate(0, 0) scale(0.5); opacity: 0 } 15% { opacity: 1 } 100% { transform: translate(8px, -72px) scale(1.4); opacity: 0 } }
  .water { animation: water 0.8s steps(4) infinite }
  @keyframes water { 0% { transform: translateY(0); opacity: 1 } 100% { transform: translateY(6px); opacity: 0 } }
  .jig { animation: jig 0.6s steps(1) infinite }
  @keyframes jig { 0% { transform: translateX(0) } 50% { transform: translateX(1px) } }
  .pace-w { animation: pace-w 8s linear infinite }
  @keyframes pace-w { 0%, 100% { transform: translateX(0) } 50% { transform: translateX(24px) } }
  .stroll { animation: stroll 17s linear infinite } .stroll-b { animation: stroll-b 23s linear infinite }
  @keyframes stroll { from { transform: translateX(0) } to { transform: translateX(132px) } }
  @keyframes stroll-b { from { transform: translateX(0) } to { transform: translateX(-132px) } }
  .drift { animation: drift 20s ease-in-out infinite alternate }
  @keyframes drift { from { transform: translateX(0) } to { transform: translateX(36px) } }
  .cover { transform-box: fill-box; transform-origin: 100% 50%; animation: cover 9s steps(14) infinite }
  @keyframes cover { 0% { transform: scaleX(1) } 70%, 100% { transform: scaleX(0) } }
  .tick { transform-box: fill-box; transform-origin: center; animation: spin 60s steps(12) infinite }
`

const DEFS = `<clipPath id="cf-glass"><rect x="128" y="188" width="284" height="270"/></clipPath>` +
  `<pattern id="cf-paper" width="64" height="64" patternUnits="userSpaceOnUse"><rect x="14" y="10" width="4" height="12" fill="#f1e1c6"/><rect x="10" y="14" width="12" height="4" fill="#f1e1c6"/><rect x="46" y="42" width="4" height="12" fill="#f1e1c6"/><rect x="42" y="46" width="12" height="4" fill="#f1e1c6"/></pattern>` +
  `<pattern id="cf-wains" y="524" width="128" height="140" patternUnits="userSpaceOnUse"><rect x="12" y="16" width="104" height="108" fill="#ecd7b6"/><rect x="16" y="20" width="100" height="104" fill="#d4b68b"/><rect x="16" y="20" width="96" height="100" fill="#dfc39b"/></pattern>` +
  `<pattern id="cf-floor" y="680" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#e3cfad"/><rect x="40" y="40" width="40" height="40" fill="#e3cfad"/></pattern>`

function build() {
  const r = seeded(11)
  const fill = (id: string, y: number, h: number, l: number, r: number, faint: number) =>
    `<rect y="${y}" width="${l}" height="${h}" fill="url(#${id})"/><rect x="${r}" y="${y}" width="${1600 - r}" height="${h}" fill="url(#${id})"/><rect x="${l}" y="${y}" width="${r - l}" height="${h}" fill="url(#${id})" opacity="${faint}"/>`
  const room = `<rect width="1600" height="1000" fill="#f8eedc"/>${fill('cf-paper', 0, 512, 384, 1216, 0.35)}` +
    boxes([[0, 512, 1600, 168, '#e5cba5']]) + fill('cf-wains', 524, 140, 384, 1280, 0.4) +
    boxes([[0, 506, 1600, 6, '#c08a5c'], [0, 512, 1600, 12, LIGHT_WOOD], [0, 664, 1600, 16, WOOD], [0, 680, 1600, 320, '#efe1c7']]) +
    fill('cf-floor', 680, 320, 400, 1200, 0.3) + boxes([[0, 680, 1600, 6, '#d8c3a0']])
  return svg(1600, 1000, CSS, `${room}<g class="side-l">${left(r)}</g><g class="side-r">${right(r)}</g>`, DEFS)
}

export const cafe: Scene = {
  id: 'cafe',
  title: 'Clawd Café',
  blurb: 'Coffee, chalk menus, a busy barista and one bright idea',
  mode: 'light',
  build,
}
