'use client'

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

export function AnimatedLanding() {
  const reducedMotion = useReducedMotion()
  const gradientRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const rippleIdRef = useRef(0)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  // マウス追従グラデーション: React の再レンダーを介さず ref + rAF で直接更新する
  useEffect(() => {
    if (reducedMotion) return
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
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return
    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: rippleIdRef.current++, x: e.clientX, y: e.clientY }
      setRipples(prev => [...prev, newRipple])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [reducedMotion])

  const pageStyles = `
    #mouse-gradient-react {
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
    @keyframes word-appear {
      0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(2px); }
      50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(1px); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
    }
    @keyframes grid-draw {
      0% { stroke-dashoffset: 1000; opacity: 0; }
      50% { opacity: 0.3; }
      100% { stroke-dashoffset: 0; opacity: 0.15; }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.1); }
    }
    .word-animate {
      display: inline-block;
      margin: 0 0.1em;
      animation: word-appear 0.8s ease-out both;
    }
    .word-animate:hover {
      color: #cbd5e1;
      transform: translateY(-2px);
      text-shadow: 0 0 20px rgba(203, 213, 225, 0.5);
    }
    .fade-in-animate {
      animation: word-appear 0.8s ease-out both;
    }
    .word-animate:nth-child(1), .fade-in-animate:nth-child(1) { animation-delay: 0ms; }
    .word-animate:nth-child(2), .fade-in-animate:nth-child(2) { animation-delay: 120ms; }
    .word-animate:nth-child(3), .fade-in-animate:nth-child(3) { animation-delay: 240ms; }
    .word-animate:nth-child(4), .fade-in-animate:nth-child(4) { animation-delay: 360ms; }
    .word-animate:nth-child(5), .fade-in-animate:nth-child(5) { animation-delay: 480ms; }
    .word-animate:nth-child(6), .fade-in-animate:nth-child(6) { animation-delay: 600ms; }
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
    .corner-element-animate {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(203, 213, 225, 0.2);
      animation: word-appear 1s ease-out both;
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
    @media (prefers-reduced-motion: reduce) {
      #mouse-gradient-react { display: none; }
      .word-animate, .fade-in-animate, .corner-element-animate {
        animation: none;
        opacity: 1;
        transform: none;
        filter: none;
      }
      .grid-line { animation: none; opacity: 0.15; stroke-dashoffset: 0; }
      .detail-dot { animation: none; opacity: 0.2; }
      .ripple-effect { animation: none; }
    }
  `

  return (
    <>
      <style>{pageStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-slate-100 overflow-hidden relative">

        {/* SVG Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="gridReactDarkResponsive" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(100, 116, 139, 0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridReactDarkResponsive)" />
          <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: '0.5s' }} />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: '1s' }} />
          <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: '1.5s' }} />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: '2s' }} />
          <line x1="50%" y1="0" x2="50%" y2="100%" className="grid-line" style={{ animationDelay: '2.5s', opacity: '0.05' }} />
          <line x1="0" y1="50%" x2="100%" y2="50%" className="grid-line" style={{ animationDelay: '3s', opacity: '0.05' }} />
          <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3s' }} />
          <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: '3.2s' }} />
          <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.4s' }} />
          <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: '3.6s' }} />
          <circle cx="50%" cy="50%" r="1.5" className="detail-dot" style={{ animationDelay: '4s' }} />
        </svg>

        {/* Corner Elements */}
        <div className="corner-element-animate top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8" style={{ animationDelay: '4s' }}>
          <div className="absolute top-0 left-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8" style={{ animationDelay: '4.2s' }}>
          <div className="absolute top-0 right-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8" style={{ animationDelay: '4.4s' }}>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>
        <div className="corner-element-animate bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8" style={{ animationDelay: '4.6s' }}>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-slate-300 opacity-30 rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col justify-between items-center px-6 py-10 sm:px-8 sm:py-12 md:px-16 md:py-20">

          {/* Top Section */}
          <div className="text-center">
            <p className="text-sm sm:text-base md:text-lg font-mono font-light text-slate-300 uppercase tracking-[0.2em] opacity-80">
              <span className="word-animate">No</span>
              <span className="word-animate">more</span>
              <span className="word-animate">confusion.</span>
            </p>
            <div className="mt-5 w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
          </div>

          {/* Hero Section */}
          <div className="text-center w-full px-4 sm:px-6 lg:px-8 relative">
            <p className="fade-in-animate text-xs sm:text-sm font-mono font-light text-slate-400 uppercase tracking-[0.2em] mb-4">
              File Submission, Simplified.
            </p>
            <h1 className="fade-in-animate text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight leading-tight tracking-tight text-slate-50 text-balance">
              素材回収、もう催促しない。
            </h1>
            <p className="fade-in-animate mt-6 text-lg sm:text-xl md:text-2xl font-light text-slate-300 leading-relaxed max-w-2xl mx-auto">
              クライアントはログイン不要。1つのURLで素材が集まり、OK/NGの検収まで完結します。
            </p>

            {/* CTA Button */}
            <div className="fade-in-animate mt-16">
              <Button
                size="lg"
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-10 py-7 text-xl rounded-lg transition-[background-color,transform] duration-300 hover:scale-105"
                asChild
              >
                <Link href="/dashboard">無料ではじめる</Link>
              </Button>
              <p className="mt-4 text-sm text-slate-400 font-light">
                クレジットカード不要・クライアント側は登録不要
              </p>
            </div>

            {/* Side Lines */}
            <div className="fade-in-animate absolute -left-6 sm:-left-8 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-px bg-slate-300"></div>
            <div className="fade-in-animate absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-px bg-slate-300"></div>
          </div>

          {/* How It Works Section */}
          <div className="w-full max-w-6xl mx-auto mt-32 mb-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-slate-50 mb-4 tracking-tight text-balance">
                使い方
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-colors duration-300">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <span className="text-2xl font-light text-emerald-400">1</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">あなた</p>
                <p className="text-lg font-light text-slate-100">プロジェクトを作ってURLを共有</p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-colors duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                  <span className="text-2xl font-light text-blue-400">2</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">クライアント</p>
                <p className="text-lg font-light text-slate-100">クライアントはログイン不要でファイルを提出</p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-colors duration-300">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                  <span className="text-2xl font-light text-emerald-400">3</span>
                </div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">あなた</p>
                <p className="text-lg font-light text-slate-100">OK/NGで検収、確定版だけが残る</p>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center">
            <div className="mb-5 w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
            <p className="text-sm sm:text-base md:text-lg font-mono font-light text-slate-300 uppercase tracking-[0.2em] opacity-80">
              <span className="word-animate">Simple,</span>
              <span className="word-animate">organized,</span>
              <span className="word-animate">seamless.</span>
            </p>
          </div>
        </div>

        {/* Mouse Gradient */}
        {!reducedMotion && (
          <div
            ref={gradientRef}
            id="mouse-gradient-react"
            className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
            style={{ opacity: 0 }}
            aria-hidden="true"
          ></div>
        )}

        {/* Ripples */}
        {!reducedMotion && ripples.map(ripple => (
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
