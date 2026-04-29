import type { IconSize, IconVariant } from "./types";

/**
 * Icon anatomy. Each variant maps to an M3 color role pair (container
 * + glyph). Sizes follow the M3 icon scale: sm = 18dp glyph in a 24dp
 * touch target, md = 24dp default, lg = 40dp glyph in a 48dp box.
 *
 * https://m3.material.io/styles/icons/overview
 * https://m3.material.io/styles/icons/applying-icons
 */
export const anatomy = {
  /** Inline-flex root that centers the glyph in a square box. */
  root: [
    "inline-flex items-center justify-center",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  /** Wraps an inline SVG so it scales with the box via width/height 100%. */
  glyph: [
    "block",
    "[&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current",
  ].join(" "),
  /** Leading / trailing label sits beside the glyph. */
  label: "text-label-l",
  /** Spacing between glyph and a leading/trailing label slot. */
  withLabel: "gap-2 px-1",
  /** Focus ring (M3 standard). */
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

/**
 * Per-size geometry. `box` is the outer interactive square; `glyph`
 * is the inner SVG square; `radius` is the container radius when a
 * variant paints a fill (filled/tonal/outlined).
 */
export const sizeClasses: Record<
  IconSize,
  { box: string; glyph: string; radius: string }
> = {
  sm: {
    box: "h-6 w-6",
    glyph: "h-[18px] w-[18px]",
    radius: "rounded-shape-xs",
  },
  md: {
    box: "h-6 w-6",
    glyph: "h-6 w-6",
    radius: "rounded-shape-sm",
  },
  lg: {
    box: "h-12 w-12",
    glyph: "h-10 w-10",
    radius: "rounded-shape-md",
  },
};

/**
 * Per-variant color treatment. Each entry sets the *container* (where
 * the variant paints a fill or border) and the *glyph* color role.
 * Selected/error states OVERRIDE the variant glyph color, so the
 * resolver in `resolveColors` falls back to the variant default when
 * no state override applies.
 */
export const variantClasses: Record<
  IconVariant,
  { container: string; glyph: string }
> = {
  standard: {
    container: "bg-transparent",
    glyph: "text-on-surface",
  },
  primary: {
    container: "bg-transparent",
    glyph: "text-primary",
  },
  filled: {
    container: "bg-primary-container",
    glyph: "text-on-primary-container",
  },
  tonal: {
    container: "bg-secondary-container",
    glyph: "text-on-secondary-container",
  },
  outlined: {
    container: "bg-transparent border border-outline",
    glyph: "text-on-surface",
  },
  error: {
    container: "bg-transparent",
    glyph: "text-error",
  },
};

/**
 * State overrides applied AFTER the variant resolves. Selected paints
 * the on-secondary-container role; disabled fades to opacity 0.38
 * (M3 disabled token); error overrides the glyph color to error.
 */
export const stateClasses = {
  selected: "text-on-secondary-container",
  disabled: "opacity-[0.38] cursor-not-allowed",
  error: "text-error",
} as const;
