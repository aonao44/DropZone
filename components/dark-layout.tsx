'use client'

import React, { useEffect, useRef, useState, useSyncExternalStore, ReactNode } from 'react'

interface DarkLayoutProps {
  children: ReactNode
  showMouseGradient?: boolean
  showRipples?: boolean
}

// prefers-reduced-motion の購読（SSR では false）
function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )
}

export function DarkLayout({ children, showMouseGradient = true, showRipples = true }: DarkLayoutProps) {
  const reducedMotion = useReducedMotion()
  const gradientRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const rippleIdRef = useRef(0)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  // マウス追従グラデーション: React の再レンダーを介さず ref + rAF で直接更新する
  useEffect(() => {
    if (!showMouseGradient || reducedMotion) return
    const el = gradientRef.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      lastPosRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        el.style.transform = `translate(${lastPosRef.current.x}px, ${lastPosRef.current.y}px) translate(-50%, -50%)`
        el.style.opacity = '1'
      })
    }
    const handleMouseLeave = () => {
      el.style.opacity = '0'
    }
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showMouseGradient, reducedMotion])

  useEffect(() => {
    if (!showRipples || reducedMotion) return

    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: rippleIdRef.current++, x: e.clientX, y: e.clientY }
      setRipples(prev => [...prev, newRipple])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showRipples, reducedMotion])

  const pageStyles = `
    #mouse-gradient-dark {
      position: fixed;
      left: 0;
      top: 0;
      pointer-events: none;
      border-radius: 9999px;
      background-image: radial-gradient(circle, rgba(156, 163, 175, 0.05), rgba(107, 114, 128, 0.05), transparent 70%);
      transform: translate(-100px, -100px) translate(-50%, -50%);
      will-change: transform, opacity;
      transition: opacity 300ms ease-out;
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.1); }
    }
    .ripple-effect {
      position: fixed;
      width: 4px;
      height: 4px;
      background: rgba(203, 213, 225, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: pulse-glow 1s ease-out forwards;
      z-index: 9999;
    }
    @keyframes grid-draw {
      0% { stroke-dashoffset: 1000; opacity: 0; }
      50% { opacity: 0.3; }
      100% { stroke-dashoffset: 0; opacity: 0.15; }
    }
    .grid-line {
      stroke: #94a3b8;
      stroke-width: 0.5;
      opacity: 0;
      stroke-dasharray: 5 5;
      stroke-dashoffset: 1000;
      animation: grid-draw 2s ease-out forwards;
    }
    .detail-dot {
      fill: #cbd5e1;
      opacity: 0;
      animation: pulse-glow 3s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      #mouse-gradient-dark { display: none; }
      .grid-line, .detail-dot, .ripple-effect { animation: none; }
      .grid-line { opacity: 0.15; stroke-dashoffset: 0; }
      .detail-dot { opacity: 0.2; }
    }
  `

  return (
    <>
      <style>{pageStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100 overflow-x-hidden relative">

        {/* SVG Grid Pattern */}
        <svg className="fixed inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="gridDarkLayout" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridDarkLayout)" />
          <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
          <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
          <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
          <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
          <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
        </svg>

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Mouse Gradient */}
        {showMouseGradient && !reducedMotion && (
          <div
            ref={gradientRef}
            id="mouse-gradient-dark"
            className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
            style={{ opacity: 0 }}
            aria-hidden="true"
          ></div>
        )}

        {/* Ripples */}
        {showRipples && !reducedMotion && ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
            aria-hidden="true"
          ></div>
        ))}
      </div>
    </>
  )
}
