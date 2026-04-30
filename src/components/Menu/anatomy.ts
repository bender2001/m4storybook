import type { MenuShape, MenuSize, MenuVariant } from "./types";

/**
 * Menu anatomy + token bindings.
 *
 * Spec references:
 *   - M3 menu container       https://m3.material.io/components/menus/specs
 *   - color roles             https://m3.material.io/styles/color/the-color-system/color-roles
 *   - elevation tokens        https://m3.material.io/styles/elevation/tokens
 *   - shape scale             https://m3.material.io/styles/shape/shape-scale-tokens
 *   - state-layer opacities   https://m3.material.io/foundations/interaction/states
 *
 * Container transitions ride `medium2` (300ms) on the `emphasized`
 * easing — the same envelope used by Click-Away / Drawer / Container.
 *
 * NOTE: Tailwind v3 silently no-ops `bg-{role}/[opacity]` utilities
 * when the color is a `var()` token (the slash-opacity needs the
 * channel format we don't ship). State layers therefore paint as a
 * dedicated overlay span whose opacity is animated from React state
 * — same approach used by `<List>`.
 */
export const anatomy = {
  /** Outer surface host. */
  root: [
    "relative isolate flex w-full min-w-[112px] max-w-[280px] flex-col",
    "outline-none overflow-hidden",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Header row above the list. */
  header: [
    "relative z-[1] flex w-full items-center gap-3",
    "font-medium leading-snug",
  ].join(" "),
  /** Inner list — vertical column of menu items. */
  list: "relative z-[1] flex w-full flex-col py-2",
  /** Single 24dp icon slot. */
  icon: "inline-flex h-6 w-6 shrink-0 items-center justify-center",
  /** Trailing supporting text (shortcut / hint). */
  trailingText: "ml-auto text-label-l opacity-[0.74]",
  /** Item base — relative + isolated so the overlay state-layer paints below content. */
  item: [
    "relative isolate flex w-full items-center gap-3 select-none",
    "border-0 text-left",
    "transition-[color] duration-short3 ease-standard",
    "outline-none cursor-pointer",
  ].join(" "),
  /** Foreground role for the rest state — flips for selected/error. */
  itemDefaultText: "text-on-surface",
  /** Disabled wash on a single item. */
  itemDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State-layer overlay — opacity is React-driven. */
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "bg-on-surface",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** State-layer base color when item is selected. */
  stateLayerSelected: "bg-on-secondary-container",
  /** State-layer base color when item is in error mode. */
  stateLayerError: "bg-on-error-container",
  /** Selected item bg + foreground (M3 secondary-container). */
  itemSelectedBg: "bg-secondary-container",
  itemSelectedText: "text-on-secondary-container",
  /** Error foreground (destructive items). */
  itemErrorText: "text-error",
  /** 1dp divider rendered between groups. */
  divider: "my-1 h-px w-full bg-outline-variant",
} as const;

type ColorBlock = {
  /** Resting fill + foreground. */
  rest: string;
  /** Selected fill on the host (whole menu). */
  selected: string;
  /** Error fill + foreground. */
  error: string;
  /** Optional border. */
  border: string;
  /** Default elevation token. */
  elevation: string;
  /** Header / leading icon foreground. */
  iconColor: string;
};

/**
 * Variant matrix.
 *
 * The M3 menu spec defaults the container to `surface-container` with
 * elevation-2 shadow; that's the `elevated` variant here. The other
 * variants cover MUI's variant prop range so a Menu can be re-skinned
 * to sit on top of other surfaces (e.g. inside a tonal card).
 */
export const variantClasses: Record<MenuVariant, ColorBlock> = {
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
    rest: "bg-surface-container text-on-surface",
    selected: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-2",
    iconColor: "text-on-surface-variant",
  },
};

type SizeBlock = {
  /** Header padding. */
  headerPad: string;
  /** Header type role. */
  headerType: string;
  /** Per-item padding (horizontal only — vertical fixed by minH). */
  itemPad: string;
  /** Per-item label type role. */
  itemType: string;
  /** Per-item min-height (M3 list-item density). */
  itemMinH: string;
};

/**
 * Density scale.
 *
 *   sm : 40dp / label-l / 8dp horizontal pad   (compact density)
 *   md : 48dp / body-l  / 12dp horizontal pad  (M3 default)
 *   lg : 56dp / body-l  / 16dp horizontal pad  (comfortable density)
 */
export const sizeClasses: Record<MenuSize, SizeBlock> = {
  sm: {
    headerPad: "px-3 pt-2 pb-1",
    headerType: "text-title-s",
    itemPad: "px-2",
    itemType: "text-label-l",
    itemMinH: "min-h-[40px]",
  },
  md: {
    headerPad: "px-4 pt-3 pb-1",
    headerType: "text-title-m",
    itemPad: "px-3",
    itemType: "text-body-l",
    itemMinH: "min-h-[48px]",
  },
  lg: {
    headerPad: "px-5 pt-4 pb-2",
    headerType: "text-title-l",
    itemPad: "px-4",
    itemType: "text-body-l",
    itemMinH: "min-h-[56px]",
  },
};

/** Shape token map. Default `xs` (M3 menu container shape role). */
export const shapeClasses: Record<MenuShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
