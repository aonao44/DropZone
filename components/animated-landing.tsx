'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AnimatedLanding() {
  const [mouseGradientStyle, setMouseGradientStyle] = useState({
    left: '0px',
    top: '0px',
    opacity: 0,
  })
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const animateWords = () => {
      const wordElements = document.querySelectorAll('.word-animate')
      wordElements.forEach(word => {
        const delay = parseInt(word.getAttribute('data-delay') || '0')
        setTimeout(() => {
          if (word) (word as HTMLElement).style.animation = 'word-appear 0.8s ease-out forwards'
        }, delay)
      })
    }
    const timeoutId = setTimeout(animateWords, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY }
      setRipples(prev => [...prev, newRipple])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 1000)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    const wordElements = document.querySelectorAll('.word-animate')
    const handleMouseEnter = (e: Event) => {
      if (e.target) (e.target as HTMLElement).style.textShadow = '0 0 20px rgba(203, 213, 225, 0.5)'
    }
    const handleMouseLeave = (e: Event) => {
      if (e.target) (e.target as HTMLElement).style.textShadow = 'none'
    }
    wordElements.forEach(word => {
      word.addEventListener('mouseenter', handleMouseEnter)
      word.addEventListener('mouseleave', handleMouseLeave)
    })
    return () => {
      wordElements.forEach(word => {
        if (word) {
          word.removeEventListener('mouseenter', handleMouseEnter)
          word.removeEventListener('mouseleave', handleMouseLeave)
        }
      })
    }
  }, [])

  const pageStyles = `
    #mouse-gradient-react {
      position: fixed;
      pointer-events: none;
      border-radius: 9999px;
      background-image: radial-gradient(circle, rgba(156, 163, 175, 0.05), rgba(107, 114, 128, 0.05), transparent 70%);
      transform: translate(-50%, -50%);
      will-change: left, top, opacity;
      transition: left 70ms linear, top 70ms linear, opacity 300ms ease-out;
    }
    @keyframes word-appear {
      0% { opacity: 0; transform: translateY(30px) scale(0.8); filter: blur(10px); }
      50% { opacity: 0.8; transform: translateY(10px) scale(0.95); filter: blur(2px); }
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
      opacity: 0;
      margin: 0 0.1em;
      transition: color 0.3s ease, transform 0.3s ease;
    }
    .word-animate:hover {
      color: #cbd5e1;
      transform: translateY(-2px);
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
    .corner-element-animate {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(203, 213, 225, 0.2);
      opacity: 0;
      animation: word-appear 1s ease-out forwards;
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
            <h2 className="text-sm sm:text-base md:text-lg font-mono font-light text-slate-300 uppercase tracking-[0.2em] opacity-80">
              <span className="word-animate" data-delay="0">No</span>
              <span className="word-animate" data-delay="300">more</span>
              <span className="word-animate" data-delay="600">confusion.</span>
            </h2>
            <div className="mt-5 w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
          </div>

          {/* Hero Section */}
          <div className="text-center w-full px-4 sm:px-6 lg:px-8 relative">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight leading-tight tracking-tight text-slate-50">
              <div className="mb-6 md:mb-8">
                <span className="word-animate" data-delay="700">File</span>
                <span className="word-animate" data-delay="850">Submission,</span>
                <span className="word-animate" data-delay="1000">Simplified.</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-thin text-slate-300 leading-relaxed tracking-wide">
                <span className="word-animate" data-delay="1400">デザイナーと</span>
                <span className="word-animate" data-delay="1550">クライアント</span>
                <span className="word-animate" data-delay="1700">間での</span>
                <span className="word-animate" data-delay="1850">素材提出を</span>
                <span className="word-animate" data-delay="2000">スムーズに。</span>
              </div>
            </h1>

            {/* CTA Button */}
            <div className="mt-16 opacity-0" style={{ animation: 'word-appear 1s ease-out forwards', animationDelay: '2.5s' }}>
              <Button
                size="lg"
                className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium px-10 py-7 text-xl rounded-lg transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/dashboard">無料ではじめる</Link>
              </Button>

              {/* Trial Period Notice */}
              <div className="mt-6 text-sm sm:text-base text-slate-400 font-light">
                <p className="mb-1">🎉 お試し期間実施中！</p>
                <p className="text-xs sm:text-sm text-slate-500">
                  3プロジェクト × 10ファイル (1ファイル最大8MB) まで無料
                </p>
              </div>
            </div>

            {/* Side Lines */}
            <div className="absolute -left-6 sm:-left-8 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-px bg-slate-300 opacity-0" style={{ animation: 'word-appear 1s ease-out forwards', animationDelay: '3.2s' }}></div>
            <div className="absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2 w-3 sm:w-4 h-px bg-slate-300 opacity-0" style={{ animation: 'word-appear 1s ease-out forwards', animationDelay: '3.4s' }}></div>
          </div>

          {/* How It Works Section */}
          <div className="w-full max-w-6xl mx-auto mt-32 mb-20 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-slate-50 mb-4 tracking-tight">
                使い方
              </h2>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
            </div>

            {/* Client Flow */}
            <div className="mb-20">
              <h3 className="text-xl sm:text-2xl font-light text-slate-100 mb-8 text-center">
                クライアント側
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                    <span className="text-2xl font-light text-emerald-400">1</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-100 mb-2">プロジェクト作成</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    新規プロジェクトを作成。デザイナー情報を入力するだけ。
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                    <span className="text-2xl font-light text-emerald-400">2</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-100 mb-2">URLを共有</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    生成された提出フォームURLをコピーして、デザイナーに送信。
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                    <span className="text-2xl font-light text-emerald-400">3</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-100 mb-2">提出を確認</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    デザイナーが提出したファイルをダッシュボードで確認・ダウンロード。
                  </p>
                </div>
              </div>
            </div>

            {/* Designer Flow */}
            <div>
              <h3 className="text-xl sm:text-2xl font-light text-slate-100 mb-8 text-center">
                デザイナー側
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                    <span className="text-2xl font-light text-blue-400">1</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-100 mb-2">URLにアクセス</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    クライアントから送られたURLをクリックして、提出フォームを開く。
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:bg-slate-800/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                    <span className="text-2xl font-light text-blue-400">2</span>
                  </div>
                  <h4 className="text-lg font-light text-slate-100 mb-2">ファイルをアップロード</h4>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    ドラッグ&ドロップまたはクリックで、ファイルを簡単にアップロード。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="text-center">
            <div className="mb-5 w-16 sm:w-20 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30 mx-auto"></div>
            <h2 className="text-sm sm:text-base md:text-lg font-mono font-light text-slate-300 uppercase tracking-[0.2em] opacity-80">
              <span className="word-animate" data-delay="3000">Simple,</span>
              <span className="word-animate" data-delay="3200">organized,</span>
              <span className="word-animate" data-delay="3400">seamless.</span>
            </h2>
          </div>
        </div>

        {/* Mouse Gradient */}
        <div
          id="mouse-gradient-react"
          className="w-60 h-60 blur-xl sm:w-80 sm:h-80 sm:blur-2xl md:w-96 md:h-96 md:blur-3xl"
          style={{
            left: mouseGradientStyle.left,
            top: mouseGradientStyle.top,
            opacity: mouseGradientStyle.opacity,
          }}
        ></div>

        {/* Ripples */}
        {ripples.map(ripple => (
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
