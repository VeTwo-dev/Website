'use client'

import {
  forwardRef,
  useId,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'
import { SILHOUETTE_PATH, VETWO_VIEWBOX, type TraceDef } from './geometry/vetwoV2'
import { PRESETS, type GeometryPreset } from './presets'
import { clamp01, mulberry32, selectGeometry } from './select'

export type { GeometryPreset } from './presets'

export const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'lighten', 'plus-lighter'] as const
export type CircuitBlendMode = (typeof BLEND_MODES)[number]
export type ReducedMotionPolicy = 'auto' | 'always' | 'never'
export type CircuitFit = 'contain' | 'cover'
export type CircuitPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type PointerEffects = 'none' | 'highlight'

export interface VeTwoCircuitBackgroundProps {
  // Appearance
  color?: string
  secondaryColor?: string
  glowColor?: string
  backgroundColor?: string
  /** 0..1, overall opacity. Default 1 */
  opacity?: number
  /** Base stroke width in logo units (viewBox is 2048). Default 4 */
  lineWidth?: number
  /** 0..1 strength of the glow layers. Default 0.5 */
  glowIntensity?: number
  /** 0.25..2 scales trace/pad opacity. Default 1 */
  contrast?: number
  blendMode?: CircuitBlendMode
  className?: string
  style?: CSSProperties
  // Density and geometry
  geometry?: GeometryPreset
  /** 0..1; overrides the preset. Fraction of primary traces drawn */
  density?: number
  /** 0..1; overrides the preset. Fraction of pads drawn */
  nodeDensity?: number
  /** 0..1; overrides the preset. Fraction of secondary traces drawn (scaled by density) */
  branchDensity?: number
  showNodes?: boolean
  showGlow?: boolean
  showLogoSilhouette?: boolean
  showSecondaryTraces?: boolean
  // Animation
  animated?: boolean
  /** Multiplier for all animation timing. Default 1 */
  animationSpeed?: number
  /** Signal travel speed multiplier. Default 1 */
  pulseSpeed?: number
  /** 0..1; overrides the preset. Number of simultaneous signals */
  pulseDensity?: number
  /** Pulse radius in logo units. Default 9 */
  pulseSize?: number
  /** 0..1 pulse brightness. Default 0.9 */
  pulseIntensity?: number
  drawIn?: boolean
  /** seconds. Default 2.4 */
  drawInDuration?: number
  /** Gentle breathing of the glow layer (opacity only). Default true */
  glowAnimation?: boolean
  /** false = each pulse travels once. Default true */
  loop?: boolean
  paused?: boolean
  reducedMotion?: ReducedMotionPolicy
  /** Change this value to deterministically replay draw-in and pulse sequences */
  restartKey?: string | number
  onAnimationComplete?: () => void
  // Layout
  width?: number | string
  height?: number | string
  fit?: CircuitFit
  position?: CircuitPosition
  /** Opt in to pointer reactions on pads (requires pointerEffects !== 'none') */
  interactive?: boolean
  pointerEffects?: PointerEffects
  /** Chooses which signals run and their timing offsets. Default 7 */
  seed?: number
  /** CSP nonce applied to the injected <style>. Required when style-src has no 'unsafe-inline'. */
  nonce?: string
}

export interface VeTwoCircuitBackgroundHandle {
  /** Replays the draw-in and pulse sequence */
  restart: () => void
}

const ALIGN: Record<CircuitPosition, string> = {
  center: 'xMidYMid', top: 'xMidYMin', bottom: 'xMidYMax', left: 'xMinYMid', right: 'xMaxYMid',
  'top-left': 'xMinYMin', 'top-right': 'xMaxYMin', 'bottom-left': 'xMinYMax', 'bottom-right': 'xMaxYMax',
}
const POS_CSS: Record<CircuitPosition, string> = {
  center: 'center', top: 'center top', bottom: 'center bottom', left: 'left center', right: 'right center',
  'top-left': 'left top', 'top-right': 'right top', 'bottom-left': 'left bottom', 'bottom-right': 'right bottom',
}
const MAX_PULSES = 14
const TRAVEL_FRACTION = 0.6 // keyframes: 0-60% travel, 60-100% idle; keep in sync with CSS below

