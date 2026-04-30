import type {
  SnackbarOrigin,
  SnackbarShape,
  SnackbarSize,
  SnackbarVariant,
} from "./types";

/**
 * Snackbar anatomy + token bindings.
 *
 * Spec: https://m3.material.io/components/snackbar/specs
 *
 *   - container shape  : `xs` (4dp) by default
 *   - container fill   : `inverse-surface` (filled / default)
 *   - container height : 48dp at md density (M3 single-line baseline)
 *   - max width        : 672dp / min width: 344dp
 *   - elevation        : level 3 (filled / elevated treatments)
 *   - label role       : body-m on `inverse-on-surface`
 *   - action role      : label-l on `inverse-primary`
 *   - leading icon     : 24dp glyph in `inverse-on-surface`
 *   - close icon       : 24dp glyph + state-layer painted on
 *                        `inverse-on-surface` with M3 opacities
 *                        (hover 0.08, focus 0.10, pressed 0.10)
 *   - motion           : enter/exit slides along the anchor axis with
 *                        the M3 emphasized tween (medium2 / 300ms)
 */
export const anatomy = {
  /** Outer container — the snackbar surface. */
  root: [
    "relative isolate inline-flex items-center",
    "min-w-[344px] max-w-[672px]",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Leading icon container. */
  icon:
    "relative z-[1] flex shrink-0 items-center justify-center",
  /** Message slot. body-m typography by default. */
  message: "relative z-[1] min-w-0 flex-1",
  /** Trailing action slot — typically a text button. */
  action:
    "relative z-[1] ml-auto flex shrink-0 items-center self-center -mr-1",
  /**
   * Trailing close icon button. M3 paints the state layer at the
   * shared opacities (hover 0.08, focus 0.10, pressed 0.10). The
   * focus ring is rendered via `focus-visible:ring-2`.
   */
  close: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "rounded-shape-full outline-none cursor-pointer",
    "transition-opacity duration-short4 ease-standard",
    "opacity-80 hover:opacity-100 focus-visible:opacity-100",
    "focus-visible:ring-2 focus-visible:ring-current",
    "focus-visible:ring-offset-2",
  ].join(" "),
} as const;

type ColorBlock = {
  /** Resting background. */
  bg: string;
  /** Resting foreground (label + leading icon). */
  fg: string;
  /** Trailing action color. */
  actionFg: string;
  /** Border style. */
  border: string;
  /** Default elevation class. */
  elevation: string;
};

/**
 * Variant matrix. M3 default uses `inverse-surface` with
 * `inverse-on-surface` label + `inverse-primary` action; the tonal /
 * outlined / elevated treatments swap the host fill for use cases
 * where an inverse swatch reads poorly (already-dark shells, content
 * over media, floating sheets).
 */
export const variantClasses: Record<SnackbarVariant, ColorBlock> = {
  filled: {
    bg: "bg-inverse-surface",
    fg: "text-inverse-on-surface",
    actionFg: "text-inverse-primary",
    border: "border border-transparent",
    elevation: "shadow-elevation-3",
  },
  tonal: {
    bg: "bg-surface-container-highest",
    fg: "text-on-surface",
    actionFg: "text-primary",
    border: "border border-transparent",
    elevation: "shadow-elevation-2",
  },
  outlined: {
    bg: "bg-surface",
    fg: "text-on-surface",
    actionFg: "text-primary",
    border: "border border-outline",
    elevation: "shadow-elevation-0",
  },
  elevated: {
    bg: "bg-surface-container-high",
    fg: "text-on-surface",
    actionFg: "text-primary",
    border: "border border-transparent",
    elevation: "shadow-elevation-3",
  },
};

type SizeBlock = {
  /** Outer padding (inline + block). */
  pad: string;
  /** Gap between leading icon, message, action, close. */
  gap: string;
  /** Snackbar shell min-height. */
  minH: string;
  /** Message type role. */
  message: string;
  /** Action button type role. */
  action: string;
  /** Leading icon size. */
  iconBox: string;
  /** Close button size. */
  closeBox: string;
};

/**
 * Density scale. Drives padding, gap, type role, and the leading
 * icon size. M3 single-line snackbars are 48dp tall with 16dp inline
 * padding; we expose three densities so the bar fits compact (mobile)
 * and comfortable (tablet) shells.
 */
export const sizeClasses: Record<SnackbarSize, SizeBlock> = {
  sm: {
    pad: "px-3 py-1.5",
    gap: "gap-2",
    minH: "min-h-[40px]",
    message: "text-body-s",
    action: "text-label-m",
    iconBox: "h-[18px] w-[18px]",
    closeBox: "h-7 w-7",
  },
  md: {
    pad: "px-4 py-2",
    gap: "gap-3",
    minH: "min-h-[48px]",
    message: "text-body-m",
    action: "text-label-l",
    iconBox: "h-5 w-5",
    closeBox: "h-8 w-8",
  },
  lg: {
    pad: "px-5 py-3",
    gap: "gap-4",
    minH: "min-h-[56px]",
    message: "text-body-l",
    action: "text-label-l",
    iconBox: "h-6 w-6",
    closeBox: "h-10 w-10",
  },
};

/** Shape token map. Default = `xs` (4dp) per the M3 snackbar spec. */
export const shapeClasses: Record<SnackbarShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Origin → translate vector helpers. Snackbars slide in along the
 * y-axis toward the layout center (positive y for top origins,
 * negative y for bottom origins). Used by the AnimatePresence
 * `initial` / `exit` props.
 */
export const originOffsets: Record<
  SnackbarOrigin,
  { y: number }
> = {
  "bottom-center": { y: 24 },
  "bottom-start": { y: 24 },
  "bottom-end": { y: 24 },
  "top-center": { y: -24 },
  "top-start": { y: -24 },
  "top-end": { y: -24 },
};
