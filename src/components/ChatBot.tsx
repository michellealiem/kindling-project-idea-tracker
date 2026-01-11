'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Flame, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  ideas: Array<{
    id: string;
    title: string;
    description: string;
    stage: string;
    type: string;
    tags: string[];
    notes: string;
  }>;
  themes: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  learnings: Array<{
    id: string;
    title: string;
    context: string;
    discovery: string;
  }>;
}

export function ChatBot({ ideas, themes, learnings }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hey! I'm your Kindling companion. I can help you explore your ${ideas.length} ideas, ${themes.length} themes, and ${learnings.length} learnings.\n\nTry asking me:\n- "What patterns do you see in my ideas?"\n- "Which sparks should I focus on?"\n- "Find ideas related to AI"\n- "What have I learned about building?"`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, ideas.length, themes.length, learnings.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: { ideas, themes, learnings },
        }),
      });

      if (!response.ok) {
        throw new Error('Chat request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "Hmm, I couldn't connect to my brain (Ollama). Make sure it's running with `ollama serve` on your Mac.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-gradient-to-br from-[var(--spark)] to-[var(--primary)]
          text-white shadow-lg
          flex items-center justify-center
          transition-all duration-300
          hover:scale-110 hover:shadow-xl hover:shadow-[var(--primary)]/30
          ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
        `}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div
        className={`
          fixed bottom-0 right-0 z-50
          w-full sm:w-[420px] h-[600px] sm:h-[500px]
          sm:bottom-6 sm:right-6
          bg-[var(--card)] border border-[var(--border)]
          sm:rounded-2xl shadow-2xl
          flex flex-col
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-8 opacity-0 pointer-events-none'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--spark)]/20 to-[var(--primary)]/20">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--foreground)]">Kindling Companion</h3>
              <p className="text-xs text-[var(--muted)]">Llama 3.1 via Ollama</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[85%] px-4 py-3 rounded-2xl
                  ${
                    message.role === 'user'
                      ? 'bg-[var(--primary)] text-white rounded-br-md'
                      : 'bg-[var(--background)] text-[var(--foreground)] rounded-bl-md border border-[var(--border)]'
                  }
                `}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-white/60' : 'text-[var(--muted)]'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[var(--background)] border border-[var(--border)] px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Flame className="w-4 h-4 animate-pulse text-[var(--spark)]" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ideas, themes, learnings..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all placeholder:text-[var(--muted)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[var(--primary)]/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
