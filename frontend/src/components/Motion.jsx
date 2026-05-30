import React, { useState, useEffect, useRef } from 'react'

export function AnimatedNumber({ value, duration = 800, className = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const start = display
    const diff = value - start
    if (diff === 0) return
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + diff * eased))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(ref.current)
  }, [value, duration])

  return <span className={className}>{display}</span>
}

export function Skeleton({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-md bg-[var(--bg-inset)] animate-pulse ${className}`} />
      ))}
    </>
  )
}

export function ProgressBar({ value, color, className = '' }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 50)
    return () => clearTimeout(timer)
  }, [value])

  const barColor = color || (value >= 70 ? 'var(--success)' : value >= 40 ? 'var(--warning)' : 'var(--danger)')
  return (
    <div className={`h-1.5 rounded-full bg-[var(--bg-inset)] overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${width}%`, backgroundColor: barColor }} />
    </div>
  )
}

export function FadeIn({ children, delay = 0, className = '' }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}>
      {children}
    </div>
  )
}

export function Stagger({ children, stagger = 50, className = '' }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <FadeIn delay={i * stagger}>{child}</FadeIn>
      ))}
    </div>
  )
}

export function Tooltip({ children, content, side = 'top' }) {
  const [show, setShow] = useState(false)
  const pos = { top: 'bottom-full left-1/2 -translate-x-1/2 mb-2', bottom: 'top-full left-1/2 -translate-x-1/2 mt-2', left: 'right-full top-1/2 -translate-y-1/2 mr-2', right: 'left-full top-1/2 -translate-y-1/2 ml-2' }

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute z-50 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border)] shadow-lg text-[11px] text-[var(--text-primary)] whitespace-nowrap pointer-events-none ${pos[side]}`}>
          {content}
        </div>
      )}
    </div>
  )
}

export function Pulse({ children, className = '' }) {
  return <div className={`relative ${className}`}>{children}<div className="absolute inset-0 rounded-[inherit] animate-ping opacity-20" /></div>
}
