import type { ModalShape, ModalSize, ModalVariant } from "./types";

/**
 * Modal anatomy + token bindings.
 *
 * Closest M3 analog: the basic dialog surface
 * (https://m3.material.io/components/dialogs/specs). Modal is the
 * primitive that powers Dialog / Drawer / Bottom Sheet — a scrim plus
 * a centered surface with a focus trap, Escape-to-close, and a
 * click-on-scrim contract.
 *
 * The surface is a flex column with three slots:
 *
 *   - header  : optional leading icon + title + trailing icon row
 *   - content : body slot (forms / lists / inline media)
 *   - actions : trailing action row aligned to the end
 *
 * Token bindings:
 *   - shape       : xl (28dp) by default, full scale exposed
 *   - container   : painted per the variant matrix below
 *   - typography  : title-l for the headline, body-l for content
 *   - elevation   : 3 standard, 1 tonal, 0 outlined / text, 4 elevated
 *   - motion      : enter/exit via AnimatePresence with the M3
 *                   emphasized tween; surface scales 95% -> 100% on
 *                   enter and back to 95% on exit
 *
 * The scrim is rendered through the existing Backdrop component so
 * the dismiss contract stays consistent across the app (32% opacity
 * filled scrim per the M3 dialog spec).
 */
export const anatomy = {
  /**
   * Centering host. The modal surface itself does not occupy the
   * entire viewport — instead a flex host pins the surface to the
   * viewport center while staying click-through outside the surface
   * (the surrounding scrim is what catches dismiss clicks).
   */
  positioner: [
    "z-[60] flex items-center justify-center pointer-events-none",
    "p-4",
  ].join(" "),
  /**
   * Outer container — the modal surface. Pointer-events re-enabled
   * here so clicks inside the surface don't bubble to the scrim.
   */
  surface: [
    "pointer-events-auto relative isolate flex flex-col",
    "outline-none",
    "transition-[box-shadow,background-color,border-color,color,opacity]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /**
   * Disabled wash — opacity is animated via motion's animate prop.
   * `!pointer-events-none` overrides the surface's resting
   * `pointer-events-auto` (Tailwind utility specificity ties otherwise).
   */
  disabled: "cursor-not-allowed !pointer-events-none",
  /** Header row — leading icon + title + trailing icon. */
  header: "flex items-center gap-3 min-w-0",
  /** Leading icon box — 24dp glyph, on-surface tint. */
  leadingIcon:
    "flex h-6 w-6 shrink-0 items-center justify-center text-on-surface",
  /** Title slot — typeset title-l, fills the remaining space. */
  title:
    "flex-1 min-w-0 text-title-l text-on-surface truncate",
  /** Trailing icon button — 24dp tap target with state-layer hover. */
  trailingIcon: [
    "flex h-9 w-9 shrink-0 items-center justify-center",
    "rounded-shape-full text-on-surface-variant",
    "transition-colors duration-short2 ease-standard",
    "hover:bg-on-surface/[0.08] focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary",
  ].join(" "),
  /** Body content slot. */
  content: "min-w-0 text-body-l text-on-surface",
  /** Trailing action row — buttons aligned to the end. */
  actions:
    "flex flex-wrap items-center justify-end gap-2 mt-auto",
  /** Focus ring applied to the surface when focused via tab. */
  focusRing:
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
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
 * the modal surface.
 */
export const colorMatrix: Record<ModalVariant, ColorBlock> = {
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
  text: {
    bg: "bg-transparent",
    fg: "text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-0",
  },
  elevated: {
    bg: "bg-surface-container-low",
    fg: "text-on-surface",
    border: "border border-transparent",
    elevation: "shadow-elevation-4",
  },
};

/**
 * Density scale. Drives padding, gap, min/max width, and inline icon
 * dimensions per the M3 dialog/modal spec.
 */
export const sizeClasses: Record<
  ModalSize,
  {
    /** Outer padding (24dp gutter on md per the M3 spec). */
    pad: string;
    /** Vertical gap between header / content / actions. */
    gap: string;
    /** Min-width — gives a predictable shell across viewports. */
    minW: string;
    /** Max-width — enforces the M3 modal width band. */
    maxW: string;
    /** Min-height — enough room to host a header + actions row. */
    minH: string;
  }
> = {
  sm: {
    pad: "p-5",
    gap: "gap-3",
    minW: "min-w-[280px]",
    maxW: "max-w-[400px]",
    minH: "min-h-[120px]",
  },
  md: {
    pad: "p-6",
    gap: "gap-4",
    minW: "min-w-[320px]",
    maxW: "max-w-[560px]",
    minH: "min-h-[160px]",
  },
  lg: {
    pad: "p-7",
    gap: "gap-5",
    minW: "min-w-[400px]",
    maxW: "max-w-[720px]",
    minH: "min-h-[200px]",
  },
};

/** Shape token map. Default = `xl` (28dp) per the M3 dialog/modal spec. */
export const shapeClasses: Record<ModalShape, string> = {
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
 * `absolute` when the modal is mounted inside a contained host (e.g.
 * a Storybook surface).
 */
export const positionClasses = {
  fixed: "fixed inset-0",
  contained: "absolute inset-0",
} as const;

/**
 * Selector that matches focusable descendants for the focus trap.
 * Mirrors the canonical "focusable" set: links + buttons + inputs +
 * textareas + selects + summaries + anything with tabindex >= 0.
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
