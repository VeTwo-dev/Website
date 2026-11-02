export type GeometryPreset = 'logo' | 'dense' | 'minimal' | 'perimeter' | 'ambient'

export interface PresetDefaults {
  density: number
  branchDensity: number
  nodeDensity: number
  showSecondaryTraces: boolean
  showLogoSilhouette: boolean
  showNodes: boolean
  /** restricts the trace set before density is applied */
  traceFilter: 'all' | 'perimeter' | 'primary'
  opacityScale: number
  pulseDensity: number
}

/** Every preset is a distinct, deterministic default set; explicit props always win. */
export const PRESETS: Readonly<Record<GeometryPreset, PresetDefaults>> = Object.freeze({
  logo: { density: 0.8, branchDensity: 0.6, nodeDensity: 0.7, showSecondaryTraces: true, showLogoSilhouette: true, showNodes: true, traceFilter: 'all', opacityScale: 1, pulseDensity: 0.5 },
  dense: { density: 1, branchDensity: 1, nodeDensity: 1, showSecondaryTraces: true, showLogoSilhouette: false, showNodes: true, traceFilter: 'all', opacityScale: 1, pulseDensity: 0.8 },
  minimal: { density: 0.45, branchDensity: 0, nodeDensity: 0.25, showSecondaryTraces: false, showLogoSilhouette: false, showNodes: true, traceFilter: 'primary', opacityScale: 1, pulseDensity: 0.3 },
  perimeter: { density: 1, branchDensity: 0.4, nodeDensity: 0.3, showSecondaryTraces: true, showLogoSilhouette: true, showNodes: true, traceFilter: 'perimeter', opacityScale: 1, pulseDensity: 0.4 },
  ambient: { density: 0.7, branchDensity: 0.8, nodeDensity: 0.4, showSecondaryTraces: true, showLogoSilhouette: false, showNodes: false, traceFilter: 'all', opacityScale: 0.45, pulseDensity: 0.2 },
})
