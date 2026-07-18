import type React from 'react';

// ─── Segment ────────────────────────────────────────────────────────────────

export interface AudienceSegment {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
  talkingPoint?: string;
  /** For static-data segments: filter predicate */
  filter?: (item: any) => boolean;
  /** For simple key-value segments (Farmers-style): applied as exact-match filters */
  filters?: Record<string, string>;
}

export interface AudienceSegmentCategory {
  key: string;
  label: string;
}

// ─── Filter ─────────────────────────────────────────────────────────────────

export interface AudienceFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface AudienceFilter {
  key: string;
  label: string;
  icon: React.ElementType;
  options: AudienceFilterOption[];
  showCount?: boolean;
}

// ─── Column ─────────────────────────────────────────────────────────────────

export interface AudienceColumn<T> {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  hideBelow?: 'md' | 'lg' | 'xl';
  render: (item: T) => React.ReactNode;
}

// ─── Stat ───────────────────────────────────────────────────────────────────

export interface AudienceStat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: string;
}

// ─── Config ─────────────────────────────────────────────────────────────────

export interface AudienceConfig<T> {
  /** Page header */
  title: React.ReactNode;
  accentColor?: string; // e.g. 'red', 'violet'

  /** Segments */
  segments: AudienceSegment[];
  segmentCategories: AudienceSegmentCategory[];
  segmentIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>>;

  /** Stats row — computed from (allData, filteredData) */
  stats: (all: T[], filtered: T[]) => AudienceStat[];

  /** Filters */
  filters: (data: T[]) => AudienceFilter[];

  /** Filter function — applies dropdown filters */
  applyFilters: (data: T[], filterValues: Record<string, string>) => T[];

  /** Search */
  searchPlaceholder?: string;
  searchFn: (item: T, query: string) => boolean;

  /** Table columns */
  columns: AudienceColumn<T>[];
  colWidths?: string[];
  defaultSort: { field: string; dir: 'asc' | 'desc' };
  sortFn: (a: T, b: T, field: string) => number;

  /** Row styling */
  rowClassName?: (item: T) => string;

  /** Item identity */
  getItemId: (item: T) => string;
  itemLabel?: string; // 'company', 'contact', etc.

  /** Drawer */
  renderDrawer: (item: T, onClose: () => void, helpers?: any) => React.ReactNode;

  /** Slots for per-audience unique content */
  sidebarFooter?: React.ReactNode;
  aboveTable?: React.ReactNode;
  renderInsightBar?: (segmentId: string, segments: AudienceSegment[], filteredCount: number) => React.ReactNode;

  /** Data source */
  data: T[];
  pageSize?: number;
}
