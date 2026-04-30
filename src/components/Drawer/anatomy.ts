import type {
  DrawerAnchor,
  DrawerShape,
  DrawerSize,
  DrawerVariant,
} from "./types";

/**
 * Navigation Drawer anatomy + token bindings.
 *
 * Spec: https://m3.material.io/components/navigation-drawer/specs
 *
 *   - container width  : 360dp (md / default)
 *   - container fill   : `surface-container-low`
 *   - container shape  : trailing edge `shape-lg` (16dp) for modal,
 *                        `shape-none` for standard
 *   - top inset        : 12dp gutter above the first headline
 *   - destination row  : 56dp tall, 16dp horizontal pad, full pill
 *                        active indicator (28dp radius)
 *   - active indicator : `secondary-container` fill + label-l text
 *                        in `on-secondary-container`
 *   - rest icon/label  : `on-surface-variant`
 *   - state-layer      : hover 0.08, focus 0.10, pressed 0.10 of
 *                        `on-secondary-container` painted inside the
 *                        active-indicator footprint
 *   - headline         : title-s in `on-surface-variant`
 *   - divider          : 1dp `outline-variant` between sections
 *   - motion           : modal drawer slides in from the anchor edge
 *                        with the M3 emphasized tween (medium2 /
 *                        300ms); standard drawer width transitions
 *                        with the same easing
 */
export const anatomy = {
  /** Outer <nav> container (the drawer surface). */
  root: [
    "relative isolate flex flex-col",
    "min-h-full",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Top gutter above the first headline (M3 12dp). */
  gutter: "h-3 shrink-0",
  /** Optional header slot. */
  header: [
    "flex shrink-0 flex-col gap-1 px-4 pb-4 pt-3",
    "text-on-surface",
  ].join(" "),
  /** Top-level headline (title-s on-surface-variant). */
  headline: [
    "shrink-0 px-4 pb-1 pt-2",
    "text-title-s text-on-surface-variant",
    "uppercase tracking-wider",
  ].join(" "),
  /** Section wrapper. */
  section: "flex flex-col py-1",
  /** Section headline. */
  sectionHeadline: [
    "px-4 pb-1 pt-3",
    "text-title-s text-on-surface-variant",
  ].join(" "),
  /** Inter-section divider (1dp outline-variant). */
  divider: "mx-4 my-2 h-px bg-outline-variant pointer-events-none",
  /** Item list container. */
  list: "flex flex-col px-3 gap-0",
  /** Per-destination button. */
  item: [
    "group relative flex w-full items-center",
    "select-none outline-none",
    "transition-[background-color,color] duration-short4 ease-emphasized",
    "focus-visible:outline-none",
  ].join(" "),
  /**
   * Active-indicator pill. Sits behind the row content and morphs in
   * via motion/react. The pill uses the full shape token (28dp).
   */
  indicator: [
    "absolute inset-0",
    "rounded-shape-full",
    "bg-secondary-container",
    "pointer-events-none",
  ].join(" "),
  /** State layer — sits inside the indicator footprint. */
  stateLayer: [
    "absolute inset-0",
    "rounded-shape-full",
    "bg-on-surface",
    "pointer-events-none",
  ].join(" "),
  /** Focus ring — painted on the indicator footprint. */
  focusRing: [
    "absolute inset-0",
    "rounded-shape-full",
    "ring-2 ring-primary",
    "pointer-events-none",
  ].join(" "),
  /** Leading-icon slot. */
  iconWrap: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "transition-[color] duration-short4 ease-emphasized",
  ].join(" "),
  /** Label slot. */
  label: [
    "relative z-[1] flex-1 truncate min-w-0",
    "transition-[color] duration-short4 ease-emphasized",
  ].join(" "),
  /** Trailing badge slot. */
  badge: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
    "ml-auto",
    "transition-[color] duration-short4 ease-emphasized",
  ].join(" "),
  /** Optional footer slot. */
  footer: [
    "mt-auto flex shrink-0 flex-col gap-1 px-4 pb-3 pt-2",
    "text-on-surface-variant",
  ].join(" "),
} as const;

