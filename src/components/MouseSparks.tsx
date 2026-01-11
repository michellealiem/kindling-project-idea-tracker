'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Spark {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export function MouseSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);
  const sparkIdRef = useRef(0);

  const createSpark = useCallback((x: number, y: number, velocity: number) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.2 + velocity * 0.05;

    return {
      id: sparkIdRef.current++,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.8 - Math.random() * 0.5, // Gentle upward drift
      life: 1,
      maxLife: 50 + Math.random() * 30, // Longer life for smoother fade
      size: 1.5 + Math.random() * 2,
      hue: 25 + Math.random() * 20, // Orange to amber range
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMove = (x: number, y: number) => {
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      // Only spawn sparks if moving fast enough, max 2 at a time
      if (velocity > 3) {
        const sparkCount = Math.min(Math.floor(velocity / 12), 2);
        for (let i = 0; i < sparkCount; i++) {
          sparksRef.current.push(createSpark(x, y, velocity));
        }
      }

      lastPosRef.current = { x, y };
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Use the first touch point
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Initialize position on touch start to avoid big initial velocity
      const touch = e.touches[0];
      if (touch) {
        lastPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw sparks
      sparksRef.current = sparksRef.current.filter((spark) => {
        // Update physics - gentler movement
        spark.vy += 0.01; // Very slight gravity
        spark.vx *= 0.97; // Air resistance
        spark.vy *= 0.97;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.life -= 1 / spark.maxLife;

        if (spark.life <= 0) return false;

        // Draw spark with smooth fade
        const alpha = spark.life * 0.7;
        const size = spark.size * (0.6 + spark.life * 0.4);

        // Soft outer glow
        const gradient = ctx.createRadialGradient(
          spark.x, spark.y, 0,
          spark.x, spark.y, size * 3
        );
        gradient.addColorStop(0, `hsla(${spark.hue}, 95%, 60%, ${alpha})`);
        gradient.addColorStop(0.3, `hsla(${spark.hue}, 85%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${spark.hue}, 80%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bright center core
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(45, 100%, 85%, ${alpha * 0.9})`;
        ctx.fill();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationRef.current);
    };
  }, [createSpark]);

  return (
    <canvas
      ref={canvasRef}
      className="mouse-sparks-canvas"
      aria-hidden="true"
    />
  );
}