const num = (n: number | undefined, fallback: number, min: number, max: number): number =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback

const CSS = (s: string): string => `
.${s}{position:relative;overflow:hidden;pointer-events:none;background:var(--vt-bg,transparent);opacity:var(--vt-opacity,1);mix-blend-mode:var(--vt-blend,normal);contain:paint}
.${s} svg{display:block;width:100%;height:100%;pointer-events:none}
.${s} .vt-base{fill:none;stroke:var(--vt-color);stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.${s} .vt-sec{stroke:var(--vt-color2)}
.${s} .vt-glow{fill:none;stroke:var(--vt-glow);stroke-linecap:round;stroke-linejoin:round;opacity:calc(.16*var(--vt-glow-i,.5))}
.${s} .vt-pad{fill:none;stroke:var(--vt-color);vector-effect:non-scaling-stroke}
.${s} .vt-padglow{fill:var(--vt-glow);opacity:0;transform-box:fill-box;transform-origin:center}
.${s} .vt-sil{fill:none;stroke:var(--vt-color);opacity:.22;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.${s}[data-interactive="true"] .vt-hit{pointer-events:all;cursor:default}
.${s}[data-interactive="true"] .vt-hit:hover ~ .vt-padglow,.${s}[data-interactive="true"] .vt-hit:hover{opacity:1}
.${s} .vt-sig{fill:url(#${s}-sig);opacity:0;offset-rotate:0deg;display:none}
@supports (offset-path:path('M0 0')){
 .${s}[data-anim="on"] .vt-sig{display:block;animation:${s}-pulse calc(var(--vt-d)/var(--vt-speed,1)) linear var(--vt-delay) var(--vt-iter,infinite) both;animation-play-state:var(--vt-play,running)}
 .${s}[data-anim="on"] .vt-padglow{animation:${s}-flash calc(var(--vt-d)/var(--vt-speed,1)) linear var(--vt-delay) var(--vt-iter,infinite) both;animation-play-state:var(--vt-play,running)}
}
.${s}[data-anim="on"] .vt-draw{stroke-dasharray:1;animation:${s}-draw calc(var(--vt-draw,2.4s)/var(--vt-speed,1)) cubic-bezier(.4,0,.2,1) var(--vt-ddelay,0s) 1 backwards;animation-play-state:var(--vt-play,running)}
.${s}[data-anim="on"][data-glowanim="true"] .vt-glowwrap{animation:${s}-breathe calc(6s/var(--vt-speed,1)) ease-in-out infinite;animation-play-state:var(--vt-play,running)}
@keyframes ${s}-pulse{0%{offset-distance:0%;opacity:0}4%{opacity:var(--vt-pulse-i,.9)}56%{opacity:var(--vt-pulse-i,.9)}60%{offset-distance:100%;opacity:0}100%{offset-distance:100%;opacity:0}}
@keyframes ${s}-flash{0%,52%{opacity:0;transform:scale(1)}60%{opacity:var(--vt-pulse-i,.9);transform:scale(1.6)}72%,100%{opacity:0;transform:scale(1)}}
@keyframes ${s}-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes ${s}-breathe{0%,100%{opacity:.75}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.${s}[data-rm="auto"] *{animation:none!important}.${s}[data-rm="auto"] .vt-sig{display:none!important}}
`

