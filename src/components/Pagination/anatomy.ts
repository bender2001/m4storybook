import type {
  PaginationShape,
  PaginationSize,
  PaginationVariant,
} from "./types";

/**
 * Pagination anatomy + token bindings.
 *
 * Spec references:
 *   - M3 icon button (used for page items)
 *     https://m3.material.io/components/icon-buttons/specs
 *   - color roles
 *     https://m3.material.io/styles/color/the-color-system/color-roles
 *   - shape scale
 *     https://m3.material.io/styles/shape/shape-scale-tokens
 *   - elevation tokens
 *     https://m3.material.io/styles/elevation/tokens
 *   - state-layer opacities
 *     https://m3.material.io/foundations/interaction/states
 *
 * The host transitions ride `medium2` / `emphasized` (300ms) — the
 * same envelope as the rest of the navigation slice (Drawer / Menu /
 * BottomNavigation). Per-item state layers ride `short4` / `standard`
 * (200ms), matching IconButton.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outer <nav> host. */
  root: [
    "relative isolate inline-flex w-fit max-w-full items-center",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Inner ordered-list. */
  list: "flex w-full items-center",
  /** A single <li> wrapping a page button / arrow / ellipsis. */
  listItem: "relative inline-flex items-center justify-center",
  /** Per-item host (button / span). */
  item: [
    "relative isolate inline-flex shrink-0 items-center justify-center select-none",
    "border-0 outline-none",
    "transition-[color,background-color,border-color] duration-short4 ease-standard",
  ].join(" "),
  /** Foreground role for the resting state (text / outlined variants). */
  itemDefaultText: "text-on-surface",
  /** Foreground role when the item is an arrow (slightly subdued). */
  itemArrowText: "text-on-surface-variant",
  /** Selected fill + foreground (M3 secondary-container). */
  itemSelectedBg: "bg-secondary-container",
  itemSelectedText: "text-on-secondary-container",
  /** Filled-variant per-page resting fill (high-contrast on dark hosts). */
  itemFilledBg: "bg-surface-container-highest text-on-surface",
  /** Disabled wash on a single item. */
  itemDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Focus ring (matches IconButton). */
  itemFocusRing:
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  /** State-layer overlay — opacity is React-driven. */
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "bg-on-surface",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** State-layer base color when selected (rides on-secondary-container). */
  stateLayerSelected: "bg-on-secondary-container",
  /** State-layer base color when in error (rides on-error-container). */
  stateLayerError: "bg-on-error-container",
  /** Ellipsis label paint. */
  ellipsis: [
    "relative inline-flex items-center justify-center",
    "text-on-surface-variant select-none",
  ].join(" "),
} as const;

type ColorBlock = {
  /** Resting host fill + foreground. */
  rest: string;
  /** Error host fill + foreground. */
  error: string;
  /** Optional border. */
  border: string;
  /** Default elevation token. */
  elevation: string;
  /** Arrow / ellipsis foreground. */
  iconColor: string;
};

/**
 * Variant matrix.
 *
 * `text` is the default since M3 typically embeds pagination inside
 * an existing surface (`surface` / `surface-container`). The other
 * variants give the host a paintable container so a Pagination can
 * be lifted out of context.
 */
export const variantClasses: Record<PaginationVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  elevated: {
    rest: "bg-surface-container text-on-surface",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  /** Host padding. */
  hostPad: string;
  /** Gap between items. */
  gap: string;
  /** Min height/width of a per-item button. */
  itemSize: string;
  /** Per-item label type role. */
  itemType: string;
  /** Icon size for arrows / first / last. */
  iconSize: string;
  /** Selected-state radius (M3 squircle morph). */
  selectedRadius: string;
};

/**
 * Density scale.
 *
 *   sm : 32dp item / label-m / 4dp gap   (compact)
 *   md : 40dp item / label-l / 6dp gap   (M3 default — matches icon-button md)
 *   lg : 56dp item / label-l / 8dp gap   (comfortable — matches icon-button lg)
 */
export const sizeClasses: Record<PaginationSize, SizeBlock> = {
  sm: {
    hostPad: "p-1",
    gap: "gap-1",
    itemSize: "h-8 w-8 min-h-[32px] min-w-[32px]",
    itemType: "text-label-m",
    iconSize: "h-[18px] w-[18px]",
    selectedRadius: "rounded-shape-sm",
  },
  md: {
    hostPad: "p-1.5",
    gap: "gap-1.5",
    itemSize: "h-10 w-10 min-h-[40px] min-w-[40px]",
    itemType: "text-label-l",
    iconSize: "h-6 w-6",
    selectedRadius: "rounded-shape-md",
  },
  lg: {
    hostPad: "p-2",
    gap: "gap-2",
    itemSize: "h-14 w-14 min-h-[56px] min-w-[56px]",
    itemType: "text-label-l",
    iconSize: "h-7 w-7",
    selectedRadius: "rounded-shape-lg",
  },
};

/** Shape token map for the *host*. Default `full` (rounded pill row). */
export const shapeClasses: Record<PaginationShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
