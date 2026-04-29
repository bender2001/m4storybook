import type { TransferListSize, TransferListVariant } from "./types";

/**
 * M3 Transfer List anatomy → Tailwind class strings. Token-driven.
 *
 * Layout: a 3-column grid (source card | center action rail | target
 * card). The center rail holds 4 M3 Icon Buttons that move items
 * between columns:
 *   ⪻ — move all from target to source
 *   ←  — move selected from target to source
 *   →  — move selected from source to target
 *   ⪼ — move all from source to target
 *
 * Each card is an M3 surface-container-low (filled) or transparent
 * outlined card with rounded-shape-md corners and elevation-0. The
 * card holds a header row (label + selected-count) and a scrollable
 * list. Each row in the list pairs a 24dp M3 Checkbox with the
 * label + optional description. Hovering, focusing and pressing a
 * row paint the M3 state-layer at 0.08 / 0.10 / 0.10.
 *
 * Motion: row hover + checkbox tick uses `medium2 (300ms)` with
 * `emphasized` easing. The arrow icons are M3 Icon Buttons so they
 * use the standard ripple / state-layer.
 */
export const anatomy = {
  /** Outer wrapper holding the 3-column grid + helper text. */
  root: "inline-flex w-full flex-col gap-2 font-sans",
  /** 3-column grid (source | rail | target). */
  grid: "grid w-full grid-cols-[1fr_auto_1fr] gap-3 items-stretch",
  /** Card column wrapper. */
  card: [
    "flex min-w-0 flex-col overflow-hidden",
    "rounded-shape-md",
    "transition-[background-color,border-color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Card header row (label + selected count). */
  cardHeader: [
    "flex items-center justify-between gap-2",
    "px-4 py-3",
    "border-b border-outline-variant",
  ].join(" "),
  cardTitle: "text-title-s text-on-surface truncate",
  cardCount: "text-label-s text-on-surface-variant tabular-nums",
  /** Scrollable list area. */
  list: [
    "flex-1 overflow-auto py-1",
    "outline-none",
  ].join(" "),
  /** A single row inside the list. */
  row: [
    "relative flex w-full items-center gap-3 px-4",
    "cursor-pointer select-none",
    "outline-none",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  /** State-layer painted across the row. */
  rowStateLayer: [
    "pointer-events-none absolute inset-0",
    "transition-opacity duration-short4 ease-standard",
    "bg-on-surface",
  ].join(" "),
  /** Row label column. */
  rowText: "relative z-[1] flex min-w-0 flex-col",
  rowLabel: "text-body-l text-on-surface truncate",
  rowDescription: "text-body-s text-on-surface-variant truncate",
  /** Center rail holding the 4 arrow buttons. */
  rail: "flex flex-col items-center justify-center gap-2",
  /** A single arrow button. */
  arrowButton: [
    "relative inline-flex h-10 w-10 items-center justify-center",
    "rounded-shape-full",
    "text-on-surface",
    "outline-none",
    "transition-[background-color,color,opacity] duration-short4 ease-standard",
    "disabled:cursor-not-allowed disabled:opacity-[0.38]",
    "hover:bg-on-surface/[0.08] focus-visible:bg-on-surface/[0.10]",
    "active:bg-on-surface/[0.10]",
    "focus-visible:ring-2 focus-visible:ring-primary/60",
  ].join(" "),
  arrowIcon: "h-5 w-5",
  /** 24dp checkbox box (visual only — wraps the M3 Checkbox). */
  checkboxSlot:
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  /** Helper text row. */
  helperText: "px-1 text-body-s text-on-surface-variant",
} as const;

interface VariantClasses {
  /** Card classes (background + border). */
  card: string;
}

export const variantClasses: Record<TransferListVariant, VariantClasses> = {
  filled: {
    card: "bg-surface-container-low",
  },
  outlined: {
    card: "bg-transparent border border-outline-variant",
  },
};

interface SizeSpec {
  /** Card height. */
  cardHeight: string;
  /** Row height. */
  rowHeight: string;
  /** Type role for the row label. */
  rowLabelType: string;
}

export const sizeSpec: Record<TransferListSize, SizeSpec> = {
  sm: {
    cardHeight: "h-48",
    rowHeight: "h-8",
    rowLabelType: "text-body-m",
  },
  md: {
    cardHeight: "h-60",
    rowHeight: "h-10",
    rowLabelType: "text-body-l",
  },
  lg: {
    cardHeight: "h-72",
    rowHeight: "h-12",
    rowLabelType: "text-body-l",
  },
};
