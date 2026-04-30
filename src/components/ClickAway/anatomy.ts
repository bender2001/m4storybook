import type {
  ClickAwayShape,
  ClickAwaySize,
  ClickAwayVariant,
} from "./types";

/**
 * Click-Away anatomy + token bindings.
 *
 * MUI's ClickAwayListener is a behaviour primitive with no rendered
 * surface. We surface it as a *dismissable panel* re-skinned with M3
 * tokens so it can ship with the same variants/sizes/states matrix as
 * the rest of the library.
 *
 * Spec references:
 *   - surface roles    https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens https://m3.material.io/styles/elevation/tokens
 *   - shape scale      https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state layers     https://m3.material.io/foundations/interaction/states
 *   - menus            https://m3.material.io/components/menus/specs
 *
 * Container transitions ride the `medium2` (300ms) duration on the
 * `emphasized` easing — same envelope as Box / Chip / Breadcrumbs.
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
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
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
 * Variant matrix. The `text` default is a transparent host — useful
 * when the wrapped content paints its own surface (e.g. a Menu). The
 * other variants paint M3 surface roles for visible dismissable panels.
 *
 * The `elevated` variant lifts to elevation-2, matching the M3 menu /
 * popover surface elevation per the M3 menu spec.
 */
export const variantClasses: Record<ClickAwayVariant, ColorBlock> = {
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
    elevation: "shadow-elevation-2",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  /** Outer padding. */
  pad: string;
  /** Gap between header items + body. */
  gap: string;
  /** Min-height token (chip/menu density). */
  minH: string;
  /** Header label type role. */
  headerType: string;
};

/** Density scale. M3 default reads as `md` (16dp pad / 72dp min height). */
export const sizeClasses: Record<ClickAwaySize, SizeBlock> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minH: "min-h-[56px]",
    headerType: "text-title-s",
  },
  md: {
    pad: "p-4",
    gap: "gap-3",
    minH: "min-h-[72px]",
    headerType: "text-title-m",
  },
  lg: {
    pad: "p-6",
    gap: "gap-4",
    minH: "min-h-[96px]",
    headerType: "text-title-l",
  },
};

/** Shape token map. Default `lg` (M3 menu/popover radius). */
export const shapeClasses: Record<ClickAwayShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
