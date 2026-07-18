// ============================================================
// Copilot Panel — Main slide-out chat panel
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Sparkles, Send, X, Trash2, Settings, Key, Check, ChevronRight, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { useCopilot } from '../../contexts/CopilotContext';
import { saveFeedback } from '../../lib/copilotFeedback';

// ── Markdown-lite renderer ──
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const headers = tableRows[0];
    const body = tableRows.slice(2); // skip separator row
    elements.push(
      <div key={`table-${elements.length}`} className="overflow-x-auto my-2">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="text-left py-1.5 px-2 border-b border-stone-200 font-semibold text-stone-600 bg-stone-50">
                  {h.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="py-1 px-2 border-b border-stone-100 text-stone-600">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-stone-100 rounded-lg p-3 text-xs font-mono text-stone-700 overflow-x-auto my-2">
            {codeLines.join('\n')}
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cells.some(c => /^[\s-:]+$/.test(c))) {
        // Separator row
        tableRows.push(cells);
        continue;
      }
      if (!inTable) inTable = true;
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-stone-800 mt-3 mb-1.5">
          {renderInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className="text-xs font-bold text-stone-700 mt-2.5 mb-1 uppercase tracking-wider">
          {renderInline(line.slice(4))}
        </h4>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="border-l-2 border-amber-300 bg-amber-50/50 pl-3 py-1.5 my-1.5 text-xs text-stone-600 rounded-r-lg">
          {renderInline(line.slice(2))}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-stone-200 my-2" />);
      continue;
    }

    // Bullet points
    if (line.match(/^(\s*)- /)) {
      const indent = line.match(/^(\s*)/)?.[1]?.length ?? 0;
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-0.5" style={{ paddingLeft: Math.min(indent * 4, 32) }}>
          <span className="text-stone-400 mt-0.5 shrink-0 text-[10px]">•</span>
          <span className="text-xs text-stone-600 leading-relaxed">{renderInline(line.replace(/^\s*- /, ''))}</span>
        </div>
      );
      continue;
    }

    // Numbered items (e.g. **1. ...)
    if (line.match(/^\*\*\d+\./)) {
      elements.push(
        <div key={i} className="my-1.5 text-xs text-stone-600 leading-relaxed">
          {renderInline(line)}
        </div>
      );
      continue;
    }

    // Arrow lines (→)
    if (line.trim().startsWith('→')) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 my-0.5 pl-4">
          <ChevronRight size={10} className="text-stone-400 mt-0.5 shrink-0" />
          <span className="text-xs text-stone-500 leading-relaxed">{renderInline(line.trim().slice(1).trim())}</span>
        </div>
      );
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-1.5" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-xs text-stone-600 leading-relaxed my-0.5">
        {renderInline(line)}
      </p>
    );
  }

  if (inTable) flushTable();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Process: links → bold → inline code
  // First, split on markdown links [text](url)
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return linkParts.map((part, i) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline underline-offset-2 inline-flex items-center gap-0.5 transition-colors"
        >
          {linkMatch[1]}
          <ExternalLink size={9} className="shrink-0 opacity-60" />
        </a>
      );
    }
    // Bold
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`} className="font-semibold text-stone-800">{bp.slice(2, -2)}</strong>;
      }
      // Inline code
      const codeParts = bp.split(/(`[^`]+`)/g);
      return codeParts.map((cp, k) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${j}-${k}`} className="bg-stone-100 text-stone-700 px-1 py-0.5 rounded text-[11px] font-mono">{cp.slice(1, -1)}</code>;
        }
        return <React.Fragment key={`${i}-${j}-${k}`}>{cp}</React.Fragment>;
      });
    });
  });
}

// ── Message Component ──

function CopilotMessage({ message, isStreaming, previousQuery }: {
  message: { id: string; role: string; content: string; timestamp: number };
  isStreaming?: boolean;
  previousQuery?: string;
}) {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Detect if this is a product knowledge response (has verification badge or source citation)
  const isProductResponse = !isUser && message.content && (
    message.content.includes('✅ **Verified**') ||
    message.content.includes('⚠️ **Needs Review**') ||
    message.content.includes('❓ **Unverified**') ||
    message.content.includes('❓ **No verified information found**') ||
    message.content.includes('📎 Source:')
  );

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(type);
    saveFeedback({
      messageId: message.id,
      query: previousQuery ?? '',
      responseSnippet: message.content.slice(0, 200),
      feedback: type,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 group`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center shrink-0 mr-2 mt-0.5">
          <Sparkles size={12} className="text-white" />
        </div>
      )}
      <div className="flex flex-col max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-stone-900 text-white'
              : 'bg-stone-50 border border-stone-200/60'
          }`}
        >
          {isUser ? (
            <p className="text-xs leading-relaxed">{message.content}</p>
          ) : (
            <div className="copilot-content">
              {message.content ? (
                renderMarkdown(message.content)
              ) : isStreaming ? (
                <div className="flex items-center gap-1.5 py-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-stone-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400 ml-1">Thinking...</span>
                </div>
              ) : null}
              {isStreaming && message.content && (
                <span className="inline-block w-0.5 h-3.5 bg-stone-400 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Feedback buttons — shown for completed product knowledge responses */}
        {isProductResponse && !isStreaming && (
          <div className={`flex items-center gap-1 mt-1 ml-1 transition-opacity ${
            feedback ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {feedback === null ? (
              <>
                <button
                  onClick={() => handleFeedback('up')}
                  className="p-1 rounded text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                  title="Accurate and helpful"
                >
                  <ThumbsUp size={11} />
                </button>
                <button
                  onClick={() => handleFeedback('down')}
                  className="p-1 rounded text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Inaccurate or missing info"
                >
                  <ThumbsDown size={11} />
                </button>
              </>
            ) : (
              <span className="text-[10px] text-stone-400 px-1">
                {feedback === 'up' ? '✓ Thanks!' : '✓ Flagged for review'}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Welcome Message ──

function WelcomeMessage({ userName }: { userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="text-center py-8 px-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center mx-auto mb-4">
        <Sparkles size={22} className="text-white" />
      </div>
      <h3 className="text-base font-bold text-stone-800 mb-1">
        Hey {userName.split(' ')[0]} 👋
      </h3>
      <p className="text-xs text-stone-500 max-w-[280px] mx-auto leading-relaxed">
        I'm your sales copilot. Ask me about <strong className="text-stone-700">product features</strong>,{' '}
        <strong className="text-stone-700">implementation details</strong>,{' '}
        <strong className="text-stone-700">pricing</strong>, or{' '}
        <strong className="text-stone-700">deal coaching</strong> — all answers are verified and guardrailed.
      </p>
    </motion.div>
  );
}

// ── Settings Panel ──

function SettingsPanel({ apiKey, onSetApiKey, onClose }: { apiKey: string | null; onSetApiKey: (key: string | null) => void; onClose: () => void }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSetApiKey(keyInput.trim() || null);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute inset-0 z-10 bg-white flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Settings size={14} className="text-stone-500" />
          <span className="text-sm font-bold text-stone-800">Copilot Settings</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 p-4">
        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 block">
          OpenAI API Key (Optional)
        </label>
        <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
          Add an OpenAI API key to enable full natural language responses powered by GPT-4o-mini. Without it, the copilot uses smart offline mode with your existing data.
        </p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Key size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2.5 pl-8 pr-3 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-all"
            />
          </div>
          <button
            onClick={handleSave}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              saved
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {saved ? <><Check size={12} /> Saved</> : 'Save'}
          </button>
        </div>
        {apiKey && (
          <button
            onClick={() => { onSetApiKey(null); setKeyInput(''); }}
            className="mt-3 text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Remove API key (use offline mode)
          </button>
        )}
        <div className="mt-6 p-3 rounded-xl bg-stone-50 border border-stone-200/60">
          <p className="text-[11px] font-semibold text-stone-600 mb-1">Current Mode</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span className="text-xs text-stone-600">
              {apiKey ? 'LLM Mode (GPT-4o-mini)' : 'Smart Offline Mode'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Panel ──

export function CopilotPanel() {
  const {
    isOpen, messages, isStreaming, suggestedPrompts, llmApiKey,
    copilotContext, close, sendMessage, clearHistory, setApiKey,
  } = useCopilot();

  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handlePromptClick = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  if (typeof document === 'undefined') return null;

  const userName = copilotContext?.userName ?? 'there';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="copilot-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[998] bg-black/10 backdrop-blur-[1px]"
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            key="copilot-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed right-0 top-0 z-[999] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-stone-900 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Copilot</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1 text-[9px] font-medium text-white/30 bg-white/10 px-2 py-1 rounded mr-1">
                  ⌘J
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                  title="Clear history"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={close}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Mode indicator */}
            <div className="px-4 py-1.5 bg-stone-50 border-b border-stone-200/60 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${llmApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-medium text-stone-400">
                {llmApiKey ? 'GPT-4o-mini' : 'Smart Offline Mode'}
              </span>
            </div>

            {/* Content area — relative for settings overlay */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              {/* Settings overlay */}
              <AnimatePresence>
                {showSettings && (
                  <SettingsPanel
                    apiKey={llmApiKey}
                    onSetApiKey={setApiKey}
                    onClose={() => setShowSettings(false)}
                  />
                )}
              </AnimatePresence>

              {/* Messages */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {messages.length === 0 && (
                  <WelcomeMessage userName={userName} />
                )}
                {messages.map((msg, idx) => {
                  // Find the previous user message for this assistant response
                  const prevQuery = msg.role === 'assistant' && idx > 0
                    ? [...messages.slice(0, idx)].reverse().find(m => m.role === 'user')?.content
                    : undefined;
                  return (
                    <CopilotMessage
                      key={msg.id}
                      message={msg}
                      isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
                      previousQuery={prevQuery}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested prompts — always visible, collapsible after conversations get long */}
              {!isStreaming && suggestedPrompts.length > 0 && (
                <div className="px-4 pb-2 pt-1 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedPrompts.slice(0, messages.length > 6 ? 3 : undefined).map((sp) => (
                      <button
                        key={sp.prompt}
                        onClick={() => handlePromptClick(sp.prompt)}
                        className="flex items-center gap-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/60 rounded-full px-3 py-1.5 text-[11px] font-medium text-stone-600 hover:text-stone-800 transition-all active:scale-[0.97]"
                      >
                        <span>{sp.icon}</span>
                        <span>{sp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="shrink-0 border-t border-stone-200 bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isStreaming ? 'Thinking...' : 'Ask your copilot...'}
                    disabled={isStreaming}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-4 text-xs text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-200 transition-all disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
