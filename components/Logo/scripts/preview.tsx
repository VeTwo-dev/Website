import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { writeFileSync } from 'node:fs'
import { VeTwoCircuitBackground } from '../src'
const css = `.vt-base{fill:none;stroke:#6EE7B7;stroke-linecap:round}.vt-sec{stroke:#10B981}.vt-glow{fill:none;stroke:#6EE7B7;opacity:.08;stroke-linecap:round}.vt-pad{fill:none;stroke:#6EE7B7}.vt-sil{fill:none;stroke:#6EE7B7;opacity:.22}.vt-padglow,.vt-sig{display:none}`
for (const g of ['logo','dense','minimal','perimeter','ambient'] as const) {
  const html = renderToStaticMarkup(<VeTwoCircuitBackground geometry={g} animated={false} />)
  const svg = html.match(/<svg[\s\S]*<\/svg>/)![0].replace('<svg ', `<svg width="700" height="700" `).replace('<defs>', `<style>${css}</style><rect width="2048" height="2048" fill="#0A0F0D"/><defs>`)
  const count = (svg.match(/<(path|circle)\b/g) ?? []).length
  console.log(g, 'path+circle elements:', count)
  writeFileSync(`/home/claude/prev-${g}.svg`, svg)
}
