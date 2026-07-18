// ============================================================
// GranolaReviewDrawer — Slide-in review panel for auto-synced
// Granola meeting notes. Shows auto-applied fields (collapsed)
// and pending review fields grouped by meeting.
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X, Check, ChevronDown, ChevronRight, CheckCircle2,
  AlertTriangle, XCircle, Quote, RefreshCw, Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ── Types ──────────────────────────────────────────────────────

interface PendingField {
  key: string;
  label: string;
  section: 'call_sheet' | 'bap' | 'meddpicc' | 'deal_intel' | 'meta';
  value: any;
  confidence: 'high' | 'medium' | 'low';
  evidence?: string;
  existingValue?: any;
  hasConflict?: boolean;
}

interface SyncQueueRow {
  id: string;
  granola_note_id: string;
  granola_note_title: string | null;
  granola_note_date: string | null;
  session_id: string;
  company_name: string | null;
  match_tier: number;
  match_confidence: string;
  extracted_fields: any;
  auto_applied_fields: PendingField[] | null;
  pending_review_fields: PendingField[] | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface GranolaReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessionIds: string[];
  onFieldAccepted?: (syncId: string, fieldKey: string, value: any) => void;
  onFieldRejected?: (syncId: string, fieldKey: string) => void;
  onSyncDismissed?: (syncId: string) => void;
}

// ── Section color config ───────────────────────────────────────

const SECTION_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  call_sheet: { bg: '#EFF6FF', text: '#2563EB', label: 'Call Sheet' },
  bap:        { bg: '#F5F3FF', text: '#7C3AED', label: 'BAP' },
  meddpicc:   { bg: '#FFF7ED', text: '#EA580C', label: 'MEDDPICC' },
  deal_intel:  { bg: '#ECFDF5', text: '#059669', label: 'Deal Intel' },
  meta:       { bg: '#F5F5F4', text: '#78716C', label: 'Meta' },
};

const CONFIDENCE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: '#ECFDF5', text: '#059669', label: 'High' },
  medium: { bg: '#FFFBEB', text: '#D97706', label: 'Medium' },
  low:    { bg: '#F4F4F5', text: '#71717A', label: 'Low' },
};

// ── Keyframe injection ─────────────────────────────────────────

