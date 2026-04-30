import type {
  PopoverPlacement,
  PopoverShape,
  PopoverSize,
  PopoverVariant,
} from "./types";

/**
 * Popover anatomy + token bindings.
 *
 * Closest M3 analog: the menu / popover surface
 * (https://m3.material.io/components/menus/specs). Popover is the
 * MUI primitive used to render a floating, anchor-aligned surface
 * — Menu / DatePicker dropdown / Autocomplete dropdown all sit on
 * top of it.
 *
 * The surface is a flex column with three slots:
 *
 *   - header  : optional leading icon + title/label + trailing icon
 *   - body    : children render here
 *   - actions : trailing action row aligned to the end
 *
 * Token bindings:
 *   - shape       : xs (4dp) by default, full scale exposed
 *   - container   : painted per the variant matrix below
 *   - typography  : title-m for the headline, body-m for the body
 *   - elevation   : 2 standard, 1 tonal, 0 outlined / text, 3 elevated
 *   - motion      : enter/exit via AnimatePresence with the M3
 *                   emphasized tween; surface scales 95% -> 100% on
 *                   enter and back to 95% on exit. Transform-origin
 *                   is placement-aware so the scale starts from the
 *                   anchor edge.
 *
 * Container transitions ride `medium2` (300ms) on the `emphasized`
 * easing — same envelope as Modal / Menu / ClickAway.
 */
