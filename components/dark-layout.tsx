'use client'

import React, { useState, useEffect, ReactNode } from 'react'

interface DarkLayoutProps {
  children: ReactNode
  showMouseGradient?: boolean
  showRipples?: boolean
}

export function DarkLayout({ children, showMouseGradient = true, showRipples = true }: DarkLayoutProps) {
  const [mouseGradientStyle, setMouseGradientStyle] = useState({
    left: '0px',
    top: '0px',
    opacity: 0,
  })
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    if (!showMouseGradient) return

    const handleMouseMove = (e: MouseEvent) => {
      setMouseGradientStyle({
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        opacity: 1,
      })
    }
    const handleMouseLeave = () => {
      setMouseGradientStyle(prev => ({ ...prev, opacity: 0 }))
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [showMouseGradient])

  useEffect(() => {
    if (!showRipples) return

    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY }
      setRipples(prev => [...prev, newRipple])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showRipples])

  const pageStyles = `
    #mouse-gradient-dark {
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      background-image: radial-gradient(circle, rgba(156, 163, 175, 0.05), rgba(107, 114, 128, 0.05), transparent 70%);
      transform: translate(-50%, -50%);
      will-change: left, top, opacity;
      transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
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
        {showMouseGradient && (
          <div
            id="mouse-gradient-dark"
            className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
            style={{
              left: mouseGradientStyle.left,
              top: mouseGradientStyle.top,
              opacity: mouseGradientStyle.opacity,
            }}
          ></div>
        )}

        {/* Ripples */}
        {showRipples && ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{ left: `${ripple.x}px`, top: `${ripple.y}px` }}
          ></div>
        ))}
      </div>
    </>
  )
}