export const VeTwoCircuitBackground = forwardRef<VeTwoCircuitBackgroundHandle, VeTwoCircuitBackgroundProps>(
  function VeTwoCircuitBackground(props, ref): ReactElement {
    const {
      color = '#6EE7B7', secondaryColor = '#10B981', glowColor = '#6EE7B7', backgroundColor,
      className, style, geometry = 'logo', showGlow = true, animated = true, drawIn = true,
      glowAnimation = true, loop = true, paused = false, reducedMotion = 'auto', restartKey,
      onAnimationComplete, width = '100%', height = '100%', fit = 'contain', position = 'center',
      interactive = false, pointerEffects = 'highlight', seed = 7, nonce,
    } = props
    const preset = PRESETS[geometry] ?? PRESETS.logo
    const opacity = num(props.opacity, 1, 0, 1)
    const lineWidth = num(props.lineWidth, 4, 0.5, 24)
    const glowIntensity = num(props.glowIntensity, 0.5, 0, 1)
    const contrast = num(props.contrast, 1, 0.25, 2)
    const animationSpeed = num(props.animationSpeed, 1, 0.05, 8)
    const pulseSpeed = num(props.pulseSpeed, 1, 0.1, 6)
    const pulseSize = num(props.pulseSize, 9, 2, 40)
    const pulseIntensity = num(props.pulseIntensity, 0.9, 0, 1)
    const drawInDuration = num(props.drawInDuration, 2.4, 0.2, 20)
    const density = clamp01(props.density ?? preset.density)
    const nodeDensity = clamp01(props.nodeDensity ?? preset.nodeDensity)
    const branchDensity = clamp01(props.branchDensity ?? preset.branchDensity)
    const pulseDensity = clamp01(props.pulseDensity ?? preset.pulseDensity)
    const showNodes = props.showNodes ?? preset.showNodes
    const showSecondaryTraces = props.showSecondaryTraces ?? preset.showSecondaryTraces
    const showLogoSilhouette = props.showLogoSilhouette ?? preset.showLogoSilhouette
    const blendMode = props.blendMode && (BLEND_MODES as readonly string[]).includes(props.blendMode) ? props.blendMode : 'normal'

    // useId is stable across SSR/hydration. Strip characters that are invalid in CSS identifiers.
    const scope = 'vt' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
    const [internalKey, setInternalKey] = useState(0)
    useImperativeHandle(ref, () => ({ restart: () => setInternalKey((k) => k + 1) }), [])

    const { traces, pads } = useMemo(
      () => selectGeometry({ preset, density, nodeDensity, branchDensity, showSecondaryTraces, showNodes }),
      [preset, density, nodeDensity, branchDensity, showSecondaryTraces, showNodes],
    )

    const running = animated && reducedMotion !== 'always'

    const pulses = useMemo(() => {
      if (!running) return []
      const primary: TraceDef[] = traces.filter((t) => t.tier === 'primary' && t.length > 160)
      const rand = mulberry32(seed)
      const order = [...primary]
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        const tmp = order[i]; order[i] = order[j]; order[j] = tmp
      } // deterministic Fisher-Yates shuffle (seeded)
      const count = Math.min(order.length, Math.round(1 + pulseDensity * (MAX_PULSES - 1)))
      return order.slice(0, count).map((t) => {
        const travel = t.length / (220 * pulseSpeed)
        return { t, duration: travel / TRAVEL_FRACTION, delay: rand() * 4 }
      })
    }, [running, traces, seed, pulseDensity, pulseSpeed])

    const padFlash = useMemo(() => {
      const m = new Map<string, { duration: number; delay: number }>()
      for (const p of pulses) {
        const pad = pads.find((q) => Math.hypot(q.x - p.t.end[0], q.y - p.t.end[1]) < 36)
        if (pad) m.set(pad.id, { duration: p.duration, delay: p.delay })
      }
      return m
    }, [pulses, pads])

    const lastDrawIndex = traces.length - 1
    const done = (e: { animationName: string }): void => {
      if (onAnimationComplete && e.animationName === `${scope}-draw`) onAnimationComplete()
    }
    const op = (base: number): number => Math.min(1, base * contrast * preset.opacityScale)
    const vars = {
      '--vt-color': color, '--vt-color2': secondaryColor, '--vt-glow': glowColor,
      '--vt-bg': backgroundColor ?? 'transparent', '--vt-opacity': opacity, '--vt-blend': blendMode,
      '--vt-glow-i': glowIntensity, '--vt-speed': animationSpeed, '--vt-pulse-i': pulseIntensity,
      '--vt-draw': `${drawInDuration}s`, '--vt-play': paused ? 'paused' : 'running',
      '--vt-iter': loop ? 'infinite' : 1,
      width, height, ...style,
    } as CSSProperties
    const key = `${restartKey ?? ''}:${internalKey}`

    return (
      <div
        className={`${scope}${className ? ` ${className}` : ''}`}
        style={vars}
        aria-hidden="true"
        data-vetwo-circuit=""
        data-geometry={geometry}
        data-anim={running ? 'on' : 'off'}
        data-rm={reducedMotion}
        data-glowanim={glowAnimation}
        data-interactive={interactive && pointerEffects !== 'none'}
      >
        <style nonce={nonce}>{CSS(scope)}</style>
        <svg
          key={key}
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${VETWO_VIEWBOX} ${VETWO_VIEWBOX}`}
          preserveAspectRatio={`${ALIGN[position]} ${fit === 'cover' ? 'slice' : 'meet'}`}
          focusable="false"
          style={{ objectPosition: POS_CSS[position] }}
        >
          <defs>
            <radialGradient id={`${scope}-sig`}>
              <stop offset="0" stopColor="#fff" stopOpacity="1" />
              <stop offset="0.35" stopColor={glowColor} stopOpacity="0.95" />
              <stop offset="1" stopColor={glowColor} stopOpacity="0" />
            </radialGradient>
          </defs>
          {showLogoSilhouette && <path className="vt-sil" d={SILHOUETTE_PATH} strokeWidth={lineWidth} />}
          {showGlow && (
            <g className="vt-glowwrap">
              {traces.filter((t) => t.tier === 'primary').map((t) => (
                <path key={t.id} className="vt-glow" d={t.d} strokeWidth={lineWidth * 5} />
              ))}
            </g>
          )}
          <g>
            {traces.map((t, i) => (
              <path
                key={t.id}
                d={t.d}
                pathLength={1}
                className={`vt-base${t.tier === 'secondary' ? ' vt-sec' : ''}${drawIn ? ' vt-draw' : ''}`}
                strokeWidth={lineWidth}
                opacity={op(t.tier === 'primary' ? 0.9 : 0.5)}
                style={drawIn ? ({ '--vt-ddelay': `${(i / Math.max(1, traces.length)) * 0.8}s` } as CSSProperties) : undefined}
                onAnimationEnd={drawIn && i === lastDrawIndex ? done : undefined}
              />
            ))}
          </g>
          <g>
            {pads.map((p) => {
              const f = padFlash.get(p.id)
              return (
                <g key={p.id}>
                  <circle className="vt-pad" cx={p.x} cy={p.y} r={p.r} strokeWidth={lineWidth} opacity={op(0.85)} />
                  {showGlow && (
                    <circle
                      className="vt-padglow" cx={p.x} cy={p.y} r={p.r * 1.1}
                      style={f ? ({ '--vt-d': `${f.duration}s`, '--vt-delay': `${f.delay}s` } as CSSProperties) : undefined}
                    />
                  )}
                  {interactive && <circle className="vt-hit" cx={p.x} cy={p.y} r={p.r * 1.6} fill="transparent" />}
                </g>
              )
            })}
          </g>
          {pulses.map(({ t, duration, delay }) => (
            <circle
              key={t.id} className="vt-sig" r={pulseSize} cx={0} cy={0}
              style={{ offsetPath: `path("${t.d}")`, '--vt-d': `${duration}s`, '--vt-delay': `${delay}s` } as CSSProperties}
            />
          ))}
        </svg>
      </div>
    )
  },
)

export default VeTwoCircuitBackground
