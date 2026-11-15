export type SceneId = 'cafe' | 'beach' | 'garden' | 'snow' | 'campfire' | 'off'

declare module 'claude-code' {
  interface PluginState {
    clawd: { scene: string; band: boolean }
  }
}
