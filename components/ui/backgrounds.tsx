"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

interface ParticleBackgroundProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  speed?: number;
  connectDistance?: number;
  showConnections?: boolean;
}

export function ParticleBackground({
  className,
  particleCount = 50,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"],
  speed = 0.5,
  connectDistance = 150,
  showConnections = true,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * speed,
      speedY: (Math.random() - 0.5) * speed,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.offsetWidth) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.offsetHeight) {
          particle.speedY *= -1;
        }

        // Keep in bounds
        particle.x = Math.max(0, Math.min(canvas.offsetWidth, particle.x));
        particle.y = Math.max(0, Math.min(canvas.offsetHeight, particle.y));

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw connections
        if (showConnections) {
          particlesRef.current.slice(i + 1).forEach((other) => {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectDistance) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = particle.color;
              ctx.globalAlpha = (1 - distance / connectDistance) * 0.2;
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          });

          // Connect to mouse
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectDistance * 1.5) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / (connectDistance * 1.5)) * 0.4;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, colors, speed, connectDistance, showConnections]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

interface GradientOrbProps {
  className?: string;
  color?: string;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  delay?: number;
}

export function GradientOrb({
  className,
  color = "from-blue-500 to-purple-500",
  size = "md",
  animated = true,
  delay = 0,
}: GradientOrbProps) {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]",
  };

  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-30",
        "bg-gradient-to-br",
        color,
        sizes[size],
        animated && "animate-blob",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

export function NoiseOverlay({ className, opacity = 0.03 }: NoiseOverlayProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none z-50", className)}
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

interface GridPatternProps {
  className?: string;
  size?: number;
  color?: string;
}

export function GridPattern({
  className,
  size = 40,
  color = "rgba(255, 255, 255, 0.02)",
}: GridPatternProps) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

export function MeshGradientBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      <div className="absolute inset-0 bg-background" />
      <GradientOrb
        color="from-blue-500 to-cyan-500"
        size="xl"
        className="-top-48 -left-48"
        delay={0}
      />
      <GradientOrb
        color="from-purple-500 to-pink-500"
        size="lg"
        className="top-1/4 -right-32"
        delay={2000}
      />
      <GradientOrb
        color="from-emerald-500 to-teal-500"
        size="lg"
        className="bottom-0 left-1/4"
        delay={4000}
      />
      <GradientOrb
        color="from-orange-500 to-red-500"
        size="md"
        className="-bottom-32 right-1/4"
        delay={6000}
      />
      <GridPattern />
      <NoiseOverlay />
    </div>
  );
}
