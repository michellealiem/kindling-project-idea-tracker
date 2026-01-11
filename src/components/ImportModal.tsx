'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, BookOpen, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportJSON: (json: string) => boolean;
  onImportPAIA: (themes: string, learnings: string) => void;
}

type ImportTab = 'json' | 'paia';

export function ImportModal({ isOpen, onClose, onImportJSON, onImportPAIA }: ImportModalProps) {
  const [activeTab, setActiveTab] = useState<ImportTab>('json');
  const [jsonInput, setJsonInput] = useState('');
  const [themesInput, setThemesInput] = useState('');
  const [learningsInput, setLearningsInput] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJSONImport = () => {
    setError('');
    if (!jsonInput.trim()) {
      setError('Please paste your JSON data');
      return;
    }

    const success = onImportJSON(jsonInput);
    if (success) {
      setJsonInput('');
      onClose();
    } else {
      setError('Invalid JSON format. Please check your data.');
    }
  };

  const handlePAIAImport = () => {
    setError('');
    if (!themesInput.trim() && !learningsInput.trim()) {
      setError('Please paste at least one of themes or learnings');
      return;
    }

    onImportPAIA(themesInput, learningsInput);
    setThemesInput('');
    setLearningsInput('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (activeTab === 'json') {
        setJsonInput(content);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-2xl shadow-2xl animate-scale-in border border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Import Data
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--background)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)]">
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'json'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            JSON Backup
          </button>
          <button
            onClick={() => setActiveTab('paia')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'paia'
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            PAIA Themes/Learnings
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Paste your exported JSON backup to restore your ideas, or upload a file.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all duration-300 group"
              >
                <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                Upload JSON File
              </button>

              <div className="relative">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-[var(--card)] text-xs text-[var(--muted)]">
                  OR
                </span>
                <div className="border-t border-[var(--border)]" />
              </div>

              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"version": "1.0", "ideas": [...], ...}'
                rows={10}
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-sm transition-all placeholder:text-[var(--muted)]"
              />

              <button
                onClick={handleJSONImport}
                className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                Import JSON
              </button>
            </div>
          )}

          {activeTab === 'paia' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                Paste your PAIA markdown files to import themes and learnings. You can find these at:
              </p>
              <div className="text-xs font-mono text-[var(--muted)] bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] space-y-1">
                <p>• .claude/context/memory/recurring_themes.md</p>
                <p>• .claude/context/memory/learnings.md</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Recurring Themes <span className="text-[var(--muted)] font-normal">(recurring_themes.md)</span>
                </label>
                <textarea
                  value={themesInput}
                  onChange={(e) => setThemesInput(e.target.value)}
                  placeholder="Paste the contents of recurring_themes.md..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-sm transition-all placeholder:text-[var(--muted)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Learnings <span className="text-[var(--muted)] font-normal">(learnings.md)</span>
                </label>
                <textarea
                  value={learningsInput}
                  onChange={(e) => setLearningsInput(e.target.value)}
                  placeholder="Paste the contents of learnings.md..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent font-mono text-sm transition-all placeholder:text-[var(--muted)]"
                />
              </div>

              <button
                onClick={handlePAIAImport}
                className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                Import PAIA Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
