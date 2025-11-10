"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  pulseSpeed: number
  pulseOffset: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000)
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
    }))

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return

      timeRef.current += 0.01

      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(11, 18, 32, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw gradient orbs
      const drawOrb = (x: number, y: number, radius: number, color: string) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, "rgba(11, 18, 32, 0)")
        ctx.fillStyle = gradient
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }

      // Animated orbs
      const orb1X = canvas.width * 0.2 + Math.sin(timeRef.current * 0.5) * 100
      const orb1Y = canvas.height * 0.3 + Math.cos(timeRef.current * 0.3) * 80
      drawOrb(orb1X, orb1Y, 200, "rgba(59, 130, 246, 0.15)")

      const orb2X = canvas.width * 0.8 + Math.sin(timeRef.current * 0.4) * 120
      const orb2Y = canvas.height * 0.6 + Math.cos(timeRef.current * 0.5) * 100
      drawOrb(orb2X, orb2Y, 250, "rgba(96, 165, 250, 0.1)")

      const orb3X = canvas.width * 0.5 + Math.sin(timeRef.current * 0.6) * 80
      const orb3Y = canvas.height * 0.8 + Math.cos(timeRef.current * 0.4) * 60
      drawOrb(orb3X, orb3Y, 180, "rgba(147, 197, 253, 0.12)")

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Pulsing opacity
        const pulse = Math.sin(timeRef.current * particle.pulseSpeed + particle.pulseOffset)
        const currentOpacity = particle.opacity + pulse * 0.2

        // Draw particle with glow
        ctx.shadowBlur = 10
        ctx.shadowColor = "rgba(59, 130, 246, 0.8)"
        ctx.fillStyle = `rgba(147, 197, 253, ${currentOpacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Draw connections between nearby particles
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x
          const dy = particlesRef.current[i].y - particlesRef.current[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y)
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y)
            ctx.globalAlpha = (1 - distance / 150) * 0.3
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.6 }} />
}
