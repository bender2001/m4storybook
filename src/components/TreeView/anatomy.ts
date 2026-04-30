import type {
  TreeViewShape,
  TreeViewSize,
  TreeViewVariant,
} from "./types";

/**
 * TreeView anatomy + token bindings.
 *
 * Spec references (re-skinned MUI X TreeView onto M3):
 *   - MUI X TreeView          https://mui.com/x/react-tree-view/
 *   - M3 color roles          https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale          https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens     https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens   https://m3.material.io/foundations/interaction/states
 *   - M3 list specs           https://m3.material.io/components/lists/specs
 *
 * The selection cursor is a shared `layoutId` motion span that springs
 * between rows. Its shape morphs from `shape-xs` to the selected
 * `shape` token via motion/react springs — the same M3 Expressive
 * selection pattern used by Tabs / Stepper / Pagination / DataGrid.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer wrapper around the tree. Paints variant surface + radius. */
  wrapper: [
    "relative isolate w-full overflow-hidden",
    "outline-none",
    "transition-[background-color,box-shadow,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:outline-none",
  ].join(" "),
  /** The `role="tree"` host (the actual UL). */
  tree: [
    "relative w-full",
    "outline-none m-0 p-0 list-none",
  ].join(" "),
  /** A child group (the nested UL when an item is expanded). */
  group: [
    "relative w-full",
    "m-0 p-0 list-none",
    "overflow-hidden",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** A single tree item (the LI). */
  item: ["relative isolate block w-full"].join(" "),
  /** The interactive row inside an item. */
  row: [
    "relative isolate flex w-full items-center",
    "outline-none select-none",
    "transition-[background-color,color] duration-short4 ease-standard",
    "focus-visible:outline-none",
  ].join(" "),
  /** Disabled wash for a single row. */
  rowDisabled: "opacity-[0.38] cursor-not-allowed",
  /** Interactive-row affordance. */
  rowInteractive: ["cursor-pointer"].join(" "),
  /** Selected row paint. */
  rowSelected: "bg-secondary-container text-on-secondary-container",
  /** Error row foreground. */
  rowError: "text-error",
  /** State-layer overlay (animated opacity). */
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
  /** Caret button (expand/collapse toggle). */
  caret: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "h-6 w-6 rounded-shape-full",
    "outline-none",
    "transition-transform duration-short4 ease-standard",
    "text-on-surface-variant",
    "focus-visible:ring-2 focus-visible:ring-primary",
  ].join(" "),
  /** Caret SVG glyph. */
  caretIcon: ["block h-4 w-4"].join(" "),
  /** Leaf indicator dot (replaces the caret on leaf nodes). */
  leafDot: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "h-6 w-6",
  ].join(" "),
  /** Leaf inner dot. */
  leafDotInner: ["block h-1.5 w-1.5 rounded-shape-full bg-on-surface-variant"].join(
    " ",
  ),
  /** Leading icon slot (when an item supplies `icon`). */
  icon: [
    "relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center",
  ].join(" "),
  /** Trailing icon slot. */
  endIcon: [
    "relative z-[1] inline-flex h-6 w-6 shrink-0 items-center justify-center ml-auto",
    "text-on-surface-variant",
  ].join(" "),
  /** Label column (label + secondary stack). */
  labelStack: [
    "relative z-[1] flex min-w-0 flex-1 flex-col text-left",
  ].join(" "),
  /** Primary label text. */
  label: ["truncate font-medium leading-snug text-current"].join(" "),
  /** Secondary text below the label. */
  secondary: [
    "truncate text-body-s text-on-surface-variant leading-snug",
  ].join(" "),
} as const;

interface VariantStyles {
  /** Outer wrapper paint. */
  wrapper: string;
  /** Selection cursor paint (when interactive). */
  cursor: string;
  /** Caret active color. */
  caretActive: string;
}

/** Variant matrix. */
export const variantClasses: Record<TreeViewVariant, VariantStyles> = {
  text: {
    wrapper: "bg-transparent text-on-surface",
    cursor: "bg-primary",
    caretActive: "text-primary",
  },
  filled: {
    wrapper: "bg-surface-container-highest text-on-surface",
    cursor: "bg-primary",
    caretActive: "text-primary",
  },
  tonal: {
    wrapper: "bg-secondary-container text-on-secondary-container",
    cursor: "bg-secondary",
    caretActive: "text-secondary",
  },
  outlined: {
    wrapper:
      "bg-transparent text-on-surface border border-outline-variant",
    cursor: "bg-primary",
    caretActive: "text-primary",
  },
  elevated: {
    wrapper:
      "bg-surface-container-low text-on-surface shadow-elevation-2",
    cursor: "bg-primary",
    caretActive: "text-primary",
  },
};

interface SizeBlock {
  /** Row min-height. */
  rowHeight: string;
  /** Row horizontal padding. */
  rowPadding: string;
  /** Body label type role. */
  labelType: string;
  /** Indent step in px (per nesting level). */
  indent: number;
  /** Row gap between caret/icon and label. */
  gap: string;
  /** Wrapper outer padding. */
  wrapperPadding: string;
}

/**
 * Density scale. M3 default reads as `md` (40dp row, body-m).
 */
export const sizeClasses: Record<TreeViewSize, SizeBlock> = {
  sm: {
    rowHeight: "min-h-[32px]",
    rowPadding: "px-2",
    labelType: "text-body-s",
    indent: 16,
    gap: "gap-1.5",
    wrapperPadding: "p-1",
  },
  md: {
    rowHeight: "min-h-[40px]",
    rowPadding: "px-3",
    labelType: "text-body-m",
    indent: 24,
    gap: "gap-2",
    wrapperPadding: "p-2",
  },
  lg: {
    rowHeight: "min-h-[56px]",
    rowPadding: "px-4",
    labelType: "text-body-l",
    indent: 32,
    gap: "gap-3",
    wrapperPadding: "p-3",
  },
};

/** Wrapper + cursor shape mapping. */
export const shapeClasses: Record<TreeViewShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
