import type {
  DialogShape,
  DialogSize,
  DialogVariant,
} from "./types";

/**
 * Dialog anatomy + token bindings.
 *
 * Closest M3 analog: Dialog
 * (https://m3.material.io/components/dialogs/specs).
 *
 * The basic M3 dialog is a `surface-container-high` rectangle with
 * shape-xl (28dp) corners, elevation 3, an inset 24dp gutter, and a
 * three-row stack: optional 24dp hero icon, headline-s title,
 * body-m supporting text, an inline content slot, and a trailing
 * actions row (text buttons aligned to the end).
 *
 * Token bindings:
 *   - shape       : xl (28dp) by default
 *   - container   : painted per the variant matrix below
 *   - typography  : headline-s for the title, body-m for the
 *                   supporting text, body-l for inline content
 *   - elevation   : 3 for standard / outlined dialogs, 1 for tonal,
 *                   0 for fullscreen
 *   - motion      : enter/exit via AnimatePresence with M3
 *                   decelerate/accelerate fade transitions
 *
 * The scrim is rendered through the existing Backdrop component
 * (32% opacity black per the M3 dialog spec) so the scrim contract
 * stays consistent across the app.
 */
export const anatomy = {
  /**
   * Centering host. The dialog surface itself does not occupy the
   * entire viewport — instead a flex host pins the surface to the
   * viewport center while staying click-through outside the surface
   * (the surrounding scrim is what catches dismiss clicks).
   */
  positioner: [
    "z-[60] flex items-center justify-center pointer-events-none",
    "p-6 md:p-14",
  ].join(" "),
  /**
   * Outer container — the dialog surface. Pointer-events re-enabled
   * here so clicks inside the surface don't bubble to the scrim.
   */
  surface: [
    "pointer-events-auto relative isolate flex w-full flex-col",
    "max-h-full overflow-hidden outline-none",
    "transition-[box-shadow,background-color,border-color,color,opacity]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  focusRing:
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Hero icon row — 24dp glyph centered above the headline. */
  iconRow: "flex items-center justify-center self-center text-secondary",
  /** Headline slot — typeset headline-s by default. */
  title:
    "text-headline-s text-on-surface min-w-0",
  iconAlignedText: "text-center",
  /** Supporting text row — typeset body-m, on-surface-variant. */
  supportingText:
    "text-body-m text-on-surface-variant min-w-0",
  /** Inline content slot (forms / lists). */
  content:
    "min-h-0 overflow-y-auto text-body-l text-on-surface min-w-0",
  /** Trailing action row — text buttons aligned to the end. */
  actions:
    "flex flex-wrap items-center justify-end gap-2 mt-auto",
  /** Full-screen header — 56dp top app bar with close, title, action. */
  fullscreenHeader: [
    "flex h-14 min-h-14 items-center gap-2",
    "border-b border-outline-variant px-4",
  ].join(" "),
  fullscreenCloseButton: [
    "flex h-10 w-10 shrink-0 items-center justify-center",
    "rounded-shape-full text-on-surface",
    "transition-colors duration-short2 ease-standard",
    "hover:bg-on-surface/[0.08] focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary",
  ].join(" "),
  fullscreenTitle:
    "min-w-0 flex-1 truncate text-title-l text-on-surface",
  fullscreenActions:
    "flex min-h-14 shrink-0 items-center justify-end gap-2",
} as const;

type ColorBlock = {
  /** Resting background. */
  bg: string;
  /** Resting foreground (default text color). */
  fg: string;
  /** Border style. */
  border: string;
  /** Elevation token — `shadow-elevation-{n}` from the Tailwind theme. */
  elevation: string;
};

/**
 * Variant color + elevation matrix. Each cell returns the resting
 * background, foreground, border, and elevation classes that paint
 * the dialog surface.
 */
export const colorMatrix: Record<DialogVariant, ColorBlock> = {
  standard: {
    bg: "bg-surface-container-high",
    fg: "text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-3",
  },
  tonal: {
    bg: "bg-primary-container",
    fg: "text-on-primary-container",
    border: "border border-transparent",
    elevation: "shadow-elevation-1",
  },
  outlined: {
    bg: "bg-surface",
    fg: "text-on-surface",
    border: "border border-outline",
    elevation: "shadow-elevation-0",
  },
  fullscreen: {
    bg: "bg-surface-container-high",
    fg: "text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
};

export const basicDialogSpec = {
  containerShape: 28,
  minWidth: 280,
  maxWidth: 560,
  dividerHeight: 1,
  iconSize: 24,
  containerPadding: 24,
  buttonGap: 8,
  titleBodyGap: 16,
  iconTitleGap: 16,
  bodyActionsGap: 24,
} as const;

export const fullscreenDialogSpec = {
  containerShape: 0,
  maxWidth: 560,
  headerHeight: 56,
  closeIconSize: 24,
  bottomActionBarHeight: 56,
  containerPadding: 24,
  elementGap: 8,
  dividerHeight: 1,
} as const;

/**
 * Density scale. Drives padding, gap, min/max width, and inline-icon
 * dimensions per the M3 basic dialog spec.
 *
 *   sm  : compact density inside the 280..560px width band
 *   md  : default M3 basic dialog (280..560px wide)
 *   lg  : roomier density while preserving the 560dp M3 max width
 */
export const sizeClasses: Record<
  DialogSize,
  {
    /** Outer padding (24dp gutter on md per the M3 spec). */
    pad: string;
    /** Vertical gap between hero icon, title, supporting text, content, actions. */
    gap: string;
    /** Min-width — gives a predictable shell across viewports. */
    minW: string;
    /** Max-width — enforces the M3 dialog width band. */
    maxW: string;
    /** Hero icon box. */
    iconBox: string;
  }
> = {
  sm: {
    pad: "p-6",
    gap: "gap-4",
    minW: "min-w-[280px]",
    maxW: "max-w-[560px]",
    iconBox: "h-6 w-6",
  },
  md: {
    pad: "p-6",
    gap: "gap-4",
    minW: "min-w-[280px]",
    maxW: "max-w-[560px]",
    iconBox: "h-6 w-6",
  },
  lg: {
    pad: "p-6",
    gap: "gap-4",
    minW: "min-w-[280px]",
    maxW: "max-w-[560px]",
    iconBox: "h-6 w-6",
  },
};

/** Shape token map. Default = `xl` (28dp) per the M3 dialog spec. */
export const shapeClasses: Record<DialogShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Position helper — `fixed` for viewport-anchored (default) and
 * `absolute` when the dialog is mounted inside a contained host
 * (e.g. a Storybook surface).
 */
export const positionClasses = {
  fixed: "fixed inset-0",
  contained: "absolute inset-0",
} as const;

/**
 * Fullscreen surface override. When `variant === "fullscreen"` the
 * surface stretches edge-to-edge and ignores shape/min/max width.
 */
export const fullscreenSurface = "h-full w-full max-w-[560px] min-w-0";

/**
 * Selector that matches focusable descendants for the dialog focus
 * trap and initial focus placement.
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
