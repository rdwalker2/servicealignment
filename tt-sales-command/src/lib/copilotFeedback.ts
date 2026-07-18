// ============================================================
// Copilot Feedback — Persists 👍/👎 feedback on copilot responses
// for accuracy review and knowledge base improvement.
// ============================================================

export interface CopilotFeedback {
  id: string;
  messageId: string;
  query: string;
  responseSnippet: string;
  feedback: 'up' | 'down';
  timestamp: number;
  userName?: string;
}

const FEEDBACK_KEY = 'scc_copilot_feedback';
const MAX_FEEDBACK_ITEMS = 200;

/**
 * Save feedback for a copilot response.
 */
export function saveFeedback(entry: Omit<CopilotFeedback, 'id' | 'timestamp'>): void {
  try {
    const existing = loadAllFeedback();
    const newEntry: CopilotFeedback = {
      ...entry,
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };
    existing.push(newEntry);

    // Trim to max
    const trimmed = existing.slice(-MAX_FEEDBACK_ITEMS);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage might be full or unavailable
    console.warn('[CopilotFeedback] Failed to persist feedback');
  }
}

/**
 * Load all stored feedback entries.
 */
export function loadAllFeedback(): CopilotFeedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get only negative feedback (for review).
 */
export function getNegativeFeedback(): CopilotFeedback[] {
  return loadAllFeedback().filter(f => f.feedback === 'down');
}

/**
 * Get feedback stats.
 */
export function getFeedbackStats(): { total: number; positive: number; negative: number; accuracy: number } {
  const all = loadAllFeedback();
  const positive = all.filter(f => f.feedback === 'up').length;
  const negative = all.filter(f => f.feedback === 'down').length;
  return {
    total: all.length,
    positive,
    negative,
    accuracy: all.length > 0 ? positive / all.length : 1,
  };
}
