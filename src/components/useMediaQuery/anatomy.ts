import type {
  UseMediaQueryShape,
  UseMediaQuerySize,
  UseMediaQueryVariant,
} from "./types";

/**
 * useMediaQuery anatomy + token bindings.
 *
 * MUI's useMediaQuery is a behaviour hook with no rendered surface
 * (https://mui.com/material-ui/react-use-media-query/). We surface it as
 * a *responsive announcement panel* re-skinned with M3 tokens so it
 * ships with the same variants/sizes/states matrix as the rest of the
 * library. The panel paints the header (label + icons), the matched
 * body slot, and the unmatched body slot; AnimatePresence morphs
 * between the two as the query flips.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 *   - menus            https://m3.material.io/components/menus/specs
 *
 * Container transitions ride the `medium2` (300ms) duration on the
 * `emphasized` easing — same envelope as Click-Away Listener / Transitions.
 */
export const anatomy = {
  /** Outer panel host. */
  root: [
    "relative isolate flex w-full flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed",
  /** Header row — leading icon + label + trailing icon. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "font-medium leading-snug",
  ].join(" "),
  /** 24dp icon slot. */
  icon: ["inline-flex h-6 w-6 shrink-0 items-center justify-center"].join(" "),
  /** Body slot the panel animates between matched / unmatched. */
  body: "relative z-[1] w-full",
  /** Status pill rendered next to the header label. */
  status: [
    "inline-flex items-center gap-1 ml-auto",
    "rounded-shape-full px-2 py-0.5",
    "text-label-s font-medium uppercase tracking-wide",
  ].join(" "),
  /** Status indicator dot. */
  statusDot: ["inline-block h-2 w-2 rounded-shape-full"].join(" "),
  /** Inline `<code>` for the query string. */
  query: [
    "block font-mono text-body-s leading-snug",
    "text-on-surface-variant",
  ].join(" "),
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
  /** Status pill (matched). */
  statusOn: string;
  /** Status pill (unmatched). */
  statusOff: string;
};

/**
 * Variant matrix. The `text` default is a transparent host — useful
 * when the wrapped content paints its own surface. The other variants
 * paint M3 surface roles for visible responsive panels.
 *
 * The `elevated` variant lifts to elevation-2, matching the M3 menu /
 * popover surface elevation per the M3 menu spec.
 */
export const variantClasses: Record<UseMediaQueryVariant, ColorBlock> = {
  text: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
    statusOn: "bg-primary-container text-on-primary-container",
    statusOff: "bg-surface-container-high text-on-surface-variant",
  },
  filled: {
    rest: "bg-surface-container-highest text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
    statusOn: "bg-primary-container text-on-primary-container",
    statusOff: "bg-surface-container text-on-surface-variant",
  },
  tonal: {
    rest: "bg-secondary-container text-on-secondary-container",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-secondary-container",
    statusOn: "bg-primary-container text-on-primary-container",
    statusOff: "bg-surface-container-low text-on-surface-variant",
  },
  outlined: {
    rest: "bg-transparent text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
    statusOn: "bg-primary-container text-on-primary-container",
    statusOff: "bg-surface-container text-on-surface-variant",
  },
  elevated: {
    rest: "bg-surface-container-low text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-2",
    iconColor: "text-on-surface-variant",
    statusOn: "bg-primary-container text-on-primary-container",
    statusOff: "bg-surface-container text-on-surface-variant",
  },
};

type SizeBlock = {
  /** Outer padding. */
  pad: string;
  /** Gap between header items + body. */
  gap: string;
  /** Min-height token. */
  minH: string;
  /** Header label type role. */
  headerType: string;
  /** Body type role. */
  bodyType: string;
};

/** Density scale. M3 default reads as `md` (16dp pad / 72dp min height). */
export const sizeClasses: Record<UseMediaQuerySize, SizeBlock> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minH: "min-h-[56px]",
    headerType: "text-title-s",
    bodyType: "text-body-s leading-[20px]",
  },
  md: {
    pad: "p-4",
    gap: "gap-3",
    minH: "min-h-[72px]",
    headerType: "text-title-m",
    bodyType: "text-body-m leading-[20px]",
  },
  lg: {
    pad: "p-6",
    gap: "gap-4",
    minH: "min-h-[96px]",
    headerType: "text-title-l",
    bodyType: "text-body-l leading-[24px]",
  },
};

/** Shape token map. Default `lg` (16dp, M3 menu/popover radius). */
export const shapeClasses: Record<UseMediaQueryShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
