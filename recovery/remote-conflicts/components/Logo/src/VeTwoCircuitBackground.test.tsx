import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VeTwoCircuitBackground, type VeTwoCircuitBackgroundHandle } from './index'
import { PADS, TRACES } from './geometry/vetwoV2'
import { PRESETS, type GeometryPreset } from './presets'

afterEach(cleanup)
const root = (c: HTMLElement): HTMLElement => c.querySelector('[data-vetwo-circuit]') as HTMLElement
const counts = (c: HTMLElement) => ({
  traces: c.querySelectorAll('path.vt-base').length,
  pads: c.querySelectorAll('circle.vt-pad').length,
  sigs: c.querySelectorAll('.vt-sig').length,
  sil: c.querySelectorAll('.vt-sil').length,
  total: c.querySelectorAll('svg *').length,
})
const presets = Object.keys(PRESETS) as GeometryPreset[]

describe('defaults and accessibility', () => {
  it('renders decorative, non-interactive, valid SVG by default', () => {
    const { container } = render(<VeTwoCircuitBackground />)
    const el = root(container)
    expect(el.getAttribute('aria-hidden')).toBe('true')
    const svg = el.querySelector('svg')!
    expect(svg.getAttribute('viewBox')).toBe('0 0 2048 2048')
    expect(svg.getAttribute('focusable')).toBe('false')
    expect(svg.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
    expect(el.querySelector('[tabindex], a, button')).toBeNull()
    expect(el.querySelector('.vt-hit')).toBeNull() // pointer isolation by default
    expect(el.dataset.interactive).toBe('false')
    expect(el.dataset.geometry).toBe('logo')
    expect(el.dataset.anim).toBe('on')
    expect(el.dataset.rm).toBe('auto')
  })
  it('opt-in interactivity adds hit targets only on pads', () => {
    const { container } = render(<VeTwoCircuitBackground interactive />)
    expect(root(container).dataset.interactive).toBe('true')
    expect(container.querySelectorAll('.vt-hit').length).toBe(counts(container).pads)
    cleanup()
    const r2 = render(<VeTwoCircuitBackground interactive pointerEffects="none" />)
    expect(root(r2.container).dataset.interactive).toBe('false')
  })
})

describe('geometry presets and density', () => {
  it('each preset yields a distinct rendered composition', () => {
    const sigs = presets.map((p) => {
      const { container } = render(<VeTwoCircuitBackground geometry={p} />)
      const c = counts(container)
      const s = `${c.traces}/${c.pads}/${c.sil}/${c.total}`
      cleanup()
      return s
    })
    expect(new Set(sigs).size).toBe(presets.length)
  })
  it('perimeter preset only draws silhouette-hugging traces; minimal drops secondary traces', () => {
    const per = render(<VeTwoCircuitBackground geometry="perimeter" />)
    const ids = [...per.container.querySelectorAll('path.vt-base')].map((p) => p.getAttribute('d'))
    const perimeterD = new Set(TRACES.filter((t) => t.perimeter).map((t) => t.d))
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((d) => perimeterD.has(d as string))).toBe(true)
    cleanup()
    const min = render(<VeTwoCircuitBackground geometry="minimal" />)
    expect(min.container.querySelectorAll('path.vt-sec').length).toBe(0)
  })
  it('density, nodeDensity and branchDensity change rendered element counts monotonically', () => {
    const t = (d: number) => counts(render(<VeTwoCircuitBackground geometry="dense" density={d} />).container).traces
    const a = t(0.1), b = t(0.5), c = t(1)
    cleanup()
    expect(a).toBeLessThan(b); expect(b).toBeLessThan(c)
    expect(c).toBe(TRACES.length)
    const n = (d: number) => counts(render(<VeTwoCircuitBackground nodeDensity={d} />).container).pads
    expect(n(0.2)).toBeLessThan(n(1)); expect(n(1)).toBe(PADS.length)
    const br = (d: number) => render(<VeTwoCircuitBackground branchDensity={d} density={1} />).container.querySelectorAll('path.vt-sec').length
    expect(br(0)).toBe(0); expect(br(1)).toBeGreaterThan(0)
  })
  it('show* flags remove their layers', () => {
    const { container } = render(<VeTwoCircuitBackground showNodes={false} showGlow={false} showSecondaryTraces={false} showLogoSilhouette />)
    expect(counts(container).pads).toBe(0)
    expect(container.querySelectorAll('.vt-glow,.vt-padglow').length).toBe(0)
    expect(container.querySelectorAll('path.vt-sec').length).toBe(0)
    expect(counts(container).sil).toBe(1)
  })
  it('explicit props override preset defaults', () => {
    const { container } = render(<VeTwoCircuitBackground geometry="ambient" showNodes />)
    expect(counts(container).pads).toBeGreaterThan(0)
  })
})

