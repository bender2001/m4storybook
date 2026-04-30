import type {
  BreadcrumbsShape,
  BreadcrumbsSize,
  BreadcrumbsVariant,
} from "./types";

/**
 * Breadcrumbs anatomy + token bindings.
 *
 * MUI Breadcrumbs has no M3 Expressive spec; we re-skin it using the
 * M3 token layer:
 *
 *   - links paint `primary` per the M3 link guidance
 *     (https://m3.material.io/styles/typography/applying-type#a82a2da9-...)
 *   - the *current* crumb paints `on-surface` and exposes
 *     `aria-current="page"` per WAI-ARIA breadcrumb pattern
 *     (https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
 *   - state layer opacities follow the M3 input library:
 *     hover 0.08 / focus 0.10 / pressed 0.10
 *   - the host morphs through the M3 shape scale; default `full` so
 *     each crumb reads as a pill chip
 *   - container transitions ride the `medium2` (300ms) duration on
 *     the `emphasized` easing — same envelope as Box / Chip
 */
export const anatomy = {
  /** Outer <nav> container — owns the trail layout. */
  root: [
    "inline-flex w-full max-w-full items-center",
    "transition-[color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** <ol> — the actual crumb list. */
  list: [
    "flex min-w-0 flex-wrap items-center",
  ].join(" "),
  /** <li> — wraps each crumb + its trailing separator. */
  listItem: [
    "inline-flex min-w-0 items-center",
  ].join(" "),
  /** Crumb host. Painted by variant + state. */
  crumb: [
    "group relative isolate inline-flex shrink-0 items-center",
    "outline-none select-none cursor-pointer",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Non-interactive crumb (current page). */
  crumbCurrent: [
    "relative isolate inline-flex shrink-0 items-center",
    "select-none cursor-default",
    "transition-[color,background-color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash (per crumb). */
  crumbDisabled:
    "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Disabled wash (whole trail). */
  rootDisabled:
    "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay (hover/focus/pressed paint). */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Crumb label slot — sits above the state layer. */
  label: [
    "relative z-[1] inline-flex items-center",
    "truncate",
  ].join(" "),
  /** Leading / trailing 18dp icon slot. */
  icon: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  ].join(" "),
  /** Separator glyph. */
  separator: [
    "mx-1 inline-flex shrink-0 items-center justify-center",
    "text-on-surface-variant select-none",
    "transition-[color] duration-medium2 ease-emphasized",
    "pointer-events-none",
  ].join(" "),
  /** Expand button host (rendered when collapsed). */
  expand: [
    "group relative isolate inline-flex items-center justify-center",
    "outline-none select-none cursor-pointer",
    "rounded-shape-full",
    "bg-surface-container-highest text-on-surface-variant",
    "transition-[box-shadow,background-color,color] duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
} as const;

type VariantBlock = {
  /** Resting fill + foreground (link affordance). */
  rest: string;
  /** Resting fill + foreground for the *current* (non-link) crumb. */
  current: string;
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
 * transparent — the crumb reads as a plain link until hovered/focused
 * (when the state layer paints in). Filled / tonal / outlined / elevated
 * paint a tinted pill so the trail can sit on busy backgrounds.
 */
export const variantClasses: Record<BreadcrumbsVariant, VariantBlock> = {
  text: {
    rest: "bg-transparent text-primary",
    current: "bg-transparent text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: false,
  },
  filled: {
    rest: "bg-surface-container-highest text-primary",
    current: "bg-secondary-container text-on-secondary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: true,
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    current: "bg-secondary-container text-on-secondary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-on-secondary-container",
    filled: true,
  },
  outlined: {
    rest: "bg-transparent text-primary",
    current: "bg-transparent text-on-surface",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    stateLayer: "bg-primary",
    filled: false,
  },
  elevated: {
    rest: "bg-surface-container-low text-primary",
    current: "bg-surface-container-high text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    stateLayer: "bg-primary",
    filled: true,
  },
};

/** Error-state matrix. Overrides resting + current host across variants. */
export const errorClasses = {
  rest: "bg-error-container text-on-error-container",
  current: "bg-error-container text-on-error-container",
  border: "border border-transparent",
  stateLayer: "bg-on-error-container",
} as const;

type SizeBlock = {
  /** Crumb host height in px (matches M3 chip densities). */
  height: number;
  /** Horizontal padding for the crumb host. */
  pad: string;
  /** Inter-crumb gap (also drives icon ↔ label gap). */
  gap: string;
  /** Type role for the crumb label. */
  labelType: string;
  /** Icon size class for leading/trailing glyphs. */
  iconSize: string;
  /** Separator size class. */
  sepSize: string;
};

/**
 * Density scale. M3 default reads as `md` (28dp pill); `sm` shrinks
 * the host for compact toolbars, `lg` matches a hero header.
 */
export const sizeClasses: Record<BreadcrumbsSize, SizeBlock> = {
  sm: {
    height: 24,
    pad: "px-2",
    gap: "gap-1",
    labelType: "text-label-m",
    iconSize: "h-4 w-4",
    sepSize: "h-4 w-4",
  },
  md: {
    height: 28,
    pad: "px-3",
    gap: "gap-1.5",
    labelType: "text-label-l",
    iconSize: "h-[18px] w-[18px]",
    sepSize: "h-[18px] w-[18px]",
  },
  lg: {
    height: 36,
    pad: "px-4",
    gap: "gap-2",
    labelType: "text-title-s",
    iconSize: "h-5 w-5",
    sepSize: "h-5 w-5",
  },
};

/** Shape token map — drives the host border-radius. Default `full` (pill). */
export const shapeClasses: Record<BreadcrumbsShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
