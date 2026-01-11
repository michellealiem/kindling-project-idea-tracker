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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'z-50' : ''}
    >
      <IdeaCard idea={idea} onClick={onClick} />
    </div>
  );
}
