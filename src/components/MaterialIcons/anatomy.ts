import type {
  MaterialIconSize,
  MaterialIconStyle,
  MaterialIconVariant,
} from "./types";

/**
 * Material Symbols anatomy. Each variant maps to an M3 color role pair
 * (container + glyph). Sizes follow the M3 icon scale and tie the box,
 * glyph, and optical-size axis together so the drawn weight stays
 * consistent across sizes.
 *
 * https://m3.material.io/styles/icons/applying-icons
 * https://fonts.google.com/icons
 */
export const anatomy = {
  /** Inline-flex root that centers the glyph in a square box. */
  root: [
    "inline-flex items-center justify-center select-none",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  /** Glyph slot. The font ligature paints inside this span. */
  glyph: [
    "block leading-none",
    // Disable common-ligatures on the wrapper element except glyph.
    // Material Symbols uses font-feature-settings 'liga' to resolve
    // the symbol name into a glyph; we set it explicitly here.
    "[font-feature-settings:'liga']",
    "[font-variant-ligatures:none]",
    "[-webkit-font-smoothing:antialiased]",
    "[text-rendering:optimizeLegibility]",
    // Keep the rendered text from selecting in case the font is
    // still loading and the symbol name is briefly visible.
    "select-none",
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
 * Per-size geometry. `box` is the outer interactive square; `glyph` is
 * the inner ligature span; `radius` is the container radius when a
 * variant paints a fill (filled/tonal/outlined-box); `opsz` is the
 * Material Symbols optical-size axis value (px) and `glyphPx` is the
 * font-size used to render the ligature.
 */
export const sizeClasses: Record<
  MaterialIconSize,
  { box: string; glyph: string; radius: string; opsz: number; glyphPx: number }
> = {
  sm: {
    box: "h-6 w-6",
    glyph: "text-[20px] w-5 h-5",
    radius: "rounded-shape-xs",
    opsz: 20,
    glyphPx: 20,
  },
  md: {
    box: "h-6 w-6",
    glyph: "text-[24px] w-6 h-6",
    radius: "rounded-shape-sm",
    opsz: 24,
    glyphPx: 24,
  },
  lg: {
    box: "h-12 w-12",
    glyph: "text-[40px] w-10 h-10",
    radius: "rounded-shape-md",
    opsz: 40,
    glyphPx: 40,
  },
};

/**
 * Per-variant color treatment. Each entry sets the container (where
 * the variant paints a fill or border) and the glyph color role.
 * `selected`/`error` states OVERRIDE the variant glyph color.
 */
export const variantClasses: Record<
  MaterialIconVariant,
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
  "outlined-box": {
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

/**
 * Maps the icon style axis to its Material Symbols font-family. Each
 * family is loaded from Google Fonts in `index.css` so all three are
 * available without requiring per-component font management.
 */
export const fontFamily: Record<MaterialIconStyle, string> = {
  outlined: "'Material Symbols Outlined'",
  rounded: "'Material Symbols Rounded'",
  sharp: "'Material Symbols Sharp'",
};
