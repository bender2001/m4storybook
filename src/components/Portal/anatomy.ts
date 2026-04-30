import type { PortalShape, PortalSize, PortalVariant } from "./types";

/**
 * Portal anatomy + token bindings.
 *
 * Closest M3 analog: the modal / surface container
 * (https://m3.material.io/styles/elevation/applying-elevation). Portal
 * is the MUI primitive used to teleport children into a target
 * container — Modal / Dialog / Snackbar / Menu all sit on top of it.
 *
 * The surface is a flex column with one slot:
 *
 *   - body : leading icon + (optional label + children) + trailing icon
 *
 * Token bindings:
 *   - shape       : md (12dp) by default, full scale exposed
 *   - container   : painted per the variant matrix below
 *   - typography  : label-l for the label, body-m for the body
 *   - elevation   : 1 standard, 1 tonal, 0 outlined / text, 3 elevated
 *   - motion      : enter/exit via AnimatePresence with the M3 standard
 *                   tween; surface scales 96% -> 100% on enter and back
 *                   to 96% on exit.
 *
 * Container transitions ride `medium2` (300ms) on the `emphasized`
 * easing — same envelope as Modal / Menu / Popover / Popper.
 */
export const anatomy = {
  /**
   * Outer container — the portal surface. Pointer-events stay enabled
   * here so the teleported children remain interactive even when the
   * portal target is `position: relative` with click-through siblings.
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
  body: "relative z-[1] flex items-start gap-3 min-w-0",
  /** Inner column for label + content. */
  bodyText: "flex flex-1 min-w-0 flex-col gap-1",
  /** Label slot — typeset label-l. */
  label: "min-w-0 text-label-l",
  /** Content slot — typeset body-m. */
  content: "min-w-0 text-body-m",
  /** Leading icon box — 24dp glyph (portal hosts richer content than popper). */
  leadingIcon: "flex h-6 w-6 shrink-0 items-center justify-center",
  /** Trailing icon box. */
  trailingIcon:
    "flex h-6 w-6 shrink-0 items-center justify-center ml-auto",
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
 * the portal surface.
 */
export const colorMatrix: Record<PortalVariant, ColorBlock> = {
  standard: {
    bg: "bg-surface-container-highest",
    selected: "bg-secondary-container",
    errorBg: "bg-error-container",
    fg: "text-on-surface",
    selectedFg: "text-on-secondary-container",
    errorFg: "text-on-error-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
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
 * modal / surface spec. Portal is wider than Popper / Popover so it
 * can host meaningful teleported content (modal panels, hovercards).
 */
export const sizeClasses: Record<
  PortalSize,
  {
    /** Outer padding. */
    pad: string;
    /** Vertical gap between label / body. */
    gap: string;
    /** Min-width — gives a predictable shell across viewports. */
    minW: string;
    /** Max-width — enforces the M3 portal width band. */
    maxW: string;
    /** Min-height — enough room for a single body row. */
    minH: string;
  }
> = {
  sm: {
    pad: "px-4 py-3",
    gap: "gap-1",
    minW: "min-w-[160px]",
    maxW: "max-w-[320px]",
    minH: "min-h-[48px]",
  },
  md: {
    pad: "px-5 py-4",
    gap: "gap-1.5",
    minW: "min-w-[240px]",
    maxW: "max-w-[480px]",
    minH: "min-h-[64px]",
  },
  lg: {
    pad: "px-6 py-5",
    gap: "gap-2",
    minW: "min-w-[320px]",
    maxW: "max-w-[640px]",
    minH: "min-h-[96px]",
  },
};

/** Shape token map. Default = `md` (12dp) per the M3 portal surface. */
export const shapeClasses: Record<PortalShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
