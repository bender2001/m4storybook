import type {
  BackdropShape,
  BackdropSize,
  BackdropVariant,
} from "./types";

/**
 * Backdrop anatomy + token bindings.
 *
 * Closest M3 analog: the scrim used by dialogs and modal sheets
 * (https://m3.material.io/components/dialogs/specs).
 *
 * The backdrop is a single full-viewport (or contained) `<div>` with
 * an optional centered content slot. It paints the M3 scrim token at
 * a per-size opacity, fades in/out via AnimatePresence using the M3
 * emphasized tween, and blocks pointer events on whatever sits behind
 * it.
 *
 * Token bindings:
 *   - shape       : `none` by default; full-radius scale available
 *                   via the `shape` prop for contained backdrops
 *   - container   : painted per `variant` × `size` matrix below
 *   - typography  : body-m for centered content (md density)
 *   - motion      : enter/exit via AnimatePresence with the M3
 *                   emphasized tween (medium2 / 300ms)
 *
 * The scrim opacity scale follows the M3 dialog spec:
 *   sm 0.16 / md 0.32 / lg 0.56
 */
export const anatomy = {
  /**
   * Outer container — the scrim surface. `fixed inset-0` for
   * viewport-anchored backdrops, swapped to `absolute inset-0` when
   * `contained` is true.
   */
  root: [
    "z-50 flex items-center justify-center",
    "transition-[background-color,opacity,border-color]",
    "duration-medium2 ease-emphasized",
    "outline-none",
  ].join(" "),
  /** Disabled wash — applied via motion's animate prop for opacity. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Centered content slot — typeset body-m, on-surface for legibility. */
  content: [
    "relative z-[1] flex flex-col items-center justify-center",
    "text-center text-body-m",
  ].join(" "),
} as const;

type ColorBlock = {
  /** Resting background — paints the scrim. */
  bg: string;
  /** Resting foreground (centered content text + spinner color). */
  fg: string;
  /** Border style — `border-transparent` or `border-<role>`. */
  border: string;
};

/**
 * Variant × size color matrix. Each cell returns the resting bg + fg
 * + border classes that paint the scrim at the right M3 opacity.
 *
 * Tailwind v3 silently no-ops the `bg-{role}/[opacity]` modifier when
 * the color is a `var()` reference (this project's tokens are
 * `var(--md-sys-color-*)`). Modifier-style opacity therefore can't be
 * expressed at the Tailwind layer without burning a literal copy of
 * each opacity into the source. Instead we drive the scrim opacity
 * through `motion/react`'s `animate` prop on the wrapper element so
 * motion handles both fade-in and the per-size resting opacity in
 * one place — see Backdrop.tsx.
 */
export const colorMatrix: Record<BackdropVariant, ColorBlock> = {
  filled: {
    bg: "bg-scrim",
    fg: "text-on-surface",
    border: "border border-transparent",
  },
  tonal: {
    bg: "bg-surface-container-highest",
    fg: "text-on-surface",
    border: "border border-transparent",
  },
  outlined: {
    bg: "bg-transparent",
    fg: "text-on-surface",
    border: "border border-outline",
  },
  invisible: {
    bg: "bg-transparent",
    fg: "text-on-surface",
    border: "border border-transparent",
  },
};

/**
 * Per-size opacity scale. Driven by motion/react's `animate` prop so
 * Tailwind's `var()` color tokens render correctly (Tailwind opacity
 * modifiers silently fail on `var()` colors).
 */
export const sizeOpacity: Record<BackdropSize, number> = {
  sm: 0.16,
  md: 0.32,
  lg: 0.56,
};

/** Per-size content padding so the centered slot doesn't crowd edges. */
export const sizeClasses: Record<BackdropSize, { pad: string }> = {
  sm: { pad: "p-3" },
  md: { pad: "p-6" },
  lg: { pad: "p-10" },
};

/** Shape token map. Default = `none` (full-viewport rect). */
export const shapeClasses: Record<BackdropShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Position helper — `fixed` for viewport-anchored (default) and
 * `absolute` when the backdrop should live inside a positioned
 * ancestor.
 */
export const positionClasses = {
  fixed: "fixed inset-0",
  contained: "absolute inset-0",
} as const;