describe('appearance', () => {
  it('maps color/opacity/line width/glow props to CSS vars and attributes', () => {
    const { container } = render(
      <VeTwoCircuitBackground color="#ff0000" secondaryColor="#00ff00" glowColor="#0000ff" backgroundColor="#0A0F0D" opacity={0.4} lineWidth={9} glowIntensity={0.8} blendMode="screen" />,
    )
    const s = root(container).style
    expect(s.getPropertyValue('--vt-color')).toBe('#ff0000')
    expect(s.getPropertyValue('--vt-color2')).toBe('#00ff00')
    expect(s.getPropertyValue('--vt-glow')).toBe('#0000ff')
    expect(s.getPropertyValue('--vt-bg')).toBe('#0A0F0D')
    expect(s.getPropertyValue('--vt-opacity')).toBe('0.4')
    expect(s.getPropertyValue('--vt-glow-i')).toBe('0.8')
    expect(s.getPropertyValue('--vt-blend')).toBe('screen')
    expect(container.querySelector('path.vt-base')!.getAttribute('stroke-width')).toBe('9')
  })
  it('contrast scales trace opacity', () => {
    const o = (c: number) => Number(render(<VeTwoCircuitBackground contrast={c} />).container.querySelector('path.vt-base')!.getAttribute('opacity'))
    expect(o(0.5)).toBeLessThan(o(1))
  })
  it('clamps invalid values and rejects unknown blend modes', () => {
    const { container } = render(
      // @ts-expect-error deliberately invalid blend mode
      <VeTwoCircuitBackground opacity={5} lineWidth={Number.NaN} density={-3} animationSpeed={-1} blendMode="bogus" />,
    )
    const s = root(container).style
    expect(s.getPropertyValue('--vt-opacity')).toBe('1')
    expect(s.getPropertyValue('--vt-blend')).toBe('normal')
    expect(Number(s.getPropertyValue('--vt-speed'))).toBeGreaterThan(0)
    expect(container.querySelector('path.vt-base')!.getAttribute('stroke-width')).toBe('4')
    expect(counts(container).traces).toBeGreaterThan(0) // density clamped to 0 still keeps the primary spine
  })
  it('className and style pass through; width/height configurable', () => {
    const { container } = render(<VeTwoCircuitBackground className="absolute inset-0" style={{ zIndex: 1 }} width={320} height="50%" />)
    const el = root(container)
    expect(el.className).toContain('absolute inset-0')
    expect(el.style.zIndex).toBe('1'); expect(el.style.width).toBe('320px'); expect(el.style.height).toBe('50%')
  })
})

describe('layout', () => {
  it('fit and position drive preserveAspectRatio', () => {
    const p = (props: object) => render(<VeTwoCircuitBackground {...props} />).container.querySelector('svg')!.getAttribute('preserveAspectRatio')
    expect(p({ fit: 'cover' })).toBe('xMidYMid slice')
    expect(p({ fit: 'contain', position: 'bottom-right' })).toBe('xMaxYMax meet')
    expect(p({ fit: 'cover', position: 'top' })).toBe('xMidYMin slice')
  })
})

