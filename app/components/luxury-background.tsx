"use client"

import { useEffect, useRef } from "react"

export function LuxuryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Particle configuration
    const particles: Particle[] = []
    const particleCount = 50
    const particleBaseRadius = 1
    const particleVariance = 1
    const particleBaseSpeed = 0.5
    const lineDistance = 150
    const lineWidth = 0.3

    // Create particles
    class Particle {
      x: number
      y: number
      radius: number
      speedX: number
      speedY: number
      opacity: number
      targetOpacity: number
      canvasWidth: number
      canvasHeight: number

      constructor(canvas: HTMLCanvasElement) {
        this.canvasWidth = canvas.width
        this.canvasHeight = canvas.height
        this.x = Math.random() * this.canvasWidth
        this.y = Math.random() * this.canvasHeight
        this.radius = particleBaseRadius + Math.random() * particleVariance
        this.speedX = (Math.random() - 0.5) * particleBaseSpeed
        this.speedY = (Math.random() - 0.5) * particleBaseSpeed
        this.opacity = Math.random()
        this.targetOpacity = Math.random()
      }

      update() {
        // Update position
        this.x += this.speedX
        this.y += this.speedY

        // Bounce off edges
        if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1
        if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1

        // Smooth opacity transition
        this.opacity += (this.targetOpacity - this.opacity) * 0.02
        if (Math.abs(this.opacity - this.targetOpacity) < 0.01) {
          this.targetOpacity = Math.random()
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity * 0.5})`
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas))
    }

    // Animation loop
    const animate = () => {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#1a1a1a")
      gradient.addColorStop(0.5, "#2a2a2a")
      gradient.addColorStop(1, "#1a1a1a")

      // Clear canvas with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.update()
        particle.draw(ctx)

        // Draw lines between nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const dx = particle.x - particles[j].x
          const dy = particle.y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < lineDistance) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const opacity = (1 - distance / lineDistance) * 0.2
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`
            ctx.lineWidth = lineWidth
            ctx.stroke()
          }
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full bg-black" style={{ zIndex: -1 }} />
}

