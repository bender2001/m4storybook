import type {
  PopperPlacement,
  PopperShape,
  PopperSize,
  PopperVariant,
} from "./types";

/**
 * Popper anatomy + token bindings.
 *
 * Closest M3 analog: the rich tooltip / menu container surface
 * (https://m3.material.io/components/tooltips/specs). Popper is the
 * MUI primitive used to render an unstyled, anchor-positioned surface
 * — Tooltip / Autocomplete listbox / Menu all sit on top of it.
 *
 * The surface is a flex column with two slots:
 *
 *   - body : leading icon + (optional label + children) + trailing icon
 *   - arrow: optional caret pointing back at the anchor edge
 *
 * Token bindings:
 *   - shape       : sm (8dp) by default, full scale exposed
 *   - container   : painted per the variant matrix below
 *   - typography  : label-l for the label, body-m for the body
 *   - elevation   : 2 standard, 1 tonal, 0 outlined / text, 3 elevated
 *   - motion      : enter/exit via AnimatePresence with the M3 standard
 *                   tween; surface scales 96% -> 100% on enter and back
 *                   to 96% on exit. Transform-origin is placement-aware
 *                   so the scale starts from the anchor edge.
 *
 * Container transitions ride `medium2` (300ms) on the `emphasized`
 * easing — same envelope as Modal / Menu / Popover.
 */
export const anatomy = {
  /**
   * Centering host. The popper surface itself does not occupy the
   * entire host — instead a placement-aware host pins the surface to
   * the configured edge while staying click-through outside the
   * surface (Popper has no scrim).
   */
  positioner: ["z-[60] flex pointer-events-none"].join(" "),
  /**
   * Outer container — the popper surface. Pointer-events re-enabled
   * here so clicks inside the surface aren't swallowed by the
   * positioner.
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
  /** Body row — leading icon + label/content + trailing icon. */
  body: "relative z-[1] flex items-start gap-2 min-w-0",
  /** Inner column for label + content. */
  bodyText: "flex flex-1 min-w-0 flex-col gap-0.5",
  /** Label slot — typeset label-l. */
  label: "min-w-0 text-label-l",
  /** Content slot — typeset body-m. */
  content: "min-w-0 text-body-m",
  /** Leading icon box — 20dp glyph (popper is a tighter surface than popover). */
  leadingIcon: "flex h-5 w-5 shrink-0 items-center justify-center",
  /** Trailing icon box. */
  trailingIcon:
    "flex h-5 w-5 shrink-0 items-center justify-center ml-auto",
  /**
   * Arrow base — a 1:1 box rotated 45° and absolutely positioned to
   * straddle the surface edge nearest the anchor. Color/elevation are
   * inherited from the surface so the arrow paints in the same fill.
   */
  arrow:
    "absolute z-0 rotate-45 pointer-events-none border-inherit bg-inherit",
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
 * the popper surface.
 */
export const colorMatrix: Record<PopperVariant, ColorBlock> = {
  standard: {
    bg: "bg-surface-container-high",
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
 * Density scale. Drives padding, gap, and width band per the M3
 * tooltip / menu surface spec. Popper is intentionally tighter than
 * Popover (it hosts hint copy, not pickers).
 */
export const sizeClasses: Record<
  PopperSize,
  {
    /** Outer padding. */
    pad: string;
    /** Vertical gap between label / body. */
    gap: string;
    /** Min-width — gives a predictable shell across viewports. */
    minW: string;
    /** Max-width — enforces the M3 popper width band. */
    maxW: string;
    /** Min-height — enough room for a single body row. */
    minH: string;
  }
> = {
  sm: {
    pad: "px-3 py-2",
    gap: "gap-1",
    minW: "min-w-[96px]",
    maxW: "max-w-[224px]",
    minH: "min-h-[32px]",
  },
  md: {
    pad: "px-4 py-3",
    gap: "gap-1.5",
    minW: "min-w-[144px]",
    maxW: "max-w-[320px]",
    minH: "min-h-[48px]",
  },
  lg: {
    pad: "px-5 py-4",
    gap: "gap-2",
    minW: "min-w-[200px]",
    maxW: "max-w-[400px]",
    minH: "min-h-[64px]",
  },
};

/** Shape token map. Default = `sm` (8dp) per the M3 tooltip surface. */
export const shapeClasses: Record<PopperShape, string> = {
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
 * via these justify/items utilities so the popper snaps to the
 * configured edge of its host.
 */
export const placementAlignment: Record<PopperPlacement, string> = {
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
 * grows out of the anchor.
 */
export const placementOrigin: Record<PopperPlacement, string> = {
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
 * For each placement, which positioner edge gets `padding-{axis}` set
 * to `offset` px so the surface is pushed off the anchor edge.
 */
export const placementOffsetAxis: Record<PopperPlacement, OffsetAxis> = {
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
 * Arrow side. The arrow is anchored to the surface edge that faces
 * the host — i.e. opposite of the placement primary axis.
 */
export type ArrowSide = "top" | "bottom" | "left" | "right" | "none";

export const placementArrowSide: Record<PopperPlacement, ArrowSide> = {
  "top-start": "bottom",
  top: "bottom",
  "top-end": "bottom",
  "bottom-start": "top",
  bottom: "top",
  "bottom-end": "top",
  "left-start": "right",
  left: "right",
  "left-end": "right",
  "right-start": "left",
  right: "left",
  "right-end": "left",
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
