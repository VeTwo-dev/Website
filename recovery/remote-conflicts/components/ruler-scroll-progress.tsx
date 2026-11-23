'use client'

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring} from 'motion/react'
import {  useState } from 'react'

export function RulerScrollProgress() {
  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const springValue = useSpring(scrollYProgress, { damping: 30, mass: 0.4, stiffness: 220 })
  const value = shouldReduceMotion ? scrollYProgress : springValue

  const [progress, setProgress] = useState(0)
  useMotionValueEvent(value, 'change', (latest) => {
    setProgress(latest * 100)
  })

  const ticks = []
  for (let v = 0; v <= 100; v += 1) ticks.push(v)

  // const fillX = useTransform(value, (latest) => `${-100 * (1 - latest)}%`)

  return (
    <div className="relative w-full">
      <div className="flex h-6 items-end gap-px overflow-hidden border-b border-border bg-transparent px-2">
        {ticks.map((t) => {
          const major = t % 10 === 0
          const active = t <= progress
          return (
            <span
              key={t}
              className={`flex h-full flex-1 flex-col items-center justify-end pb-0.5 text-[8px] font-mono ${
                active ? 'text-accent' : 'text-secondary/40'
              }`}
            >
              <span className={major ? 'h-3 w-px bg-current' : 'h-1.5 w-px bg-current/60'} />
              {major ? `${t}%` : ''}
            </span>
          )
        })}
      </div>
      <motion.div
        className="pointer-events-none absolute inset-x-1 bottom-0 h-0.5 rounded bg-accent"
        style={{ scaleX: value, transformOrigin: 'left' }}
      />
    </div>
  )
}

export default RulerScrollProgress
