import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'clawd-scenes',
  component: 'AbovePrompt',
  requestId: 'clawd',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 12, bodyColumns: 100, scroll: { offset: 0, bodyRows: 12 }, view: {} },
} as const

test('the picker is image tiles with Default first, and a press picks', async ($, on) => {
  // Nothing sits beneath the plugin: these hooks stand for the engine.
  const themes: unknown[] = []
  on('command.register', () => ({ value: { command: 'clawd-scenes' } }))
  on('theme.set', (_, e) => {
    themes.push(e)
    return { value: { isDrawn: true, requestId: 'bg' } }
  })
  on('theme.clear', () => ({ value: { isDrawn: false, reason: 'cleared' } }))
  const store = new Map<string, unknown>()
  on('store.get', (_, e) => ({ value: store.get(e.key) }))
  on('store.set', (_, e) => {
    store.set(e.key, e.value)
    return { value: undefined }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.command.run({ command: 'clawd-scenes', args: '', origin: { kind: 'sdk' }, presentation: { isFullscreen: false, columns: 100 } })

  for (const surface of ['desktop', 'terminal'] as const) {
    const ui = await $.ui.mount({ ...BAND, surface })
    const buttons = await ui.findAll({ type: 'Button' })
    const picks = buttons.map(b => b.key)
    // The picked tile is marked by its ring and undimmed name, not a tick.
    expect(buttons.some(b => String(b.props.label).includes('✓'))).toBe(false)
    expect(picks).toEqual(['clawd-close', 'pick-off', 'pick-cafe', 'pick-beach', 'pick-garden', 'pick-snow', 'pick-campfire'])
    expect((await ui.find({ type: 'Button', key: 'pick-cafe' }))?.props.dimColor).toBe(false)
    if (surface === 'desktop') {
      const pictures = await ui.findAll({ type: 'Svg' })
      expect(pictures).toHaveLength(6)
      // Every tile is one fixed wide image; only the picked one draws the ring inside it
      // and moves.
      expect(pictures.every(p => p.props.width === 112 && p.props.height === 60 && p.props.isInteractive === undefined)).toBe(true)
      const ringed = pictures.filter(p => String(p.props.source).includes('stroke="#d97757"'))
      const still = pictures.filter(p => String(p.props.source).includes('animation-play-state:paused'))
      expect(ringed).toHaveLength(1)
      expect(still).toHaveLength(5)
      // No Box is sized: a Box's width and height are text cells, which blew the tiles up.
      expect((await ui.findAll({ type: 'Box' })).every(b => b.props.width === undefined && b.props.height === undefined)).toBe(true)
    }
    await ui.unmount()
  }

  const ui = await $.ui.mount({ ...BAND, surface: 'desktop' })
  await ui.press({ key: 'pick-beach' })
  // The switch names where it came from and which tile was pressed, for the reveal.
  expect(JSON.stringify(themes.at(-1))).toContain('-beach-cafe-2-')
  expect((await ui.find({ type: 'Button', key: 'pick-beach' }))?.props.dimColor).toBe(false)
  await ui.press({ key: 'pick-off' })
  expect((await ui.find({ type: 'Button', key: 'pick-off' }))?.props.dimColor).toBe(false)
  await ui.press({ key: 'pick-snow' })
  expect((await ui.find({ type: 'Button', key: 'pick-snow' }))?.props.dimColor).toBe(false)
  await ui.unmount()

})
