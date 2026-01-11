'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Sparkles, Zap, Flame, Lightbulb, CircleDot, Calendar, Search, Clock } from 'lucide-react';
import { Idea, Stage, IdeaType, Effort, STAGE_CONFIG, TYPE_CONFIG, EFFORT_CONFIG } from '@/lib/types';

interface IdeaModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => void;
  onUpdate: (id: string, updates: Partial<Idea>) => void;
  onDelete: (id: string) => void;
  onAISuggest?: (idea: Partial<Idea>) => void;
  aiLoading?: boolean;
  aiSuggestion?: string | null;
}

const stages: Stage[] = ['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused'];
const types: IdeaType[] = ['learning', 'experiment', 'project', 'permasolution'];
const efforts: Effort[] = ['trivial', 'small', 'medium', 'large', 'epic'];

// Stage icons: Idea → Exploring → Active/Waiting/Simmering → Shipped → Paused
const stageIcons: Record<Stage, typeof Zap> = {
  spark: Zap,
  exploring: Search,
  building: Flame,
  waiting: Clock,
  simmering: Flame,
  shipped: Lightbulb,
  paused: CircleDot,
};

export function IdeaModal({
  idea,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onAISuggest,
  aiLoading,
  aiSuggestion,
}: IdeaModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<Stage>('spark');
  const [type, setType] = useState<IdeaType>('permasolution');
  const [tags, setTags] = useState('');
  const [effort, setEffort] = useState<Effort>('medium');
  const [notes, setNotes] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categorizationLoading, setCategorizationLoading] = useState(false);

  // Auto-categorize using AI
  const handleAutoCategorize = async () => {
    if (!title.trim()) return;
    setCategorizationLoading(true);

    try {
      const { buildCategorizationPrompt } = await import('@/lib/ollama');
      const prompt = buildCategorizationPrompt(title, description);

      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'categorize' }),
      });

      if (!response.ok) throw new Error('Failed to categorize');

      const data = await response.json();
      const text = data.suggestion || '';

      // Parse the structured response
      const stageMatch = text.match(/STAGE:\s*(\w+)/i);
      const typeMatch = text.match(/TYPE:\s*(\w+)/i);
      const tagsMatch = text.match(/TAGS:\s*([^\n]+)/i);
      const effortMatch = text.match(/EFFORT:\s*(\w+)/i);

      if (stageMatch && stages.includes(stageMatch[1] as Stage)) {
        setStage(stageMatch[1] as Stage);
      }
      if (typeMatch && types.includes(typeMatch[1] as IdeaType)) {
        setType(typeMatch[1] as IdeaType);
      }
      if (tagsMatch) {
        setTags(tagsMatch[1].trim());
      }
      if (effortMatch && efforts.includes(effortMatch[1] as Effort)) {
        setEffort(effortMatch[1] as Effort);
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error);
    } finally {
      setCategorizationLoading(false);
    }
  };

  // Get today's date in PST/California timezone
  const getTodayPST = () => {
    const now = new Date();
    const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    return pstDate.toISOString().split('T')[0];
  };

  // Reset form when modal opens/closes or idea changes
  useEffect(() => {
    if (idea) {
      setTitle(idea.title);
      setDescription(idea.description);
      setStage(idea.stage);
      setType(idea.type);
      setTags(idea.tags.join(', '));
      setEffort(idea.effort);
      setNotes(idea.notes);
      // Convert ISO string to date input format (YYYY-MM-DD)
      setStartedAt(idea.startedAt ? idea.startedAt.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setStage('spark');
      setType('permasolution');
      setTags('');
      setEffort('medium');
      setNotes('');
      // Auto-populate with today's date in PST
      setStartedAt(getTodayPST());
    }
    setShowDeleteConfirm(false);
  }, [idea, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ideaData = {
      title: title.trim(),
      description: description.trim(),
      stage,
      type,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      effort,
      notes: notes.trim(),
      ...(startedAt && { startedAt: new Date(startedAt).toISOString() }),
    };

    if (idea) {
      onUpdate(idea.id, ideaData);
    } else {
      onSave(ideaData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (idea) {
      onDelete(idea.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto bg-[var(--card)] sm:rounded-2xl shadow-2xl animate-scale-in border-0 sm:border border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {idea ? 'Tend the Flame' : 'Strike a Spark'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's caught fire in your mind?"
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder:text-[var(--muted)]"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the idea, problem it solves, or why it excites you..."
              rows={3}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none placeholder:text-[var(--muted)]"
            />
          </div>

          {/* Auto-categorize button - only for new ideas */}
          {!idea && title.trim() && (
            <button
              type="button"
              onClick={handleAutoCategorize}
              disabled={categorizationLoading}
              className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {categorizationLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-categorize with AI
                </>
              )}
            </button>
          )}

          {/* Stage Selection - Visual Buttons with Tooltips */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((s) => {
                const Icon = stageIcons[s];
                const config = STAGE_CONFIG[s];
                const isSelected = stage === s;
                return (
                  <div key={s} className="relative group">
                    <button
                      type="button"
                      onClick={() => setStage(s)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        ${isSelected
                          ? `${config.bgColor} ${config.color} ring-2 ring-current`
                          : 'bg-[var(--background)] text-[var(--muted)] hover:bg-[var(--border)]'
                        }
                        ${s === 'simmering' ? 'opacity-80' : ''}
                      `}
                    >
                      <Icon className={`w-4 h-4 ${s === 'simmering' ? 'opacity-60' : ''}`} />
                      {config.label}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs text-[var(--muted-foreground)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      {config.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {types.map((t) => {
                const config = TYPE_CONFIG[t];
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left
                      ${isSelected
                        ? `bg-[var(--primary)]/10 text-[var(--primary)] ring-2 ring-[var(--primary)]`
                        : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]'
                      }
                    `}
                  >
                    <span className="block font-semibold">{config.label}</span>
                    <span className={`text-xs ${isSelected ? 'text-[var(--primary)]/70' : 'text-[var(--muted)]'}`}>
                      {config.description}
                    </span>
                    {isSelected && (
                      <span className="block mt-1.5 text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {config.longDescription}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Tags <span className="text-[var(--muted)] font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, healthcare, PAIA, automation..."
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder:text-[var(--muted)]"
            />
          </div>

          {/* Effort */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Estimated Effort
            </label>
            <div className="flex flex-wrap gap-2">
              {efforts.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEffort(e)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    effort === e
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]'
                  }`}
                >
                  {EFFORT_CONFIG[e].label}
                  <span className={`text-xs ml-1.5 ${effort === e ? 'opacity-80' : 'text-[var(--muted)]'}`}>
                    {EFFORT_CONFIG[e].description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Started Date - for backdating old projects */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--muted)]" />
                Started Date
                <span className="text-[var(--muted)] font-normal">(optional)</span>
              </div>
            </label>
            <p className="text-xs text-[var(--muted)] mb-2">
              When did you actually start this? Useful for projects you forgot to add.
            </p>
            <input
              type="date"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Notes & Annotations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Progress notes, blockers, links, thoughts..."
              rows={4}
              className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all resize-none font-mono text-sm placeholder:text-[var(--muted)]"
            />
          </div>

          {/* AI Suggestions - only show if handler provided */}
          {onAISuggest && (
            <div className="space-y-3">
              <button
                type="button"
                disabled={aiLoading || !title.trim()}
                onClick={() =>
                  onAISuggest({ title, description, stage, type, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) })
                }
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--spark)] to-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <>
                    <Flame className="w-5 h-5 animate-pulse" />
                    Channeling the flames...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Get AI Suggestions
                  </>
                )}
              </button>

              {/* AI Suggestion Display */}
              {aiSuggestion && (
                <div className="p-4 bg-gradient-to-r from-[var(--spark)]/10 to-[var(--primary)]/10 rounded-xl border border-[var(--spark)]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[var(--spark)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">AI Suggestions</span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                    {aiSuggestion}
                  </p>
                  <button
                    type="button"
                    onClick={() => setNotes(prev => prev ? `${prev}\n\n---\nAI Suggestion:\n${aiSuggestion}` : `AI Suggestion:\n${aiSuggestion}`)}
                    className="mt-3 text-xs text-[var(--primary)] hover:underline font-medium"
                  >
                    + Add to notes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            {idea && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}

            {showDeleteConfirm && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">Delete this idea?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 bg-[var(--background)] text-[var(--foreground)] rounded-lg text-sm hover:bg-[var(--border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className={`flex gap-3 ${!idea ? 'ml-auto' : ''}`}>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                {idea ? 'Save Changes' : 'Ignite Spark'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
