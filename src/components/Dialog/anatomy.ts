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
 *   - motion      : enter/exit via AnimatePresence with the M3
 *                   emphasized tween; surface scales from 95% on
 *                   enter and back to 95% on exit
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
    "p-4",
  ].join(" "),
  /**
   * Outer container — the dialog surface. Pointer-events re-enabled
   * here so clicks inside the surface don't bubble to the scrim.
   */
  surface: [
    "pointer-events-auto relative isolate flex flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Disabled wash. */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Hero icon row — 24dp glyph centered above the headline. */
  iconRow: "flex items-center justify-center text-on-surface",
  /** Headline slot — typeset headline-s by default. */
  title:
    "text-headline-s text-on-surface min-w-0",
  /** Supporting text row — typeset body-m, on-surface-variant. */
  supportingText:
    "text-body-m text-on-surface-variant min-w-0",
  /** Inline content slot (forms / lists). */
  content: "text-body-l text-on-surface min-w-0",
  /** Trailing action row — text buttons aligned to the end. */
  actions:
    "flex flex-wrap items-center justify-end gap-2 mt-auto",
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
    bg: "bg-surface",
    fg: "text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
};

/**
 * Density scale. Drives padding, gap, min/max width, and inline-icon
 * dimensions per the M3 basic dialog spec.
 *
 *   sm  : compact alert dialog (320..400px wide)
 *   md  : default M3 basic dialog (360..560px wide)
 *   lg  : form / choice dialog (480..720px wide)
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
    pad: "p-5",
    gap: "gap-3",
    minW: "min-w-[280px]",
    maxW: "max-w-[400px]",
    iconBox: "h-6 w-6",
  },
  md: {
    pad: "p-6",
    gap: "gap-4",
    minW: "min-w-[320px]",
    maxW: "max-w-[560px]",
    iconBox: "h-6 w-6",
  },
  lg: {
    pad: "p-7",
    gap: "gap-5",
    minW: "min-w-[400px]",
    maxW: "max-w-[720px]",
    iconBox: "h-7 w-7",
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
export const fullscreenSurface = "h-full w-full max-w-none min-w-0";