let drawerStylesInjected = false;
function injectDrawerKeyframes() {
  if (drawerStylesInjected) return;
  drawerStylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes granolaDrawerOverlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes granolaDrawerOverlayOut {
      from { opacity: 1; }
      to   { opacity: 0; }
    }
    @keyframes granolaDrawerSlideIn {
      from { transform: translateX(100%); }
      to   { transform: translateX(0); }
    }
    @keyframes granolaDrawerSlideOut {
      from { transform: translateX(0); }
      to   { transform: translateX(100%); }
    }
    @keyframes granolaFieldFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ── Component ──────────────────────────────────────────────────

export function GranolaReviewDrawer({
  isOpen,
  onClose,
  sessionIds,
  onFieldAccepted,
  onFieldRejected,
  onSyncDismissed,
}: GranolaReviewDrawerProps) {
  const [syncItems, setSyncItems] = useState<SyncQueueRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [autoAppliedExpanded, setAutoAppliedExpanded] = useState(false);
  const [processingFields, setProcessingFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    injectDrawerKeyframes();
  }, []);

  // ── Fetch sync queue items ──

  const fetchItems = useCallback(async () => {
    if (!sessionIds.length) {
      setSyncItems([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('granola_sync_queue')
        .select('*')
        .in('session_id', sessionIds)
        .in('status', ['pending', 'reviewed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[GranolaReviewDrawer] fetch error:', error);
        return;
      }
      setSyncItems((data as SyncQueueRow[]) ?? []);
    } catch (err) {
      console.error('[GranolaReviewDrawer] fetch exception:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionIds]);

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      setIsClosing(false);
    }
  }, [isOpen, fetchItems]);

  // ── Realtime subscription ──

  useEffect(() => {
    if (!isOpen || !sessionIds.length) return;

    const channel = supabase
      .channel('granola-review-drawer')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'granola_sync_queue',
        },
        () => {
          // Refetch on any change
          fetchItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, sessionIds, fetchItems]);

  // ── Derived data ──

  const pendingItems = useMemo(
    () => syncItems.filter(item => item.status === 'pending' && (item.pending_review_fields?.length ?? 0) > 0),
    [syncItems],
  );

  const allAutoApplied = useMemo(() => {
    const fields: (PendingField & { syncId: string; meetingTitle: string | null })[] = [];
    for (const item of syncItems) {
      for (const field of item.auto_applied_fields ?? []) {
        fields.push({ ...field, syncId: item.id, meetingTitle: item.granola_note_title });
      }
    }
    return fields;
  }, [syncItems]);

  const totalPendingFields = useMemo(
    () => pendingItems.reduce((sum, item) => sum + (item.pending_review_fields?.length ?? 0), 0),
    [pendingItems],
  );

  // ── Actions ──

  const handleAcceptField = useCallback(async (syncItem: SyncQueueRow, field: PendingField) => {
    const fieldId = `${syncItem.id}:${field.key}`;
    setProcessingFields(prev => new Set(prev).add(fieldId));

    try {
      // Move field from pending to auto_applied
      const newPending = (syncItem.pending_review_fields ?? []).filter(f => f.key !== field.key);
      const newApplied = [...(syncItem.auto_applied_fields ?? []), field];
      const newStatus = newPending.length === 0 ? 'reviewed' : 'pending';

      const { error } = await supabase
        .from('granola_sync_queue')
        .update({
          pending_review_fields: newPending,
          auto_applied_fields: newApplied,
          status: newStatus,
          ...(newStatus === 'reviewed' ? { reviewed_at: new Date().toISOString() } : {}),
        })
        .eq('id', syncItem.id);

      if (error) {
        console.error('[GranolaReviewDrawer] accept error:', error);
        return;
      }

      // Update local state
      setSyncItems(prev =>
        prev.map(item =>
          item.id === syncItem.id
            ? { ...item, pending_review_fields: newPending, auto_applied_fields: newApplied, status: newStatus }
            : item,
        ),
      );

      onFieldAccepted?.(syncItem.id, field.key, field.value);
    } finally {
      setProcessingFields(prev => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
    }
  }, [onFieldAccepted]);

  const handleRejectField = useCallback(async (syncItem: SyncQueueRow, field: PendingField) => {
    const fieldId = `${syncItem.id}:${field.key}`;
    setProcessingFields(prev => new Set(prev).add(fieldId));

    try {
      const newPending = (syncItem.pending_review_fields ?? []).filter(f => f.key !== field.key);
      const newStatus = newPending.length === 0 ? 'reviewed' : 'pending';

      const { error } = await supabase
        .from('granola_sync_queue')
        .update({
          pending_review_fields: newPending,
          status: newStatus,
          ...(newStatus === 'reviewed' ? { reviewed_at: new Date().toISOString() } : {}),
        })
        .eq('id', syncItem.id);

      if (error) {
        console.error('[GranolaReviewDrawer] reject error:', error);
        return;
      }

      setSyncItems(prev =>
        prev.map(item =>
          item.id === syncItem.id
            ? { ...item, pending_review_fields: newPending, status: newStatus }
            : item,
        ),
      );

      onFieldRejected?.(syncItem.id, field.key);
    } finally {
      setProcessingFields(prev => {
        const next = new Set(prev);
        next.delete(fieldId);
        return next;
      });
    }
  }, [onFieldRejected]);

  const handleAcceptAll = useCallback(async (syncItem: SyncQueueRow) => {
    const pending = syncItem.pending_review_fields ?? [];
    if (!pending.length) return;

    // Mark all fields as processing
    const fieldIds = pending.map(f => `${syncItem.id}:${f.key}`);
    setProcessingFields(prev => {
      const next = new Set(prev);
      fieldIds.forEach(id => next.add(id));
      return next;
    });

    try {
      const newApplied = [...(syncItem.auto_applied_fields ?? []), ...pending];

      const { error } = await supabase
        .from('granola_sync_queue')
        .update({
          pending_review_fields: [],
          auto_applied_fields: newApplied,
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', syncItem.id);

      if (error) {
        console.error('[GranolaReviewDrawer] accept all error:', error);
        return;
      }

      setSyncItems(prev =>
        prev.map(item =>
          item.id === syncItem.id
            ? { ...item, pending_review_fields: [], auto_applied_fields: newApplied, status: 'reviewed' }
            : item,
        ),
      );

      for (const field of pending) {
        onFieldAccepted?.(syncItem.id, field.key, field.value);
      }
    } finally {
      setProcessingFields(prev => {
        const next = new Set(prev);
        fieldIds.forEach(id => next.delete(id));
        return next;
      });
    }
  }, [onFieldAccepted]);

  const handleDismiss = useCallback(async (syncItem: SyncQueueRow) => {
    try {
      const { error } = await supabase
        .from('granola_sync_queue')
        .update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
        .eq('id', syncItem.id);

      if (error) {
        console.error('[GranolaReviewDrawer] dismiss error:', error);
        return;
      }

      setSyncItems(prev => prev.filter(item => item.id !== syncItem.id));
      onSyncDismissed?.(syncItem.id);
    } catch (err) {
      console.error('[GranolaReviewDrawer] dismiss exception:', err);
    }
  }, [onSyncDismissed]);

  // ── Close with animation ──

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 280);
  }, [onClose]);

  // ── Don't render when fully closed ──

  if (!isOpen && !isClosing) return null;

  // ── Styles ──

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(2px)',
    animation: isClosing
      ? 'granolaDrawerOverlayOut 0.28s ease-out forwards'
      : 'granolaDrawerOverlayIn 0.22s ease-out forwards',
  };

  const drawerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '480px',
    maxWidth: '100vw',
    zIndex: 51,
    backgroundColor: '#FAFAF9',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.12)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    animation: isClosing
      ? 'granolaDrawerSlideOut 0.28s ease-in forwards'
      : 'granolaDrawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  };

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={handleClose} />

      {/* Drawer Panel */}
      <div style={drawerStyle}>
        {/* ── Header ── */}
        <DrawerHeader
          pendingCount={pendingItems.length}
          totalPendingFields={totalPendingFields}
          onClose={handleClose}
        />

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* Auto-Applied Section */}
              {allAutoApplied.length > 0 && (
                <AutoAppliedSection
                  fields={allAutoApplied}
                  expanded={autoAppliedExpanded}
                  onToggle={() => setAutoAppliedExpanded(prev => !prev)}
                />
              )}

              {/* Needs Review Section */}
              {pendingItems.length > 0 ? (
                <div style={{ marginTop: allAutoApplied.length > 0 ? '20px' : 0 }}>
                  {pendingItems.map(item => (
                    <MeetingReviewCard
                      key={item.id}
                      syncItem={item}
                      processingFields={processingFields}
                      onAccept={(field) => handleAcceptField(item, field)}
                      onReject={(field) => handleRejectField(item, field)}
                      onAcceptAll={() => handleAcceptAll(item)}
                      onDismiss={() => handleDismiss(item)}
                    />
                  ))}
                </div>
              ) : (
                !loading && allAutoApplied.length === 0 && <EmptyState />
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <DrawerFooter
          remainingCount={totalPendingFields}
          onClose={handleClose}
        />
      </div>
    </>
  );
}

// ── Sub-Components ─────────────────────────────────────────────

function DrawerHeader({
  pendingCount,
  totalPendingFields,
  onClose,
}: {
  pendingCount: number;
  totalPendingFields: number;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #E7E5E4',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#F05A28' }} />
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em' }}>
              Meeting Auto-Sync
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#78716C', lineHeight: 1.4 }}>
            {pendingCount > 0
              ? `${pendingCount} meeting${pendingCount !== 1 ? 's' : ''} synced · ${totalPendingFields} item${totalPendingFields !== 1 ? 's' : ''} need review`
              : 'All synced meetings reviewed'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            color: '#A8A29E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s, background-color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#57534E';
            e.currentTarget.style.backgroundColor = '#F5F5F4';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#A8A29E';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Close drawer"
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
}

function DrawerFooter({
  remainingCount,
  onClose,
}: {
  remainingCount: number;
  onClose: () => void;
}) {
  const allDone = remainingCount === 0;

  return (
    <div
      style={{
        padding: '14px 20px',
        borderTop: '1px solid #E7E5E4',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span style={{ fontSize: '12px', color: '#A8A29E' }}>
        {allDone ? 'All items reviewed' : `${remainingCount} item${remainingCount !== 1 ? 's' : ''} remaining`}
      </span>
      <button
        onClick={onClose}
        style={{
          padding: '8px 20px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background-color 0.15s, transform 0.1s',
          backgroundColor: allDone ? '#059669' : '#F5F5F4',
          color: allDone ? '#fff' : '#57534E',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.backgroundColor = allDone ? '#047857' : '#E7E5E4';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = allDone ? '#059669' : '#F5F5F4';
        }}
      >
        {allDone ? '✓ All Done' : 'Close'}
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#A8A29E',
      }}
    >
      <RefreshCw
        style={{ width: '24px', height: '24px', animation: 'spin 1.5s linear infinite' }}
      />
      <p style={{ margin: '12px 0 0', fontSize: '13px' }}>Loading sync queue…</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <CheckCircle2 style={{ width: '32px', height: '32px', color: '#059669' }} />
      <p style={{ margin: '12px 0 4px', fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>
        All caught up
      </p>
      <p style={{ margin: 0, fontSize: '13px', color: '#A8A29E' }}>
        No pending meeting syncs to review.
      </p>
    </div>
  );
}

// ── Auto-Applied Section ───────────────────────────────────────

function AutoAppliedSection({
  fields,
  expanded,
  onToggle,
}: {
  fields: (PendingField & { syncId: string; meetingTitle: string | null })[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      style={{
        backgroundColor: '#ECFDF5',
        borderRadius: '10px',
        border: '1px solid #A7F3D0',
        overflow: 'hidden',
      }}
    >
      {/* Toggle header */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#059669',
          textAlign: 'left',
        }}
      >
        <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
        <span style={{ flex: 1 }}>
          {fields.length} field{fields.length !== 1 ? 's' : ''} auto-applied
        </span>
        <ChevronIcon style={{ width: '14px', height: '14px', color: '#6EE7B7' }} />
      </button>

      {/* Expanded list */}
      {expanded && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {fields.map((field, idx) => {
            const sectionConf = SECTION_COLORS[field.section] ?? SECTION_COLORS.meta;
            return (
              <div
                key={`${field.syncId}-${field.key}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  fontSize: '12px',
                  animation: 'granolaFieldFadeIn 0.2s ease-out forwards',
                  animationDelay: `${idx * 30}ms`,
                  opacity: 0,
                }}
              >
                <Check style={{ width: '12px', height: '12px', color: '#059669', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: '#1C1917', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {field.label}
                </span>
                <SectionBadge section={field.section} />
                <span style={{ color: '#57534E', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatValue(field.value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Meeting Review Card ────────────────────────────────────────

function MeetingReviewCard({
  syncItem,
  processingFields,
  onAccept,
  onReject,
  onAcceptAll,
  onDismiss,
}: {
  syncItem: SyncQueueRow;
  processingFields: Set<string>;
  onAccept: (field: PendingField) => void;
  onReject: (field: PendingField) => void;
  onAcceptAll: () => void;
  onDismiss: () => void;
}) {
  const fields = syncItem.pending_review_fields ?? [];

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #E7E5E4',
        marginBottom: '14px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Meeting header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid #F5F5F4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1C1917', flex: 1, minWidth: 0 }}>
            {syncItem.granola_note_title ?? 'Untitled Meeting'}
          </h3>
          {syncItem.company_name && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {syncItem.company_name}
            </span>
          )}
        </div>
        {syncItem.granola_note_date && (
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#A8A29E' }}>
            {formatDate(syncItem.granola_note_date)}
          </p>
        )}
      </div>

      {/* Fields */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {fields.map((field, idx) => (
          <FieldReviewRow
            key={field.key}
            field={field}
            syncId={syncItem.id}
            isProcessing={processingFields.has(`${syncItem.id}:${field.key}`)}
            onAccept={() => onAccept(field)}
            onReject={() => onReject(field)}
            animationDelay={idx * 40}
          />
        ))}
      </div>

      {/* Card footer actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '10px 16px',
          borderTop: '1px solid #F5F5F4',
          backgroundColor: '#FAFAF9',
        }}
      >
        <ActionButton
          label="Dismiss"
          variant="ghost"
          onClick={onDismiss}
        />
        <ActionButton
          label="Accept All"
          variant="primary"
          onClick={onAcceptAll}
        />
      </div>
    </div>
  );
}

// ── Field Review Row ───────────────────────────────────────────

function FieldReviewRow({
  field,
  syncId,
  isProcessing,
  onAccept,
  onReject,
  animationDelay,
}: {
  field: PendingField;
  syncId: string;
  isProcessing: boolean;
  onAccept: () => void;
  onReject: () => void;
  animationDelay: number;
}) {
  const confidenceConf = CONFIDENCE_COLORS[field.confidence] ?? CONFIDENCE_COLORS.medium;

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: '8px',
        backgroundColor: '#FAFAF9',
        border: '1px solid #F5F5F4',
        animation: 'granolaFieldFadeIn 0.25s ease-out forwards',
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#E7E5E4'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#F5F5F4'; }}
    >
      {/* Top row: label + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1C1917' }}>{field.label}</span>
        <SectionBadge section={field.section} />
        <ConfidenceBadge confidence={field.confidence} />
      </div>

      {/* Value display */}
      {field.hasConflict ? (
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '12px', color: '#DC2626', display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
            <span style={{ fontWeight: 500, flexShrink: 0 }}>Current:</span>
            <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{formatValue(field.existingValue)}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontWeight: 500, flexShrink: 0 }}>New:</span>
            <span style={{ fontWeight: 600 }}>{formatValue(field.value)}</span>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#57534E', marginBottom: '6px' }}>
          {formatValue(field.value)}
        </div>
      )}

      {/* Evidence quote */}
      {field.evidence && (
        <div
          style={{
            borderLeft: '3px solid #D6D3D1',
            paddingLeft: '10px',
            marginBottom: '8px',
            fontSize: '11.5px',
            fontStyle: 'italic',
            color: '#78716C',
            lineHeight: 1.5,
          }}
        >
          <Quote style={{ width: '11px', height: '11px', display: 'inline', verticalAlign: 'middle', marginRight: '4px', opacity: 0.5 }} />
          {field.evidence}
        </div>
      )}

      {/* Accept / Reject buttons */}
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        <IconActionButton
          icon={<X style={{ width: '13px', height: '13px' }} />}
          label="Reject"
          color="#DC2626"
          bgColor="#FEF2F2"
          hoverBgColor="#FEE2E2"
          onClick={onReject}
          disabled={isProcessing}
        />
        <IconActionButton
          icon={<Check style={{ width: '13px', height: '13px' }} />}
          label="Accept"
          color="#059669"
          bgColor="#ECFDF5"
          hoverBgColor="#D1FAE5"
          onClick={onAccept}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}

// ── Reusable mini components ───────────────────────────────────

function SectionBadge({ section }: { section: string }) {
  const conf = SECTION_COLORS[section] ?? SECTION_COLORS.meta;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        borderRadius: '4px',
        backgroundColor: conf.bg,
        color: conf.text,
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
      }}
    >
      {conf.label}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const conf = CONFIDENCE_COLORS[confidence] ?? CONFIDENCE_COLORS.medium;
  const Icon = confidence === 'high' ? CheckCircle2 : confidence === 'medium' ? AlertTriangle : XCircle;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '1px 6px',
        borderRadius: '4px',
        backgroundColor: conf.bg,
        color: conf.text,
        fontSize: '10px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon style={{ width: '10px', height: '10px' }} />
      {conf.label}
    </span>
  );
}

function IconActionButton({
  icon,
  label,
  color,
  bgColor,
  hoverBgColor,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  hoverBgColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '6px',
        border: 'none',
        fontSize: '11px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color,
        backgroundColor: bgColor,
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = hoverBgColor;
          e.currentTarget.style.transform = 'scale(1.03)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = bgColor;
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: 'primary' | 'ghost';
  onClick: () => void;
}) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: '7px',
        border: isPrimary ? 'none' : '1px solid #E7E5E4',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        backgroundColor: isPrimary ? '#F05A28' : '#fff',
        color: isPrimary ? '#fff' : '#57534E',
        transition: 'background-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.backgroundColor = isPrimary ? '#e04e20' : '#F5F5F4';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.backgroundColor = isPrimary ? '#F05A28' : '#fff';
      }}
    >
      {label}
    </button>
  );
}
