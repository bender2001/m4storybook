import type {
  CssBaselineShape,
  CssBaselineSize,
  CssBaselineVariant,
} from "./types";

/**
 * CSS Baseline anatomy + token bindings.
 *
 * MUI's `<CssBaseline />` is a global reset that ships:
 *   - body margin: 0
 *   - background: theme.palette.background.default
 *   - color: theme.palette.text.primary
 *   - font-family from typography.fontFamily
 *   - antialiased font smoothing
 *   - `*, *::before, *::after { box-sizing: border-box }`
 *
 * M3 has no `CssBaseline` component, so we re-skin it with M3 token
 * variables: surface roles for the baseline background, the M3 type
 * scale for the body type role, and the `font-feature-settings` opsz
 * pairing M3 Expressive tunes to. The reset is applied to the rendered
 * host *and* its `*` descendants so a scoped subtree adopts the same
 * baseline as MUI's global reset, just without owning the document.
 *
 * Spec references:
 *   - MUI CssBaseline    https://mui.com/material-ui/react-css-baseline/
 *   - surface roles      https://m3.material.io/styles/color/the-color-system/color-roles
 *   - typography scale   https://m3.material.io/styles/typography/type-scale-tokens
 *   - elevation tokens   https://m3.material.io/styles/elevation/tokens
 *   - shape scale        https://m3.material.io/styles/shape/shape-scale-tokens
 *
 * CSS Baseline transitions ride the `medium2` (300ms) duration on the
 * `emphasized` easing so theme changes animate fluidly.
 */
export const anatomy = {
  /**
   * Outer host. The CSS Baseline is a *reset* shell so it does not paint
   * a state layer; consumers compose interactive children inside it.
   *
   * The `[&_*]:box-border` selector mirrors MUI's universal box-sizing
   * reset without leaking into the document outside this subtree.
   */
  root: [
    "relative isolate flex w-full flex-col",
    "m-0 outline-none",
    "antialiased",
    "[&_*]:box-border [&_*::before]:box-border [&_*::after]:box-border",
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
  /** Body slot — the reset cascades through descendants of this slot. */
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
 * Variant matrix. The `filled` default mirrors MUI's CssBaseline (host
 * paints the surface background); the other variants paint M3 surface
 * roles for tinted reset regions.
 */
export const variantClasses: Record<CssBaselineVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  filled: {
    rest: "bg-surface text-on-surface",
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
  /** Outer padding. */
  pad: string;
  /** Gap between header items + body. */
  gap: string;
  /** Min-height token. */
  minH: string;
  /** Body type role (drives default font-size + line-height). */
  bodyType: string;
  /** Header label type role. */
  headerType: string;
};

/**
 * Density scale. M3 default reads as `md` (body-m / 14px / 1.5 line).
 *
 * The body type role is applied to the host *and* propagates through
 * the `[&_*]` selector chain so descendant text inherits the M3 body
 * type scale unless explicitly overridden.
 */
export const sizeClasses: Record<CssBaselineSize, SizeBlock> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minH: "min-h-[48px]",
    bodyType: "text-body-s leading-[20px]",
    headerType: "text-title-s",
  },
  md: {
    pad: "p-6",
    gap: "gap-3",
    minH: "min-h-[64px]",
    bodyType: "text-body-m leading-[20px]",
    headerType: "text-title-m",
  },
  lg: {
    pad: "p-10",
    gap: "gap-4",
    minH: "min-h-[80px]",
    bodyType: "text-body-l leading-[24px]",
    headerType: "text-title-l",
  },
};

/** Shape token map. Default `none` (CSS Baseline is a reset host). */
export const shapeClasses: Record<CssBaselineShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