type VariantBlock = {
  /** Resting host fill. */
  rest: string;
  /** Resting foreground color. */
  fg: string;
  /** Border style. */
  border: string;
  /** Elevation token. */
  elevation: string;
};

/**
 * Variant matrix. M3 default uses `surface-container-low`; tonal /
 * outlined / elevated treatments override the host fill.
 */
export const variantClasses: Record<DrawerVariant, VariantBlock> = {
  standard: {
    rest: "bg-surface-container-low",
    fg: "text-on-surface",
    border: "border-0",
    elevation: "shadow-elevation-0",
  },
  modal: {
    rest: "bg-surface-container-low",
    fg: "text-on-surface",
    border: "border-0",
    elevation: "shadow-elevation-1",
  },
  tonal: {
    rest: "bg-secondary-container",
    fg: "text-on-secondary-container",
    border: "border-0",
    elevation: "shadow-elevation-0",
  },
  outlined: {
    rest: "bg-surface",
    fg: "text-on-surface",
    border: "border-0",
    elevation: "shadow-elevation-0",
  },
  elevated: {
    rest: "bg-surface-container-low",
    fg: "text-on-surface",
    border: "border-0",
    elevation: "shadow-elevation-1",
  },
};

type SizeBlock = {
  /** Drawer width in px. */
  width: number;
  /** Per-row min-height in px. */
  rowHeight: number;
  /** Item icon size class. */
  iconSize: string;
  /** Label typography role. */
  labelType: string;
  /** Item horizontal padding. */
  itemPad: string;
  /** Item gap (icon → label). */
  itemGap: string;
};

export const sizeClasses: Record<DrawerSize, SizeBlock> = {
  sm: {
    width: 288,
    rowHeight: 48,
    iconSize: "h-5 w-5",
    labelType: "text-label-l",
    itemPad: "px-3",
    itemGap: "gap-3",
  },
  md: {
    width: 360,
    rowHeight: 56,
    iconSize: "h-6 w-6",
    labelType: "text-label-l",
    itemPad: "px-4",
    itemGap: "gap-3",
  },
  lg: {
    width: 400,
    rowHeight: 64,
    iconSize: "h-6 w-6",
    labelType: "text-title-m",
    itemPad: "px-4",
    itemGap: "gap-4",
  },
};

/** Shape token map — applied only to the trailing corners of the drawer. */
export const shapeClasses: Record<DrawerShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Anchor-aware shape modifiers. The M3 modal drawer rounds only the
 * trailing edge (the side facing the content), so the start anchor
 * paints right corners and the end anchor paints left corners.
 */
export const anchorShape: Record<DrawerAnchor, string> = {
  start: "rounded-l-none",
  end: "rounded-r-none",
};

/**
 * Anchor-aware outlined-variant border. Outlined drawers paint a 1dp
 * divider on the trailing edge (the side that faces content), so the
 * border is right-edge for start anchors and left-edge for end.
 */
export const anchorBorder: Record<DrawerAnchor, string> = {
  start: "border-r border-outline-variant",
  end: "border-l border-outline-variant",
};

/**
 * Anchor-aware positioner classes. Modal drawers pin to the anchor
 * edge of the viewport (or the contained host) and stretch to full
 * height.
 */
export const positionClasses = {
  fixed: "fixed inset-y-0",
  contained: "absolute inset-y-0",
} as const;

export const anchorAlign: Record<DrawerAnchor, string> = {
  start: "left-0",
  end: "right-0",
};

/**
 * Per-state icon/label color tokens. Selected destinations paint the
 * icon `on-secondary-container` (sits inside the indicator pill) and
 * the label `on-secondary-container`; rest state uses
 * `on-surface-variant`.
 */
export const stateColors = {
  iconRest: "text-on-surface-variant",
  iconSelected: "text-on-secondary-container",
  labelRest: "text-on-surface-variant",
  labelSelected: "text-on-secondary-container font-medium",
  badgeRest: "text-on-surface-variant",
  badgeSelected: "text-on-secondary-container",
} as const;
