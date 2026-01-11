'use client';

import { useEffect, useState } from 'react';

interface Ember {
  id: number;
  left: number;
  size: 'tiny' | 'small' | 'medium';
  duration: number;
  delay: number;
  glowDuration: number;
  flicker: boolean;
  flickerDuration: number;
  drift: number;
  bright: boolean;
}

export function Embers() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    // Generate embers on mount
    const particles: Ember[] = [];
    const count = 20; // Subtle amount

    for (let i = 0; i < count; i++) {
      const sizes: ('tiny' | 'small' | 'medium')[] = ['tiny', 'small', 'medium'];
      particles.push({
        id: i,
        left: Math.random() * 100, // Random horizontal position (%)
        size: sizes[Math.floor(Math.random() * sizes.length)],
        duration: 12 + Math.random() * 18, // 12-30 seconds to rise
        delay: Math.random() * 15, // Stagger start times
        glowDuration: 1.5 + Math.random() * 2, // 1.5-3.5 second glow cycle
        flicker: Math.random() > 0.6, // 40% chance to flicker
        flickerDuration: 0.3 + Math.random() * 0.4, // 0.3-0.7 second flicker
        drift: (Math.random() - 0.5) * 60, // -30 to +30px horizontal drift
        bright: Math.random() > 0.85, // 15% chance to be a bright ember
      });
    }

    setEmbers(particles);
  }, []);

  // Don't render anything on server
  if (embers.length === 0) return null;

  return (
    <div className="embers-container" aria-hidden="true">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className={`ember ${ember.size} ${ember.flicker ? 'flicker' : ''} ${ember.bright ? 'bright' : ''}`}
          style={{
            left: `${ember.left}%`,
            '--drift': `${ember.drift}px`,
            animationDuration: `${ember.duration}s, ${ember.glowDuration}s${ember.flicker ? `, ${ember.flickerDuration}s` : ''}`,
            animationDelay: `${ember.delay}s, 0s${ember.flicker ? ', 0s' : ''}`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
