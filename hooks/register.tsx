import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Scene } from './kit.ts'
import { beach } from './scenes/beach.ts'
import { cafe } from './scenes/cafe.ts'
import { campfire } from './scenes/campfire.ts'
import { garden } from './scenes/garden.ts'
import { snow } from './scenes/snow.ts'
import { DURATION, reveal } from './reveal.ts'
import { thumb } from './thumbs.ts'

const SCENES: readonly Scene[] = [cafe, beach, garden, snow, campfire]
const DEFAULT = cafe.id
const COMMAND = 'clawd'
const PREFIX = 'clawd5-'
const LOAD = Date.now().toString(36)
const OFF = 'off'

const SELF = 'clawd-scenes'
const SCENE_REF = { plugin: 'clawd-scenes', key: 'scene' } as const
const BAND_REF = { plugin: 'clawd-scenes', key: 'band' } as const

// Where a switch's circle starts: the picked tile's place in the card's row,
// which holds Default and then each scene, centred, one tile (112px) plus the
// row's gap apart.
const TILES = SCENES.length + 1
const PITCH = 120

type Switch = { from: string; tile: number }

let switches = 0
// The scene on screen, known without asking the engine; empty after a reload until read.
let latest: string | undefined
let settling: { cancel: () => void } | undefined


async function currentScene($: EngineInterface) {
  const { value } = await $.state.get(SCENE_REF)
  return value ?? DEFAULT
}

async function show($: EngineInterface, sceneId: string, from?: Switch) {
  const scene = SCENES.find(s => s.id === sceneId)
  if (scene === undefined) return
  settling?.cancel()
  settling = undefined
  const via = from === undefined ? '' : `-${from.from}-${from.tile}-${(++switches).toString(36)}`
  const name = `${PREFIX}${LOAD}-${sceneId}${via}`
  const set = await $.theme.set(look(scene, name))
  if (!set.isDrawn) $.ui.status(set.reason)
}

// Back to the app's own look: the old scene opens up from the Default tile,
// then the theme is cleared once the circle has reached the corners.
async function hide($: EngineInterface, prevId: string, tile: number) {
  settling?.cancel()
  settling = undefined
  const prev = SCENES.find(s => s.id === prevId)
  const set = prev === undefined ? undefined : await $.theme.set(look(prev, `${PREFIX}${LOAD}-${OFF}-${prevId}-${tile}-${(++switches).toString(36)}`))
  if (set?.isDrawn !== true) {
    await $.theme.clear()
    return
  }
  settling = $.clock.after(Math.round(DURATION * 1000) + 100, () => {
    settling = undefined
    void $.theme.clear()
  })
}

function look(scene: Scene, name: string): ThemeSetArgs {
  if (scene.mode === 'light') {
    return { backdrop: { scene: name, glass: { blur: 14, tint: '#f6f1e8', opacity: 0.5 } }, overrideColorScheme: 'light' }
  }
  if (scene.mode === 'dark') {
    return { backdrop: { scene: name, glass: { blur: 14, tint: '#1a1916', opacity: 0.5 } }, overrideColorScheme: 'dark' }
  }
  return { backdrop: { scene: name, glass: { blur: 14, opacity: 0.55 } } }
}

type Picked = { scene: Scene | undefined; from: { scene: Scene | undefined; tile: number } | undefined }

function parse(name: string): Picked | undefined {
  if (!name.startsWith(PREFIX)) return undefined
  const [, id = '', fromId, tileText] = name.slice(PREFIX.length).split('-')
  const scene = SCENES.find(s => s.id === id)
  const tile = Number(tileText)
  const from = fromId !== undefined && fromId !== id && Number.isInteger(tile) ? { scene: SCENES.find(s => s.id === fromId), tile } : undefined
  if (scene === undefined && (id !== OFF || from === undefined)) return undefined
  return { scene, from }
}

const built = new Map<string, string>()

function drawing(scene: Scene) {
  const cached = built.get(scene.id)
  if (cached !== undefined) return cached
  const source = scene.build('idle')
  built.set(scene.id, source)
  return source
}

const switched = new Map<string, string>()

function backdrop({ scene, from }: Picked) {
  const now = scene === undefined ? undefined : drawing(scene)
  if (from === undefined) return now ?? ''
  const key = `${from.scene?.id ?? OFF}>${scene?.id ?? OFF}@${from.tile}`
  const cached = switched.get(key)
  if (cached !== undefined) return cached
  const prev = from.scene === undefined ? undefined : drawing(from.scene)
  const source = reveal(now, prev, { tile: from.tile, count: TILES, pitch: PITCH })
  switched.set(key, source)
  return source
}

function find(name: string) {
  const wanted = name.trim().toLowerCase()
  return SCENES.find(s => s.id === wanted || s.title.toLowerCase() === wanted)
}

async function closeCard($: EngineInterface) {
  await $.state.set(BAND_REF, false)
}

async function keep($: EngineInterface, scene: Scene | undefined) {
  const id = scene?.id ?? OFF
  const prev = latest ?? (await currentScene($))
  if (prev === id) return
  latest = id
  settling?.cancel()
  settling = undefined
  // Draw the switch first and record the choice after, so the circle starts on
  // the press instead of waiting on the engine.
  const tile = scene === undefined ? 0 : SCENES.indexOf(scene) + 1
  if (scene === undefined) await hide($, prev, tile)
  else await show($, scene.id, { from: prev, tile })
  await $.state.set(SCENE_REF, id)
  await $.store.set('scene', id)
}

