import { PADS, TRACES, type PadDef, type TraceDef } from './geometry/vetwoV2'
import type { PresetDefaults } from './presets'

const clamp01 = (n: number): number => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)
export { clamp01 }

/** mulberry32: tiny deterministic PRNG so `seed` gives identical output on server and client. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SelectionInput {
  preset: PresetDefaults
  density: number
  branchDensity: number
  nodeDensity: number
  showSecondaryTraces: boolean
  showNodes: boolean
}

/** Pure + deterministic: never mutates the shared frozen geometry. */
export function selectGeometry(i: SelectionInput): { traces: TraceDef[]; pads: PadDef[] } {
  const pool = TRACES.filter((t) =>
    i.preset.traceFilter === 'perimeter' ? t.perimeter : i.preset.traceFilter === 'primary' ? t.tier === 'primary' : true,
  )
  const primary = pool.filter((t) => t.tier === 'primary')
  const rest = pool.filter((t) => !primary.includes(t))
  const keepP = Math.max(primary.length ? 1 : 0, Math.ceil(primary.length * clamp01(i.density)))
  const keepS = i.showSecondaryTraces ? Math.ceil(rest.length * clamp01(i.density) * clamp01(i.branchDensity)) : 0
  const traces = [...primary.slice(0, keepP), ...rest.slice(0, keepS)]
  const pads = i.showNodes ? PADS.filter((p) => p.rank < Math.ceil(PADS.length * clamp01(i.nodeDensity))) : []
  return { traces, pads }
}
