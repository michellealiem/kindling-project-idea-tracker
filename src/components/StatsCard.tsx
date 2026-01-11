'use client';

import { ReactNode } from 'react';

type StageType = 'spark' | 'exploring' | 'building' | 'shipped' | 'paused' | 'permasolution';

interface StatsCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  stage: StageType;
  onClick?: () => void;
}

const stageStyles: Record<StageType, { color: string; bgColor: string; glowColor: string }> = {
  spark: {
    color: 'text-[var(--spark)]',
    bgColor: 'bg-[var(--spark-bg)]',
    glowColor: 'hover:shadow-[var(--spark)]/20',
  },
  exploring: {
    color: 'text-[var(--exploring)]',
    bgColor: 'bg-[var(--exploring-bg)]',
    glowColor: 'hover:shadow-[var(--exploring)]/20',
  },
  building: {
    color: 'text-[var(--building)]',
    bgColor: 'bg-[var(--building-bg)]',
    glowColor: 'hover:shadow-[var(--building)]/20',
  },
  shipped: {
    color: 'text-[var(--shipped)]',
    bgColor: 'bg-[var(--shipped-bg)]',
    glowColor: 'hover:shadow-[var(--shipped)]/20',
  },
  paused: {
    color: 'text-[var(--paused)]',
    bgColor: 'bg-[var(--paused-bg)]',
    glowColor: 'hover:shadow-[var(--paused)]/20',
  },
  permasolution: {
    color: 'text-[var(--permasolution)]',
    bgColor: 'bg-[var(--permasolution)]/10',
    glowColor: 'hover:shadow-[var(--permasolution)]/20',
  },
};

export function StatsCard({ label, value, icon, stage, onClick }: StatsCardProps) {
  const Wrapper = onClick ? 'button' : 'div';
  const styles = stageStyles[stage];

  return (
    <Wrapper
      onClick={onClick}
      className={`
        card-base p-5
        ${onClick ? 'cursor-pointer' : ''}
        hover:shadow-lg ${styles.glowColor}
        transition-all duration-300
        group
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${styles.bgColor} transition-transform duration-300 group-hover:scale-110`}>
          <div className={styles.color}>{icon}</div>
        </div>
        <div className="text-left">
          <p className="text-3xl font-bold text-[var(--foreground)] tabular-nums">
            {value}
          </p>
          <p className="text-sm text-[var(--muted)]">{label}</p>
        </div>
      </div>
    </Wrapper>
  );
}
