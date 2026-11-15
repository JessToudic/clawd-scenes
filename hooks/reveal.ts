import { KIT_CSS } from './kit.ts'

// A scene switch drawn as one SVG: the old scene underneath, held still, and the
// new one on top, clipped by a circle that grows from the tile that was picked.
// With no new scene (Default), the circle instead cuts a growing hole in the old
// one, down to the app's own look.

const LIMIT = 131_072
const RADIUS = '142%' // of the window's normalised diagonal: reaches the far corner from anywhere
const LIFT = 200 // px from the window's foot up to the tiles
export const DURATION = 0.75 // s
// The circle opens as a disc, not a point, and grows fastest at first, so it
// covers the chat column quickly: the app retints that panel all at once.
const START = '12%'
const EASE = 'cubic-bezier(0.25, 0.6, 0.3, 1)'

export type Origin = {
  tile: number // which tile, counting from the left
  count: number // how many tiles the row holds
  pitch: number // px between tile centres
}

// Prefixes every id, class and keyframe name in a scene so two scenes can share
// one document without their styles or references colliding.
export function namespaced(source: string, p: string): string {
  const frames = new Set([...source.matchAll(/@keyframes\s+([\w-]+)/g)].map(m => m[1] as string))
  const css = (text: string) =>
    text
      .replace(/(^|[^\w.#-])\.(-?[A-Za-z_][\w-]*)/g, `$1.${p}$2`)
      .replace(/@keyframes\s+([\w-]+)/g, `@keyframes ${p}$1`)
      .replace(/(animation(?:-name)?\s*:\s*)([^;}]*)/g, (_, head: string, value: string) =>
        head + value.replace(/[\w-]+/g, word => (frames.has(word) ? p + word : word)),
      )
  return source
    .replace(/<style>([\s\S]*?)<\/style>/g, (_, text: string) => `<style>${css(text)}</style>`)
    .replace(/(\s)id="([^"]+)"/g, `$1id="${p}$2"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${p}$1"`)
    .replace(/(\s)class="([^"]*)"/g, (_, space: string, list: string) =>
      `${space}class="${list.split(/\s+/).filter(Boolean).map(c => p + c).join(' ')}"`,
    )
}

// The outgoing scene, held still for the moment it is on screen: without its
// motion it needs no kit animations or per-Clawd timings, which keeps the two
// scenes together under the size limit.
function still(source: string): string {
  const trimmed = source
    .replace(KIT_CSS, '')
    .replace(/ style="[^"]*"/g, '')
    .replace(/ (class|style)=""/g, '')
  return namespaced(trimmed, '_')
}

export function reveal(next: string | undefined, prev: string | undefined, at: Origin): string {
  const dx = Math.round((at.tile - (at.count - 1) / 2) * at.pitch)
  const circle = (fill: string) =>
    `<circle class="cw-hole" cx="50%" cy="100%" r="${RADIUS}" transform="translate(${dx} -${LIFT})" fill="${fill}"/>`
  const css = `
    .cw-hole { animation: cw-grow ${DURATION}s ${EASE} both }
    @keyframes cw-grow { from { r: ${START} } to { r: ${RADIUS} } }
    .cw-old * { animation-play-state: paused !important }
    .cw-old { animation: cw-gone 0s linear ${DURATION + 0.05}s both !important }
    @keyframes cw-gone { to { visibility: hidden } }
    @media (prefers-reduced-motion: reduce) {
      .cw-hole, .cw-old { animation: none !important }
      .cw-old { visibility: hidden }
    }
  `
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><style>${css}</style>`
  if (next === undefined) {
    if (prev === undefined) return `${open}</svg>`
    const mask = `<defs><mask id="cw-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect width="100%" height="100%" fill="#fff"/>${circle('#000')}</mask></defs>`
    return `${open}${mask}<g class="cw-old" mask="url(#cw-mask)">${still(prev)}</g></svg>`
  }
  const head = `${open}<defs><clipPath id="cw-clip">${circle('#000')}</clipPath></defs>`
  const top = `<g clip-path="url(#cw-clip)">${next}</g></svg>`
  const under = prev === undefined ? '' : `<g class="cw-old">${still(prev)}</g>`
  const both = head + under + top
  if (both.length <= LIMIT) return both
  const alone = head + top
  return alone.length <= LIMIT ? alone : next
}
