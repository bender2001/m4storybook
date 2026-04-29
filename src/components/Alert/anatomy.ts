import type {
  AlertSeverity,
  AlertShape,
  AlertSize,
  AlertVariant,
} from "./types";

/**
 * Alert anatomy + token bindings.
 *
 * Closest M3 analog: Banner (https://m3.material.io/components/banners).
 * The MUI Alert API is preserved (severity + variant + title slot +
 * close button + action slot) and re-skinned with M3 tokens:
 *
 *   - shape       : sm (8dp) by default
 *   - typography  : title-m for the title, body-m for the body (md
 *                   density), with body-s/body-l at sm/lg densities
 *   - icon size   : 20dp at md, 16dp at sm, 24dp at lg per M3 icon
 *                   sizing for inline content
 *   - container   : painted per `variant` × `severity` matrix below
 *   - motion      : enter/exit via AnimatePresence with the M3
 *                   emphasized tween (medium2 / 300ms)
 *
 * State-layer opacities for the trailing close button mirror the
 * shared M3 contract (hover 0.08, focus 0.10, pressed 0.10).
 */
export const anatomy = {
  /** Outer container — the alert surface. */
  root: [
    "relative isolate flex w-full items-start",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /**
   * Disabled wash. The 0.38 opacity is applied via motion's `animate`
   * prop so that motion's inline style doesn't override a CSS class
   * — keep the cursor + pointer-events guard here.
   */
  disabled: "cursor-not-allowed pointer-events-none",
  /** Leading icon container. */
  icon:
    "relative z-[1] flex shrink-0 items-center justify-center",
  /** Vertical stack: title + body. */
  content: "relative z-[1] flex min-w-0 flex-1 flex-col",
  /** Title typography — base; per-size role added below. */
  title: "min-w-0 font-medium",
  /** Body typography — base; per-size role added below. */
  body: "min-w-0",
  /** Trailing action slot (button-shaped). */
  action: "relative z-[1] ml-auto flex shrink-0 items-center self-center",
  /** Close icon button. */
  close: [
    "relative z-[1] inline-flex shrink-0 items-center justify-center self-start",
    "rounded-shape-full outline-none cursor-pointer",
    "transition-opacity duration-short4 ease-standard",
    "opacity-80 hover:opacity-100 focus-visible:opacity-100",
    "focus-visible:ring-2 focus-visible:ring-current",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  ].join(" "),
} as const;

/**
 * Severity × variant color matrix. Each cell returns the resting
 * background, foreground, and border classes that paint the alert
 * surface for that combination.
 */
type ColorBlock = {
  /** Resting background. */
  bg: string;
  /** Resting foreground (text + icon). */
  fg: string;
  /** Border style — `border-transparent` or `border-<role>`. */
  border: string;
};

export const colorMatrix: Record<
  AlertVariant,
  Record<AlertSeverity, ColorBlock>
> = {
  filled: {
    info: {
      bg: "bg-primary",
      fg: "text-on-primary",
      border: "border border-transparent",
    },
    success: {
      bg: "bg-secondary",
      fg: "text-on-secondary",
      border: "border border-transparent",
    },
    warning: {
      bg: "bg-tertiary",
      fg: "text-on-tertiary",
      border: "border border-transparent",
    },
    error: {
      bg: "bg-error",
      fg: "text-on-error",
      border: "border border-transparent",
    },
  },
  tonal: {
    info: {
      bg: "bg-primary-container",
      fg: "text-on-primary-container",
      border: "border border-transparent",
    },
    success: {
      bg: "bg-secondary-container",
      fg: "text-on-secondary-container",
      border: "border border-transparent",
    },
    warning: {
      bg: "bg-tertiary-container",
      fg: "text-on-tertiary-container",
      border: "border border-transparent",
    },
    error: {
      bg: "bg-error-container",
      fg: "text-on-error-container",
      border: "border border-transparent",
    },
  },
  outlined: {
    info: {
      bg: "bg-transparent",
      fg: "text-primary",
      border: "border border-primary",
    },
    success: {
      bg: "bg-transparent",
      fg: "text-secondary",
      border: "border border-secondary",
    },
    warning: {
      bg: "bg-transparent",
      fg: "text-tertiary",
      border: "border border-tertiary",
    },
    error: {
      bg: "bg-transparent",
      fg: "text-error",
      border: "border border-error",
    },
  },
  text: {
    info: {
      bg: "bg-transparent",
      fg: "text-primary",
      border: "border border-transparent",
    },
    success: {
      bg: "bg-transparent",
      fg: "text-secondary",
      border: "border border-transparent",
    },
    warning: {
      bg: "bg-transparent",
      fg: "text-tertiary",
      border: "border border-transparent",
    },
    error: {
      bg: "bg-transparent",
      fg: "text-error",
      border: "border border-transparent",
    },
  },
};

/**
 * Density scale. Drives padding, gap, type role, and the leading
 * icon size.
 */
export const sizeClasses: Record<
  AlertSize,
  {
    /** Outer padding. */
    pad: string;
    /** Gap between leading icon, content, and trailing slot. */
    gap: string;
    /** Min-height — gives the alert a predictable 32/48/56dp shell. */
    minH: string;
    /** Body type role. */
    body: string;
    /** Title type role. */
    title: string;
    /** Leading icon size. */
    iconBox: string;
    /** Close button size. */
    closeBox: string;
  }
> = {
  sm: {
    pad: "px-3 py-1.5",
    gap: "gap-2",
    minH: "min-h-[32px]",
    body: "text-body-s",
    title: "text-title-s",
    iconBox: "h-4 w-4",
    closeBox: "h-7 w-7",
  },
  md: {
    pad: "px-4 py-2",
    gap: "gap-3",
    minH: "min-h-[48px]",
    body: "text-body-m",
    title: "text-title-m",
    iconBox: "h-5 w-5",
    closeBox: "h-8 w-8",
  },
  lg: {
    pad: "px-5 py-3",
    gap: "gap-4",
    minH: "min-h-[56px]",
    body: "text-body-l",
    title: "text-title-m",
    iconBox: "h-6 w-6",
    closeBox: "h-10 w-10",
  },
};

/** Shape token map. Default = `sm` (8dp) per the M3 banner spec. */
export const shapeClasses: Record<AlertShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * ARIA role per severity. Critical severities (error / warning) use
 * `alert` (assertive); informational severities use `status` (polite)
 * per https://www.w3.org/WAI/ARIA/apg/patterns/alert/.
 */
export const severityRole: Record<
  AlertSeverity,
  { role: "alert" | "status"; ariaLive: "assertive" | "polite" }
> = {
  info: { role: "status", ariaLive: "polite" },
  success: { role: "status", ariaLive: "polite" },
  warning: { role: "alert", ariaLive: "assertive" },
  error: { role: "alert", ariaLive: "assertive" },
};