async function choose($: EngineInterface, scene: Scene | undefined) {
  await keep($, scene)
  await closeCard($)
}

const SHORT: Record<string, string> = { off: 'Default', cafe: 'Café', beach: 'Beach', garden: 'Garden', snow: 'Snow', campfire: 'Campfire' }

type Tile = { id: string; title: string; blurb: string }
// Each preview's size in pixels: a wide strip, about 1.9:1 like the app's own /theme tiles.
// The scene (16:10) fills it and is trimmed evenly top and bottom.
const TILE_W = 112
const TILE_H = 60
const NONE: Tile = { id: OFF, title: 'Default', blurb: 'The app\'s own look, no Clawds behind the chat' }

type CardElements = ReturnType<EngineInterface['ui']['resolve']>

function card($: EngineInterface, elements: CardElements, current: string) {
  const { Box, Text, Button } = elements
  const Svg = 'Svg' in elements ? elements.Svg : undefined
  const tiles: readonly Tile[] = [NONE, ...SCENES]
  const pick = (tile: Tile) => keep($, SCENES.find(s => s.id === tile.id))
  return (
    <Box flexDirection="column" gap="sm" paddingX={1} paddingTop="xs" paddingBottom={1}>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text bold>Clawd scenes</Text>
        <Button key="clawd-close" label="Close" plain dimColor onPress={() => void closeCard($)}>
          Close
        </Button>
      </Box>
      <Box flexDirection="row" flexWrap="nowrap" justifyContent="center" gap="sm">
        {tiles.map(tile => {
          const isOn = tile.id === current
          const name = SHORT[tile.id] ?? tile.title
          return (
            <Box key={`tile-${tile.id}`} flexDirection="column" alignItems="center" gap="xs" flexShrink={0}>
              {Svg === undefined ? [] : [<Svg key={`thumb-${tile.id}`} source={thumb(tile.id, isOn) ?? ''} alt={tile.blurb} width={TILE_W} height={TILE_H} />]}
              <Button
                key={`pick-${tile.id}`}
                label={name}
                plain
                dimColor={!isOn}
                autoFocus={isOn ? true : undefined}
                onPress={() => void pick(tile)}
              >
                {name}
              </Button>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

function listing() {
  const kind = (s: Scene) => (s.mode === 'both' ? 'light or dark' : `${s.mode} windows`)
  return [
    'Clawd scenes:',
    ...SCENES.map(s => `  ${s.id}: ${s.title}. ${s.blurb} (${kind(s)})`),
    `Pick one with /${COMMAND} (the picker) or /${COMMAND} <name>. /${COMMAND} off clears it.`,
  ].join('\n')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: COMMAND, description: `Pick a Clawd scene for the background: /${COMMAND} opens the picker, /${COMMAND} <name>, /${COMMAND} off` })
    const stored = await $.store.get('scene')
    const chosen = stored === OFF || SCENES.some(s => s.id === stored) ? (stored as string) : DEFAULT
    latest = chosen
    await $.state.set(SCENE_REF, chosen)
    if (chosen !== OFF) await show($, chosen)
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === '') {
      await $.state.set(BAND_REF, true)
      return { text: 'Pick a scene on the card above the message box: Tab or the arrows switch scenes, Esc closes the card.' }
    }
    if (arg === 'list') return { text: listing() }
    if (arg === OFF) {
      await choose($, undefined)
      return { text: `Clawds are off. /${COMMAND} brings them back.` }
    }
    const scene = find(arg)
    if (scene === undefined) return { text: `No scene called "${arg}".\n\n${listing()}` }
    await choose($, scene)
    const fit = scene.mode === 'both' ? '' : ` Made for ${scene.mode} windows.`
    return { text: `${scene.title} it is.${fit}` }
  })

  // Another mod (clawd-2, or any theme) took the background: step aside so the
  // next session restores whichever scene was picked last, not ours.
  on('theme.set', async ($, e, next) => {
    const result = await next(e)
    const by = next.origin.plugin
    if (by === SELF || by.startsWith(`${SELF}@`)) return result
    settling?.cancel()
    settling = undefined
    if ((await currentScene($)) !== OFF) {
      latest = OFF
      await $.store.set('scene', OFF)
      await $.state.set(SCENE_REF, OFF)
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { value: inBand } = await $.state.get(BAND_REF)
    if (inBand !== true) return next(e)
    // Reading the saved scene redraws the card when a switch is saved. Mark the
    // scene on screen, though: a switch is drawn before it is saved, and a card
    // drawn in between would put focus, and so the pick, back on the old tile.
    const saved = await currentScene($)
    return card($, $.ui.resolve(e), latest ?? saved)
  })

  on('ui.focus', { component: 'AbovePrompt' }, async ($, e, next) => {
    const result = await next(e)
    const { value: isOpen } = await $.state.get(BAND_REF)
    const id = e.element?.startsWith('pick-') ? e.element.slice('pick-'.length) : undefined
    const scene = SCENES.find(s => s.id === id)
    if (isOpen === true && (scene !== undefined || id === OFF)) await keep($, scene)
    return result
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const picked = parse(e.props.scene)
    if (picked === undefined) return next(e)
    const { Svg } = $.ui.resolve(e)
    const blurb = picked.scene?.blurb ?? picked.from?.scene?.blurb ?? 'switching scenes'
    return <Svg isInteractive alt={`Little pixel Clawds: ${blurb}`} source={backdrop(picked)} />
  })
}
