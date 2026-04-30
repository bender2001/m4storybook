import type {
  LinkShape,
  LinkSize,
  LinkUnderline,
  LinkVariant,
} from "./types";

/**
 * Link anatomy + token bindings.
 *
 * MUI Link has no dedicated M3 Expressive spec; we re-skin it using the
 * M3 token layer:
 *
 *   - resting fg `primary` per M3 link guidance
 *     (https://m3.material.io/styles/typography/applying-type)
 *   - state-layer opacities follow the M3 input library:
 *     hover 0.08 / focus 0.10 / pressed 0.10
 *   - the host morphs through the M3 shape scale; default `full`
 *     so chip-style hosts (filled / tonal / outlined / elevated) read
 *     as pills while `text` collapses to plain inline text
 *   - container transitions ride the `medium2` (300ms) duration on
 *     the `emphasized` easing — same envelope as Box / Chip / Breadcrumbs
 */
export const anatomy = {
  /**
   * <a> host. The text variant uses `inline-flex` (no padding / pill
   * affordance) so a Link reads as inline text inside paragraphs;
   * chip variants pad + adopt a pill shape.
   */
  root: [
    "group relative isolate inline-flex shrink-0 items-center",
    "outline-none select-none cursor-pointer",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State-layer overlay (hover/focus/pressed paint). */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Label slot — sits above the state layer. */
  label: [
    "relative z-[1] inline-flex items-center",
    "min-w-0",
  ].join(" "),
  /** 18dp icon slot. */
  icon: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  ].join(" "),
} as const;

type VariantBlock = {
  /** Resting fill + foreground (link affordance). */
  rest: string;
  /** Resting fill + foreground for the *selected* (current page) crumb. */
  selected: string;
  /** Optional border. */
  border: string;
  /** Default elevation utility for this variant. */
  elevation: string;
  /** State-layer paint color. */
  stateLayer: string;
  /** Whether the variant paints a non-transparent host. */
  filled: boolean;
};

/**
 * Variant matrix. The default `text` variant keeps the resting host
 * transparent — the link reads as primary-colored inline text until
 * hovered/focused (when the state layer paints in). Chip variants
 * (filled / tonal / outlined / elevated) paint a tinted pill so the
 * link can sit on busy backgrounds.
 */
export const variantClasses: Record<LinkVariant, VariantBlock> = {
  text: {
    rest: "bg-transparent text-primary",
    selected: "bg-transparent text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: false,
  },
  filled: {
    rest: "bg-surface-container-highest text-primary",
    selected: "bg-secondary-container text-on-secondary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: true,
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-secondary-container",
    filled: true,
  },
  outlined: {
    rest: "bg-transparent text-primary",
    selected: "bg-transparent text-on-surface",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: false,
  },
  elevated: {
    rest: "bg-surface-container-low text-primary",
    selected: "bg-surface-container-high text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    stateLayer: "bg-primary",
    filled: true,
  },
};

/** Error-state matrix. Overrides resting host across variants. */
export const errorClasses = {
  rest: "bg-error-container text-on-error-container",
  selected: "bg-error-container text-on-error-container",
  border: "border border-transparent",
  stateLayer: "bg-on-error-container",
} as const;

type SizeBlock = {
  /** Link host height in px (matches M3 chip densities). */
  height: number;
  /** Horizontal padding for chip-variant hosts. */
  pad: string;
  /** Inline gap between leading/trailing icon and label. */
  gap: string;
  /** Type role for the label. */
  labelType: string;
  /** Icon size class for leading/trailing glyphs. */
  iconSize: string;
};

/** Density scale. M3 default reads as `md` (28dp pill height). */
export const sizeClasses: Record<LinkSize, SizeBlock> = {
  sm: {
    height: 24,
    pad: "px-2",
    gap: "gap-1",
    labelType: "text-label-m",
    iconSize: "h-4 w-4",
  },
  md: {
    height: 28,
    pad: "px-3",
    gap: "gap-1.5",
    labelType: "text-body-m",
    iconSize: "h-[18px] w-[18px]",
  },
  lg: {
    height: 36,
    pad: "px-4",
    gap: "gap-2",
    labelType: "text-body-l",
    iconSize: "h-5 w-5",
  },
};

/** Shape token map — drives the host border-radius. Default `full` (pill). */
export const shapeClasses: Record<LinkShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Underline policy → static class. M3 type guidance recommends
 * underlining text-style links so they remain perceivable without
 * relying on color alone.
 */
export const underlineClasses: Record<LinkUnderline, string> = {
  none: "no-underline",
  hover: "no-underline hover:underline focus-visible:underline",
  always: "underline",
};
