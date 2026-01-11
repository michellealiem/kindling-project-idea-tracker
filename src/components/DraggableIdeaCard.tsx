'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Idea } from '@/lib/types';
import { IdeaCard } from './IdeaCard';

interface DraggableIdeaCardProps {
  idea: Idea;
  onClick: (idea: Idea) => void;
}

export function DraggableIdeaCard({ idea, onClick }: DraggableIdeaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  // Add a subtle tilt during drag
  const style = {
    transform: isDragging
      ? `${CSS.Transform.toString(transform)} rotate(3deg) scale(1.02)`
      : CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'z-50 shadow-xl shadow-[var(--primary)]/20' : ''} transition-shadow`}
    >
      <IdeaCard idea={idea} onClick={onClick} />
    </div>
  );
}
