import type {
  DataGridShape,
  DataGridSize,
  DataGridVariant,
} from "./types";

/**
 * DataGrid anatomy + token bindings.
 *
 * Spec references (re-skinned MUI X DataGrid onto M3):
 *   - MUI X DataGrid          https://mui.com/x/react-data-grid/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *
 * The selection cursor is a shared `layoutId` motion span that springs
 * between rows. Its shape morphs from `shape-xs` to the selected
 * `shape` token via motion/react springs — the same M3 Expressive
 * selection pattern used by Tabs / Stepper / Pagination.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer wrapper around the grid (paints variant surface + radius). */
  wrapper: [
    "relative isolate w-full overflow-hidden",
    "outline-none",
    "transition-[background-color,box-shadow,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Inner scroll container — the `role="grid"` host. */
  grid: [
    "relative w-full overflow-x-auto",
    "outline-none",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** A single row (`role="row"`). */
  row: [
    "relative isolate flex w-full items-stretch",
    "outline-none",
    "transition-[background-color,color] duration-short4 ease-standard",
  ].join(" "),
  /** Divider painted between adjacent body rows. */
  rowBodyDivider: "border-b border-outline-variant",
  /** Interactive-row affordance. */
  rowInteractive: [
    "cursor-pointer",
    "focus-visible:outline-none",
  ].join(" "),
  /** Disabled wash for a single row. */
  rowDisabled: "opacity-[0.38] cursor-not-allowed",
  /** Selected row paint (across every cell). */
  rowSelected: "bg-secondary-container text-on-secondary-container",
  /** Error wash for a single row. */
  rowError: "text-error",
  /** State-layer overlay. */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-[1]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Selection cursor (3dp leading bar that morphs shape). */
  cursor: [
    "pointer-events-none absolute z-[2]",
    "left-0 top-1 bottom-1 w-[3px]",
    "bg-primary",
  ].join(" "),
  /** A single cell (`role="gridcell"` / `role="columnheader"`). */
  cell: [
    "relative z-[1] inline-flex shrink-0 items-center",
    "min-w-0",
    "outline-none",
  ].join(" "),
  /** Numeric cell alignment. */
  cellNumeric: "justify-end text-right tabular-nums",
  /** Header cell paint. */
  cellHeader: [
    "text-title-s font-medium text-on-surface",
    "select-none",
  ].join(" "),
  /** Body cell paint. */
  cellBody: [
    "text-body-m",
  ].join(" "),
  /** Header row divider. */
  headerRowDivider: "border-b border-outline-variant",
  /** Sort affordance button inside a sortable header cell. */
  sortButton: [
    "inline-flex items-center gap-1 select-none",
    "outline-none rounded-shape-xs",
    "transition-colors duration-short4 ease-standard",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "cursor-pointer",
  ].join(" "),
  /** Sort caret SVG wrap. */
  sortIcon: [
    "inline-flex h-4 w-4 items-center justify-center",
    "transition-transform duration-short4 ease-standard",
  ].join(" "),
  /** Header leading icon wrap. */
  headerIcon: [
    "inline-flex h-4 w-4 shrink-0 items-center justify-center",
  ].join(" "),
  /** Checkbox cell wrap (leading column when `showCheckboxes`). */
  checkboxCell: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "outline-none",
    "w-12",
  ].join(" "),
  /** Checkbox host visual. */
  checkboxBox: [
    "relative inline-flex h-[18px] w-[18px] items-center justify-center",
    "rounded-shape-xs",
    "border-2 border-on-surface-variant",
    "transition-[background-color,border-color] duration-short4 ease-standard",
  ].join(" "),
  /** Checkbox checked paint. */
  checkboxChecked: "bg-primary border-primary text-on-primary",
  /** Checkmark glyph inside a checked checkbox. */
  checkboxGlyph: [
    "inline-flex h-3 w-3 items-center justify-center",
    "text-on-primary",
  ].join(" "),
  /** Empty-state row painted when `rows.length === 0`. */
  empty: [
    "flex w-full items-center justify-center",
    "py-8 text-body-m text-on-surface-variant",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Outer wrapper paint. */
  wrapper: string;
  /** Selection cursor paint. */
  cursor: string;
  /** Sort caret color when active. */
  sortActive: string;
}

/** Variant matrix. */
export const variantClasses: Record<DataGridVariant, VariantStyles> = {
  filled: {
    wrapper: "bg-transparent",
    cursor: "bg-primary",
    sortActive: "text-primary",
  },
  tonal: {
    wrapper: "bg-surface-container",
    cursor: "bg-secondary",
    sortActive: "text-secondary",
  },
  outlined: {
    wrapper: "bg-transparent border border-outline-variant",
    cursor: "bg-primary",
    sortActive: "text-primary",
  },
  text: {
    wrapper: "bg-transparent",
    cursor: "bg-primary",
    sortActive: "text-primary",
  },
  elevated: {
    wrapper: "bg-surface-container-low shadow-elevation-1",
    cursor: "bg-primary",
    sortActive: "text-primary",
  },
};

interface SizeBlock {
  /** Body row min-height (M3 density). */
  rowHeight: string;
  /** Header row min-height. */
  headerHeight: string;
  /** Body cell padding. */
  cellPadding: string;
  /** Header cell padding. */
  headerPadding: string;
  /** Body cell type role. */
  bodyType: string;
}

/**
 * Density scale.
 *
 *   sm : 36dp row / body-s   (compact)
 *   md : 52dp row / body-m   (M3 default)
 *   lg : 72dp row / body-m   (comfortable)
 */
export const sizeClasses: Record<DataGridSize, SizeBlock> = {
  sm: {
    rowHeight: "min-h-[36px]",
    headerHeight: "min-h-[36px]",
    cellPadding: "px-3 py-1.5",
    headerPadding: "px-3 py-1.5",
    bodyType: "text-body-s",
  },
  md: {
    rowHeight: "min-h-[52px]",
    headerHeight: "min-h-[52px]",
    cellPadding: "px-4 py-3",
    headerPadding: "px-4 py-3",
    bodyType: "text-body-m",
  },
  lg: {
    rowHeight: "min-h-[72px]",
    headerHeight: "min-h-[72px]",
    cellPadding: "px-4 py-5",
    headerPadding: "px-4 py-5",
    bodyType: "text-body-m",
  },
};

/** Wrapper + cursor shape mapping. */
export const shapeClasses: Record<DataGridShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/** Sticky-header utilities applied to the header row when enabled. */
export const stickyHeaderClasses = [
  "sticky top-0 z-[3]",
  "bg-surface",
].join(" ");