export const anatomy = {
  /**
   * Centering host. The popover surface itself does not occupy the
   * entire host — instead a placement-aware host pins the surface to
   * the configured edge while staying click-through outside the
   * surface (the surrounding scrim, if enabled, catches dismiss
   * clicks).
   */
  positioner: [
    "z-[60] flex pointer-events-none",
  ].join(" "),
  /**
   * Outer container — the popover surface. Pointer-events re-enabled
   * here so clicks inside the surface don't bubble to the scrim.
   */
  surface: [
    "pointer-events-auto relative isolate flex flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color,opacity]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
  /**
   * Disabled wash. `!pointer-events-none` overrides the surface's
   * resting `pointer-events-auto` (utility specificity ties otherwise).
   */
  disabled: "cursor-not-allowed !pointer-events-none",
  /** Header row — leading icon + title + trailing icon. */
  header: "relative z-[1] flex items-center gap-3 min-w-0",
  /** Leading icon box — 24dp glyph. */
  leadingIcon:
    "flex h-6 w-6 shrink-0 items-center justify-center",
  /** Title slot — typeset title-m, fills the remaining space. */
  title: "flex-1 min-w-0 text-title-m truncate",
  /** Label slot — when no title is supplied, uses the same row. */
  label: "flex-1 min-w-0 truncate",
  /** Trailing icon slot. */
  trailingIcon:
    "flex h-6 w-6 shrink-0 items-center justify-center ml-auto",
  /** Body content slot. */
  body: "relative z-[1] min-w-0 text-body-m",
  /** Trailing action row — buttons aligned to the end. */
  actions:
    "relative z-[1] flex flex-wrap items-center justify-end gap-2 mt-auto",
} as const;

type ColorBlock = {
  /** Resting background. */
  bg: string;
  /** Selected background (M3 secondary-container fill). */
  selected: string;
  /** Error background (M3 error-container fill). */
  errorBg: string;
  /** Resting foreground (default text color). */
  fg: string;
  /** Selected foreground. */
  selectedFg: string;
  /** Error foreground. */
  errorFg: string;
  /** Border style. */
  border: string;
  /** Elevation token — `shadow-elevation-{n}` from the Tailwind theme. */
  elevation: string;
  /** Header / leading icon foreground class. */
  iconColor: string;
};

/**
 * Variant color + elevation matrix. Each cell returns the resting
 * background, foreground, border, and elevation classes that paint
 * the popover surface.
 */
export const colorMatrix: Record<PopoverVariant, ColorBlock> = {
  standard: {
    bg: "bg-surface-container",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-2",
    iconColor: "text-on-surface-variant",
  },
  tonal: {
    bg: "bg-secondary-container",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-secondary-container",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
    iconColor: "text-on-secondary-container",
  },
  outlined: {
    bg: "bg-transparent",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-outline-variant",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  text: {
    bg: "bg-transparent",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
    iconColor: "text-on-surface-variant",
  },
  elevated: {
    bg: "bg-surface-container-low",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-3",
    iconColor: "text-on-surface-variant",
  },
};

/**
 * Density scale. Drives padding, gap, min/max width, and inline icon
 * dimensions per the M3 menu/popover spec.
 */
export const sizeClasses: Record<
  PopoverSize,
  {
    /** Outer padding. */
    pad: string;
    /** Vertical gap between header / body / actions. */
    gap: string;
    /** Min-width — gives a predictable shell across viewports. */
    minW: string;
    /** Max-width — enforces the M3 popover width band. */
    maxW: string;
    /** Min-height — enough room to host a header + body + actions row. */
    minH: string;
  }
> = {
  sm: {
    pad: "p-3",
    gap: "gap-2",
    minW: "min-w-[160px]",
    maxW: "max-w-[280px]",
    minH: "min-h-[64px]",
  },
  md: {
    pad: "p-4",
    gap: "gap-3",
    minW: "min-w-[200px]",
    maxW: "max-w-[360px]",
    minH: "min-h-[80px]",
  },
  lg: {
    pad: "p-5",
    gap: "gap-4",
    minW: "min-w-[280px]",
    maxW: "max-w-[480px]",
    minH: "min-h-[112px]",
  },
};

/** Shape token map. Default = `xs` (4dp) per the M3 menu surface. */
export const shapeClasses: Record<PopoverShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Position helper — `absolute` for contained (default, used in
 * stories) and `fixed` for viewport-anchored.
 */
export const positionClasses = {
  absolute: "absolute inset-0",
  fixed: "fixed inset-0",
} as const;

/**
 * Placement -> flexbox alignment classes for the positioner host.
 * The positioner is a `flex` container; the surface aligns inside it
 * via these justify/items utilities so the popover snaps to the
 * configured edge of its host.
 */
export const placementAlignment: Record<PopoverPlacement, string> = {
  "top-start": "items-start justify-start",
  top: "items-start justify-center",
  "top-end": "items-start justify-end",
  "bottom-start": "items-end justify-start",
  bottom: "items-end justify-center",
  "bottom-end": "items-end justify-end",
  "left-start": "items-start justify-start",
  left: "items-center justify-start",
  "left-end": "items-end justify-start",
  "right-start": "items-start justify-end",
  right: "items-center justify-end",
  "right-end": "items-end justify-end",
  center: "items-center justify-center",
};

/**
 * Placement -> motion transform-origin string. Anchors the
 * scale-in animation to the edge nearest the host so the surface
 * grows out of the anchor (M3 expressive surface motion).
 */
export const placementOrigin: Record<PopoverPlacement, string> = {
  "top-start": "left bottom",
  top: "center bottom",
  "top-end": "right bottom",
  "bottom-start": "left top",
  bottom: "center top",
  "bottom-end": "right top",
  "left-start": "right top",
  left: "right center",
  "left-end": "right bottom",
  "right-start": "left top",
  right: "left center",
  "right-end": "left bottom",
  center: "center center",
};

/** Primary axis driving the offset gap for each placement. */
export type OffsetAxis = "top" | "bottom" | "left" | "right" | "none";

/**
 * The popover sits inside the positioner. For each placement, we
 * push the surface AWAY from the anchored edge by `offset` px via
 * padding on that same edge of the positioner — e.g. `bottom-start`
 * anchors `items-end` so adding `padding-bottom: 8px` moves the
 * surface up 8px off the host bottom edge.
 */
export const placementOffsetAxis: Record<PopoverPlacement, OffsetAxis> = {
  "top-start": "top",
  top: "top",
  "top-end": "top",
  "bottom-start": "bottom",
  bottom: "bottom",
  "bottom-end": "bottom",
  "left-start": "left",
  left: "left",
  "left-end": "left",
  "right-start": "right",
  right: "right",
  "right-end": "right",
  center: "none",
};

/**
 * Selector that matches focusable descendants for the focus-trap
 * style auto-focus. Mirrors the canonical "focusable" set.
 */
export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
