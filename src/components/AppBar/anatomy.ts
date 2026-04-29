import type {
  AppBarShape,
  AppBarSize,
  AppBarVariant,
} from "./types";

/**
 * App Bar anatomy + token bindings.
 *
 * M3 Top App Bar spec: https://m3.material.io/components/top-app-bar
 *  - container shape : `none` (full-bleed) by default
 *  - resting fill    : surface (variant `flat`) -> surface-container
 *                      (variant `on-scroll`)
 *  - heights         : 64 / 112 / 152 dp for small / medium / large
 *                      (center-aligned mirrors small)
 *  - top row         : leading-icon + title? + trailing-actions sit on
 *                      a 64dp row at the top of the bar
 *  - title roles     : title-l (small/center) / headline-s (medium) /
 *                      headline-m (large)
 *  - icon size       : 24dp (md), 20dp (sm), 28dp (lg)
 *  - leading offset  : 4dp / 16dp / 24dp gutter for sm / md / lg so the
 *                      hit target lines up with the M3 list spec
 *  - bottom variant  : 80dp surface-container, leading icons (up to 4)
 *                      + trailing FAB
 */
export const anatomy = {
  /** Outer container — semantic <header>/<footer> picked at runtime. */
  root: [
    "relative isolate flex w-full flex-col",
    "transition-[box-shadow,background-color,color]",
    "duration-medium2 ease-emphasized",
  ].join(" "),
  /** Top row — the 64dp row that always carries leading + actions. */
  topRow:
    "relative z-[1] flex w-full items-center",
  /** Container that holds the title in medium / large variants. */
  titleRow:
    "relative z-[1] flex w-full items-end pb-2",
  /** Centered title row used by small / center-aligned variants. */
  titleSmall:
    "relative z-[1] flex min-w-0 flex-1 items-center",
  /** Leading slot — nav/menu icon button. */
  leading:
    "relative z-[1] flex items-center justify-center text-on-surface shrink-0",
  /** Trailing slot — action icons row. */
  trailing:
    "relative z-[1] ml-auto flex items-center text-on-surface shrink-0",
  /** Title typography — base classes; per-variant role added below. */
  title: "min-w-0 truncate text-on-surface",
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
} as const;

/**
 * Variant matrix. Top variants stack the same surface treatment but
 * differ in height + title typography + title placement. The bottom
 * variant uses surface-container per the M3 Bottom App Bar spec.
 */
export const variantClasses: Record<
  AppBarVariant,
  {
    /** Resting fill (flat / scroll-position-0). */
    rest: string;
    /** On-scroll fill swap. */
    scrolled: string;
    /** Shadow applied when `elevated` is true. */
    elevation: string;
    /** Title typography role. */
    titleType: string;
    /** Title alignment within its row. */
    titleAlign: string;
    /** Where the title row sits relative to the top row. */
    layout: "single-row" | "two-row";
    /** Total height in px (drives min-height + the title-row split). */
    height: { sm: number; md: number; lg: number };
    /** Default semantic element (header vs footer). */
    element: "header" | "footer";
    /** ARIA role default. */
    role: "banner" | "contentinfo";
  }
> = {
  small: {
    rest: "bg-surface text-on-surface",
    scrolled: "bg-surface-container text-on-surface",
    elevation: "shadow-elevation-2",
    titleType: "text-title-l",
    titleAlign: "justify-start",
    layout: "single-row",
    height: { sm: 56, md: 64, lg: 72 },
    element: "header",
    role: "banner",
  },
  "center-aligned": {
    rest: "bg-surface text-on-surface",
    scrolled: "bg-surface-container text-on-surface",
    elevation: "shadow-elevation-2",
    titleType: "text-title-l",
    titleAlign: "justify-center",
    layout: "single-row",
    height: { sm: 56, md: 64, lg: 72 },
    element: "header",
    role: "banner",
  },
  medium: {
    rest: "bg-surface text-on-surface",
    scrolled: "bg-surface-container text-on-surface",
    elevation: "shadow-elevation-2",
    titleType: "text-headline-s",
    titleAlign: "justify-start",
    layout: "two-row",
    height: { sm: 96, md: 112, lg: 128 },
    element: "header",
    role: "banner",
  },
  large: {
    rest: "bg-surface text-on-surface",
    scrolled: "bg-surface-container text-on-surface",
    elevation: "shadow-elevation-2",
    titleType: "text-headline-m",
    titleAlign: "justify-start",
    layout: "two-row",
    height: { sm: 136, md: 152, lg: 168 },
    element: "header",
    role: "banner",
  },
  bottom: {
    rest: "bg-surface-container text-on-surface",
    scrolled: "bg-surface-container text-on-surface",
    elevation: "shadow-elevation-2",
    titleType: "text-title-m",
    titleAlign: "justify-start",
    layout: "single-row",
    height: { sm: 72, md: 80, lg: 96 },
    element: "footer",
    role: "contentinfo",
  },
};

/**
 * Density scale. Drives the horizontal gutter, icon size, and the
 * single-row top-bar min-height.
 */
export const sizeClasses: Record<
  AppBarSize,
  {
    /** Horizontal page gutter. */
    gutter: string;
    /** Inter-slot gap. */
    gap: string;
    /** Icon target size. */
    iconSize: string;
  }
> = {
  sm: { gutter: "px-3", gap: "gap-2", iconSize: "h-5 w-5" },
  md: { gutter: "px-4", gap: "gap-3", iconSize: "h-6 w-6" },
  lg: { gutter: "px-6", gap: "gap-4", iconSize: "h-7 w-7" },
};

/**
 * Shape map. Defaults to `none` (full-bleed) per the M3 top app bar
 * spec; the floating / docked use cases pass `md` or `lg`.
 */
export const shapeClasses: Record<AppBarShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};
