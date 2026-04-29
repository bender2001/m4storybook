import type { TableSize, TableVariant } from "./types";

/**
 * Table anatomy. M3 has no formal Table component, so we re-skin the
 * MUI Table with M3 tokens (per the spec's "MUI fallback" rule).
 *  - Container: surface (standard), surface-container (filled),
 *    1dp outline-variant border (outlined), surface-container-low
 *    + elevation-1 (elevated).
 *  - Header: title-s text in on-surface, separated from body rows by
 *    a 1dp outline-variant divider.
 *  - Rows: body-m text in on-surface, divided by outline-variant 1dp
 *    dividers between adjacent body rows.
 *  - Cells: 16dp horizontal padding, vertical scales by size; numeric
 *    cells right-align.
 *  - Heights: sm = 40dp, md = 52dp, lg = 72dp.
 *  - Selected rows paint secondary-container behind the row.
 *  - State layers paint on-surface at 0.08 hover / 0.10 focus per the
 *    M3 state-layer tokens.
 */
export const anatomy = {
  /**
   * Outer wrapper that lets `stickyHeader` work — the table itself is
   * `display: table`, so we wrap it in a scrollable region. The
   * wrapper carries the variant container fill + radius so the inner
   * `<table>` stays semantic.
   */
  wrapper: [
    "relative w-full overflow-x-auto",
    "transition-[background-color,border-color,box-shadow] duration-short4 ease-standard",
  ].join(" "),
  /**
   * The `<table>` element itself. `border-collapse` is critical so
   * the 1dp dividers between rows don't double up.
   */
  root: [
    "w-full border-collapse text-left",
    "text-on-surface",
  ].join(" "),
  caption: [
    "caption-top py-3 px-4 text-title-m text-on-surface text-left",
  ].join(" "),
  /** Header section — divided from body by an outline-variant border. */
  thead: [
    "border-b border-outline-variant",
    "bg-transparent",
  ].join(" "),
  tbody: "",
  /** Footer section — top-bordered total/summary rows. */
  tfoot: [
    "border-t border-outline-variant",
  ].join(" "),
  row: [
    "relative isolate transition-[background-color,color] duration-short4 ease-standard",
  ].join(" "),
  /**
   * Divider between adjacent body rows. Applied only to body rows
   * (head/foot rows draw their own border via the section wrapper).
   * Last body row drops the divider so the table edge doesn't double
   * up against the wrapper.
   */
  rowBodyDivider: "border-b border-outline-variant last:border-b-0",
  rowInteractive: [
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
  ].join(" "),
  rowDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  rowSelectedBg: "bg-secondary-container",
  rowSelectedText: "text-on-secondary-container",
  rowDefaultText: "text-on-surface",
  /** State-layer overlay for interactive rows (positioned via cell). */
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "bg-on-surface",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  cell: [
    "relative align-middle",
  ].join(" "),
  cellHeader: [
    "text-title-s text-on-surface",
    "font-medium",
  ].join(" "),
  cellBody: [
    "text-body-m",
  ].join(" "),
  cellNumeric: "text-right tabular-nums",
  /** Sort button rendered inside a sortable header cell. */
  sortButton: [
    "inline-flex items-center gap-1 select-none",
    "outline-none rounded-shape-xs",
    "transition-colors duration-short4 ease-standard",
    "focus-visible:ring-2 focus-visible:ring-primary",
  ].join(" "),
  sortIcon: [
    "inline-flex h-4 w-4 items-center justify-center",
    "transition-transform duration-short4 ease-standard",
  ].join(" "),
} as const;

export const variantClasses: Record<TableVariant, { wrapper: string }> = {
  standard: {
    wrapper: "bg-transparent",
  },
  filled: {
    wrapper: "bg-surface-container rounded-shape-sm",
  },
  outlined: {
    wrapper: "border border-outline-variant rounded-shape-sm bg-transparent",
  },
  elevated: {
    wrapper: "bg-surface-container-low rounded-shape-sm shadow-elevation-1",
  },
};

/**
 * Per-size cell heights + padding. The header height matches the body
 * row height so a sticky header sits flush against the first body row.
 */
export const sizeClasses: Record<
  TableSize,
  {
    rowMinHeight: string;
    cellPadding: string;
    headerCellPadding: string;
  }
> = {
  sm: {
    rowMinHeight: "h-[40px]",
    cellPadding: "px-3 py-1.5",
    headerCellPadding: "px-3 py-1.5",
  },
  md: {
    rowMinHeight: "h-[52px]",
    cellPadding: "px-4 py-2.5",
    headerCellPadding: "px-4 py-2.5",
  },
  lg: {
    rowMinHeight: "h-[72px]",
    cellPadding: "px-4 py-4",
    headerCellPadding: "px-4 py-4",
  },
};

/**
 * Sticky-header utilities. Applied to `<th>` cells when the Table
 * receives `stickyHeader`.
 */
export const stickyHeaderClasses = [
  "sticky top-0 z-[1]",
  "bg-surface",
].join(" ");
