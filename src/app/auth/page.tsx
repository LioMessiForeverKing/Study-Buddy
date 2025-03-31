'use client';

import React, { FC, useEffect, useRef } from 'react';
import { signInWithGoogle } from '../../../utils/action';
import gsap from 'gsap';
import { theme } from '../../../public/theme';

const AuthForm: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // GSAP Animations
    const authContent = document.querySelector('.auth-content');
    gsap.fromTo(authContent,
      { opacity: 0, y: 30, scale: 0.95 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1, 
        ease: 'elastic.out(1, 0.5)'
      }
    );

    // Particle Animation Setup
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
    };

    resizeCanvas();

    class Particle {
      x!: number;
      y!: number;
      radius!: number;
      speedX!: number;
      speedY!: number;
      color!: string;
      googleColors: string[];

      constructor() {
        this.googleColors = [theme.colors.primary.blue, theme.colors.primary.green, theme.colors.primary.yellow, theme.colors.primary.red];
        this.reset();
      }

      reset() {
        this.x = Math.random() * (canvas?.width ?? window.innerWidth)
        this.y = Math.random() * (canvas?.height ?? window.innerHeight)
        this.radius = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.color = this.googleColors[Math.floor(Math.random() * this.googleColors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > (canvas?.width ?? 0)) this.speedX *= -1
        if (this.y < 0 || this.y > (canvas?.height ?? 0)) this.speedY *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
      }
    }

    const particles = Array.from({ length: 100 }, () => new Particle());
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
      particles.forEach(p => p.reset());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Canvas Particles */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Animated Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] top-[-200px] left-[-200px] bg-[radial-gradient(closest-side,_var(--primary-blue),_transparent)] animate-[pulse_12s_ease-in-out_infinite] blur-3xl opacity-20" style={{'--primary-blue': theme.colors.primary.blue} as any} />
        <div className="absolute w-[600px] h-[600px] bottom-[-100px] right-[-100px] bg-[radial-gradient(closest-side,_var(--primary-red),_transparent)] animate-[pulse_15s_ease-in-out_infinite] blur-3xl opacity-20" style={{'--primary-red': theme.colors.primary.red} as any} />
      </div>

      {/* Auth Content */}
      <div className="auth-content relative z-10 w-full max-w-md px-8 py-12 rounded-3xl shadow-2xl border border-white/40 backdrop-blur-xl bg-white/70 transition-all duration-700 hover:shadow-[0_20px_60px_-10px_rgba(66,133,244,0.3)] hover:border-[#4285F4]/30">
        <h1 className="text-4xl font-bold text-center mb-8" style={{
          background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Welcome to Study Buddy
        </h1>

        <div className="space-y-4">
          <button 
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center px-6 py-3 text-white bg-[#4285F4] hover:bg-[#357ABD] rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-sm text-center text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </main>
  );
};

export default AuthForm;
