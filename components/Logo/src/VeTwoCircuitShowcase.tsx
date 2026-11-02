'use client'
// Dev-only showcase. Not exported from index.ts so it never ships in production bundles.
import { useRef, useState, type ReactElement } from 'react'
import { VeTwoCircuitBackground, type GeometryPreset, type VeTwoCircuitBackgroundHandle } from './index'

const PRESET_LIST: GeometryPreset[] = ['logo', 'dense', 'minimal', 'perimeter', 'ambient']

export function VeTwoCircuitShowcase(): ReactElement {
  const ref = useRef<VeTwoCircuitBackgroundHandle>(null)
  const [geometry, setGeometry] = useState<GeometryPreset>('logo')
  const [color, setColor] = useState('#6EE7B7')
  const [glowColor, setGlowColor] = useState('#10B981')
  const [density, setDensity] = useState(0.8)
  const [opacity, setOpacity] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [pulseDensity, setPulseDensity] = useState(0.5)
  const [glow, setGlow] = useState(0.5)
  const [showNodes, setShowNodes] = useState(true)
  const [animated, setAnimated] = useState(true)
  const [paused, setPaused] = useState(false)
  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number): ReactElement => (
    <label style={{ display: 'grid', gap: 2, fontSize: 12 }}>{label}: {v}
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} />
    </label>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px,280px) 1fr', gap: 16, background: '#0A0F0D', color: '#ECFDF5', padding: 16 }}>
      <fieldset style={{ display: 'grid', gap: 8, border: '1px solid #18231E', padding: 12 }}>
        <legend>Controls</legend>
        <label style={{ fontSize: 12 }}>Preset <select value={geometry} onChange={(e) => setGeometry(e.target.value as GeometryPreset)}>{PRESET_LIST.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label style={{ fontSize: 12 }}>Primary <input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></label>
        <label style={{ fontSize: 12 }}>Glow <input type="color" value={glowColor} onChange={(e) => setGlowColor(e.target.value)} /></label>
        {slider('Density', density, setDensity, 0, 1, 0.05)}
        {slider('Opacity', opacity, setOpacity, 0, 1, 0.05)}
        {slider('Anim speed', speed, setSpeed, 0.25, 3, 0.25)}
        {slider('Pulse density', pulseDensity, setPulseDensity, 0, 1, 0.1)}
        {slider('Glow', glow, setGlow, 0, 1, 0.1)}
        <label style={{ fontSize: 12 }}><input type="checkbox" checked={showNodes} onChange={(e) => setShowNodes(e.target.checked)} /> Nodes</label>
        <label style={{ fontSize: 12 }}><input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} /> Animated</label>
        <button type="button" onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
        <button type="button" onClick={() => ref.current?.restart()}>Restart</button>
      </fieldset>
      <section style={{ position: 'relative', minHeight: 520, overflow: 'hidden', border: '1px solid #18231E' }}>
        <VeTwoCircuitBackground ref={ref} className="" style={{ position: 'absolute', inset: 0 }} {...{ geometry, color, glowColor, density, opacity, animationSpeed: speed, pulseDensity, glowIntensity: glow, showNodes, animated, paused }} />
        <div style={{ position: 'relative', padding: 48 }}>
          <h2 style={{ margin: 0 }}>Hero content stays clickable</h2>
          <p style={{ color: '#9CA3AF' }}>The background has pointer-events: none by default.</p>
          <button type="button" onClick={() => window.alert('clicked through the background')}>Real button</button>
        </div>
      </section>
    </div>
  )
}
