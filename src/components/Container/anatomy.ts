import type {
  ContainerMaxWidth,
  ContainerShape,
  ContainerSize,
  ContainerVariant,
} from "./types";

/**
 * Container anatomy + token bindings.
 *
 * M3 Expressive does not specify a "Container" component — Container is a
 * MUI layout primitive that centres content horizontally and clamps it to
 * a breakpoint-sized max-width. The matrix below re-skins it with M3
 * surface roles, the M3 shape scale, and M3 motion tokens so the shell
 * acts as a token-aware section landmark the rest of the library composes.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 *   - layout grids     https://m3.material.io/foundations/layout/applying-layout/window-size-classes
 *
 * Container transitions ride the `medium2` (300ms) duration on the
 * `emphasized` easing — same envelope as Box / Chip / Click-Away.
 */
export const anatomy = {
  /**
   * Outer container. The Container is a *layout* shell so it does not
   * paint state-layer interaction by default; consumers compose
   * interactive children inside it instead.
   */
  root: [
    "relative isolate flex w-full flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
  ].join(" "),
  /** Body slot — children render here, below the optional header. */
  body: "relative z-[1] w-full",
} as const;

type ColorBlock = {
  /** Resting fill + foreground. */
  rest: string;
  /** Selected fill + foreground (M3 secondary-container). */
  selected: string;
  /** Error fill + foreground (M3 error-container). */
  error: string;
  /** Optional border. */
  border: string;
  /** Default elevation token for this variant. */
  elevation: string;
  /** Header icon foreground class. */
  iconColor: string;
};

/**
 * Variant matrix. The `text` default is a transparent host so a Container
 * can act as a pure layout shell; the other variants paint M3 surface
 * roles for tinted layout regions.
 */
export const variantClasses: Record<ContainerVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  /** Vertical padding (gutter is handled separately so it can be disabled). */
  padY: string;
  /** Gap between header items + body. */
  gap: string;
  /** Min-height token. */
  minH: string;
  /** Header label type role. */
  headerType: string;
};

/**
 * Density scale. M3 default reads as `md` (24dp pad / 64dp min-height).
 *
 * Vertical padding scales independently from gutters so consumers can
 * `disableGutters` and keep top/bottom rhythm intact.
 */
export const sizeClasses: Record<ContainerSize, SizeBlock> = {
  sm: {
    padY: "py-3",
    gap: "gap-2",
    minH: "min-h-[48px]",
    headerType: "text-title-s",
  },
  md: {
    padY: "py-6",
    gap: "gap-3",
    minH: "min-h-[64px]",
    headerType: "text-title-m",
  },
  lg: {
    padY: "py-10",
    gap: "gap-4",
    minH: "min-h-[80px]",
    headerType: "text-title-l",
  },
};

/**
 * Horizontal gutters — applied independently from `padY` so consumers can
 * use `disableGutters` to flush the Container against its parent and
 * still keep the vertical rhythm intact (mirrors MUI's Container).
 */
export const gutterClasses: Record<ContainerSize, string> = {
  sm: "px-4",
  md: "px-6",
  lg: "px-10",
};

/** Shape token map. Default `none` (Container is layout-only). */
export const shapeClasses: Record<ContainerShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Max-width clamp. Mirrors MUI Container breakpoint widths so the shell
 * matches the rest of the Material ecosystem when migrating from MUI.
 */
export const maxWidthClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  xs: "max-w-[444px]",
  sm: "max-w-[600px]",
  md: "max-w-[900px]",
  lg: "max-w-[1200px]",
  xl: "max-w-[1536px]",
};

/**
 * Fixed-width companion: when `fixed` is set the Container also pins the
 * `min-width` to the chosen breakpoint so it never shrinks below it (this
 * is how MUI's `fixed` Container behaves).
 */
export const fixedClasses: Record<Exclude<ContainerMaxWidth, false>, string> = {
  xs: "min-w-[444px]",
  sm: "min-w-[600px]",
  md: "min-w-[900px]",
  lg: "min-w-[1200px]",
  xl: "min-w-[1536px]",
};