describe('animation, pause, restart, reduced motion', () => {
  it('animated=false renders no signals and disables animation', () => {
    const { container } = render(<VeTwoCircuitBackground animated={false} />)
    expect(root(container).dataset.anim).toBe('off')
    expect(counts(container).sigs).toBe(0)
  })
  it('pulseDensity changes signal count; pulses are bounded', () => {
    const n = (d: number) => counts(render(<VeTwoCircuitBackground geometry="dense" pulseDensity={d} />).container).sigs
    expect(n(0)).toBe(1); expect(n(1)).toBeGreaterThan(n(0)); expect(n(1)).toBeLessThanOrEqual(14)
  })
  it('paused / loop / speed are CSS variables (no re-render churn)', () => {
    const { container } = render(<VeTwoCircuitBackground paused loop={false} animationSpeed={2} />)
    const s = root(container).style
    expect(s.getPropertyValue('--vt-play')).toBe('paused')
    expect(s.getPropertyValue('--vt-iter')).toBe('1')
    expect(s.getPropertyValue('--vt-speed')).toBe('2')
  })
  it('reducedMotion="always" is static with a complete composition; "never" ignores media query', () => {
    const a = render(<VeTwoCircuitBackground reducedMotion="always" />)
    expect(root(a.container).dataset.anim).toBe('off')
    expect(counts(a.container).sigs).toBe(0)
    expect(counts(a.container).traces).toBeGreaterThan(0)
    cleanup()
    const n = render(<VeTwoCircuitBackground reducedMotion="never" />)
    expect(root(n.container).dataset.rm).toBe('never')
    expect(root(n.container).querySelector('style')!.textContent).toContain('[data-rm="auto"]') // media query only targets "auto"
  })
  it('restartKey and imperative restart() remount the animated layer', () => {
    const ref = createRef<VeTwoCircuitBackgroundHandle>()
    const { container, rerender } = render(<VeTwoCircuitBackground ref={ref} restartKey={1} />)
    const first = container.querySelector('svg')
    rerender(<VeTwoCircuitBackground ref={ref} restartKey={2} />)
    const second = container.querySelector('svg')
    expect(second).not.toBe(first)
    act(() => ref.current!.restart())
    expect(container.querySelector('svg')).not.toBe(second)
  })
  it('fires onAnimationComplete once when the final draw-in animation ends', () => {
    const cb = vi.fn()
    const { container } = render(<VeTwoCircuitBackground onAnimationComplete={cb} />)
    const scope = root(container).className.split(' ')[0]
    const paths = container.querySelectorAll('path.vt-base')
    const ev = (name: string) => Object.assign(new Event('animationend', { bubbles: true }), { animationName: name })
    paths[0]!.dispatchEvent(ev(`${scope}-draw`)) // not the last path
    expect(cb).not.toHaveBeenCalled()
    paths[paths.length - 1]!.dispatchEvent(ev(`${scope}-draw`))
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

describe('determinism and isolation', () => {
  it('SSR markup is identical across renders and with matching seeds', () => {
    const a = renderToString(<VeTwoCircuitBackground seed={3} />)
    const b = renderToString(<VeTwoCircuitBackground seed={3} />)
    expect(a).toBe(b)
    const strip = (s: string) => s.replace(/vt[:\w-]*?(?=[-"\s{.])/g, 'vt')
    expect(strip(renderToString(<VeTwoCircuitBackground seed={3} />))).not.toBe(strip(renderToString(<VeTwoCircuitBackground seed={4} />)))
  })
  it('multiple instances keep independent scopes and configuration', () => {
    const { container } = render(
      <>
        <VeTwoCircuitBackground geometry="minimal" color="#111111" />
        <VeTwoCircuitBackground geometry="dense" color="#222222" />
      </>,
    )
    const [a, b] = [...container.querySelectorAll<HTMLElement>('[data-vetwo-circuit]')]
    expect(a!.className.split(' ')[0]).not.toBe(b!.className.split(' ')[0])
    expect(a!.style.getPropertyValue('--vt-color')).toBe('#111111')
    expect(b!.style.getPropertyValue('--vt-color')).toBe('#222222')
    expect(a!.querySelectorAll('path.vt-base').length).toBeLessThan(b!.querySelectorAll('path.vt-base').length)
    const ids = [...container.querySelectorAll('radialGradient')].map((g) => g.id)
    expect(new Set(ids).size).toBe(2)
  })
  it('never mutates shared geometry', () => {
    const snap = JSON.stringify({ TRACES, PADS })
    render(<VeTwoCircuitBackground geometry="dense" seed={99} pulseDensity={1} />)
    render(<VeTwoCircuitBackground geometry="minimal" seed={1} />)
    expect(JSON.stringify({ TRACES, PADS })).toBe(snap)
    expect(Object.isFrozen(TRACES)).toBe(true)
    expect(Object.isFrozen(PADS)).toBe(true)
    expect(Object.isFrozen(TRACES[0])).toBe(true)
  })
})

describe('geometry data', () => {
  it('is bounded and inside the logo viewBox', () => {
    expect(TRACES.length).toBeLessThan(100)
    for (const t of TRACES) expect(t.d).toMatch(/^M[\d. L-]+$/)
    for (const p of PADS) { expect(p.x).toBeGreaterThan(0); expect(p.x).toBeLessThan(2048); expect(p.r).toBeGreaterThan(5) }
  })
})
