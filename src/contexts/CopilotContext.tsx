/* eslint-disable react-refresh/only-export-components */
// ============================================================
// Copilot Context — State management for the AI copilot panel
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  type CopilotContext as CopilotCtx,
  type ChatMessage,
  type SuggestedPrompt,
  buildCopilotContext,
  getSuggestedPrompts,
  generateSmartResponse,
  getLLMApiKey,
  setLLMApiKey as persistLLMApiKey,
  streamLLMResponse,
} from '../lib/copilotEngine';
import { isProductKnowledgeQuery } from '../lib/productKnowledgeEngine';
import { isCompetitorQuery, searchRelatedAssets } from '../lib/supplementalKnowledge';
import type { DiscoverySession } from '../lib/discoveryDatabase';

// ── Types ──

interface CopilotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isStreaming: boolean;
  suggestedPrompts: SuggestedPrompt[];
  llmApiKey: string | null;
  copilotContext: CopilotCtx | null;
  activeSession: DiscoverySession | null;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
  setApiKey: (key: string | null) => void;
  setActiveSession: (session: DiscoverySession | null) => void;
}

const CopilotContextReact = createContext<CopilotState | null>(null);

// ── Storage ──

const HISTORY_KEY = 'scc_copilot_history';
const OPEN_KEY = 'scc_copilot_open';

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]): void {
  try {
    // Keep last 50 messages to avoid bloating localStorage
    const trimmed = messages.slice(-50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* noop */ }
}

function loadOpenState(): boolean {
  try {
    return localStorage.getItem(OPEN_KEY) === 'true';
  } catch {
    return false;
  }
}

// ── Provider ──

export function CopilotProvider({ children }: { children: React.ReactNode }) {
  const { effectiveUser } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false); // Don't auto-open on load
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [isStreaming, setIsStreaming] = useState(false);
  const [llmApiKey, setLlmApiKeyState] = useState<string | null>(getLLMApiKey);
  const [activeSession, setActiveSession] = useState<DiscoverySession | null>(null);
  const [copilotContext, setCopilotContext] = useState<CopilotCtx | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  // Build context whenever route or active session changes
  useEffect(() => {
    if (!effectiveUser) return;
    const ctx = buildCopilotContext(
      location.pathname,
      effectiveUser.id,
      effectiveUser.role,
      effectiveUser.full_name,
      activeSession,
    );
    setCopilotContext(ctx);
    setSuggestedPrompts(getSuggestedPrompts(ctx));
  }, [location.pathname, effectiveUser, activeSession]);

  // Persist messages when they change
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // Listen for toggle events from keyboard shortcut
  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('copilot:toggle', handler);
    return () => window.removeEventListener('copilot:toggle', handler);
  }, []);

  // ── Actions ──

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem(OPEN_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    try { localStorage.setItem(OPEN_KEY, 'true'); } catch { /* noop */ }
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    try { localStorage.setItem(OPEN_KEY, 'false'); } catch { /* noop */ }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming || !copilotContext) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    const assistantMsg: ChatMessage = {
      id: `msg_${Date.now()}_asst`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    const apiKey = llmApiKey;
    const allMessages = [...messages, userMsg];

    if (apiKey) {
      // LLM mode — stream response
      try {
        let fullContent = '';
        for await (const chunk of streamLLMResponse(allMessages, copilotContext, apiKey)) {
          fullContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (updated[lastIdx]?.role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], content: fullContent };
            }
            return updated;
          });
        }
      } catch (err) {
        // Fallback to smart mode on error
        const fallback = generateSmartResponse(copilotContext, content);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: `⚠️ LLM error — using offline mode:\n\n${fallback}` };
          }
          return updated;
        });
      }
    } else {
      // Smart offline mode — simulate typing
      const response = generateSmartResponse(copilotContext, content);
      await simulateTyping(response, (partial) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: partial };
          }
          return updated;
        });
      });

      // Async: append related assets from content library for product/competitor queries
      if (isProductKnowledgeQuery(content) || isCompetitorQuery(content)) {
        try {
          const assets = await searchRelatedAssets(content);
          if (assets) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastIdx = updated.length - 1;
              if (updated[lastIdx]?.role === 'assistant') {
                updated[lastIdx] = {
                  ...updated[lastIdx],
                  content: updated[lastIdx].content + '\n\n---\n\n' + assets,
                };
              }
              return updated;
            });
          }
        } catch {
          // Content library unavailable — no assets appended
        }
      }
    }

    setIsStreaming(false);
  }, [isStreaming, copilotContext, llmApiKey, messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    setLlmApiKeyState(key);
    persistLLMApiKey(key);
  }, []);

  const value: CopilotState = {
    isOpen,
    messages,
    isStreaming,
    suggestedPrompts,
    llmApiKey,
    copilotContext,
    activeSession,
    toggle,
    open,
    close,
    sendMessage,
    clearHistory,
    setApiKey,
    setActiveSession,
  };

  return (
    <CopilotContextReact.Provider value={value}>
      {children}
    </CopilotContextReact.Provider>
  );
}

export function useCopilot(): CopilotState {
  const ctx = useContext(CopilotContextReact);
  if (!ctx) throw new Error('useCopilot must be used within CopilotProvider');
  return ctx;
}

// ── Typing Simulation ──

async function simulateTyping(
  text: string,
  onUpdate: (partial: string) => void,
): Promise<void> {
  const len = text.length;

  // For long responses (product knowledge answers), render in fast chunks
  // to avoid 15+ second wait on 2000+ char responses
  if (len > 200) {
    // Fast chunk mode: render ~80 chars at a time with short delays
    const chunkSize = 80;
    let pos = 0;
    while (pos < len) {
      // Try to break at a newline or space for clean rendering
      let end = Math.min(pos + chunkSize, len);
      if (end < len) {
        const nlIdx = text.indexOf('\n', pos + Math.floor(chunkSize * 0.6));
        if (nlIdx > 0 && nlIdx <= end + 20) {
          end = nlIdx + 1; // Break at newline
        }
      }
      pos = end;
      onUpdate(text.slice(0, pos));
      await new Promise((r) => setTimeout(r, 18));
    }
    onUpdate(text);
    return;
  }

  // Short responses: character-by-character typing for that polished feel
  const chars = text.split('');
  let partial = '';

  for (let i = 0; i < chars.length; i++) {
    partial += chars[i];

    // Update every few characters for performance (not every single char)
    if (i % 3 === 0 || i === chars.length - 1) {
      onUpdate(partial);
      // Variable delay: faster for spaces/newlines, slower for content
      const delay = chars[i] === '\n' ? 15 : chars[i] === ' ' ? 5 : 8;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  onUpdate(text); // Ensure full text is set
}
