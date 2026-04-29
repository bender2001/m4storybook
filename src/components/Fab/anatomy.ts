import type { FabSize, FabVariant } from "./types";

/**
 * M3 FAB anatomy → Tailwind class strings. Token-driven; no hardcoded
 * colors, radii, or durations.
 *
 * https://m3.material.io/components/floating-action-button/specs
 *  - Resting elevation: level 3
 *  - Hover elevation:   level 4
 *  - Pressed elevation: level 3
 *  - Lowered (overlay): level 1 → level 2 on hover
 *  - State-layer opacities: hover 0.08, focus/pressed 0.10
 *  - Sizes (container/radius/icon):
 *      Small:   40dp / shape-md (12dp) / 24dp
 *      Default: 56dp / shape-lg (16dp) / 24dp
 *      Large:   96dp / shape-xl (28dp) / 36dp
 *  - Extended FAB: 56dp tall rectangular pill, shape-lg, label-l type
 */
export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "outline-none",
    "transition-[box-shadow,background-color,color] duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  icon: "relative z-[1] inline-flex items-center justify-center",
  label: "relative z-[1] inline-flex items-center text-label-l",
} as const;

interface VariantStyles {
  /** Container background + content color. */
  container: string;
  /** State-layer fill. M3 paints it in the on-color role. */
  stateLayer: string;
}

export const variantClasses: Record<FabVariant, VariantStyles> = {
  surface: {
    container: "bg-surface-container-high text-primary",
    stateLayer: "bg-primary",
  },
  primary: {
    container: "bg-primary-container text-on-primary-container",
    stateLayer: "bg-on-primary-container",
  },
  secondary: {
    container: "bg-secondary-container text-on-secondary-container",
    stateLayer: "bg-on-secondary-container",
  },
  tertiary: {
    container: "bg-tertiary-container text-on-tertiary-container",
    stateLayer: "bg-on-tertiary-container",
  },
};

/**
 * Per-size dimensions: container height + width, corner radius,
 * icon dimensions, and the gap used in the extended-FAB layout.
 */
export const sizeClasses: Record<
  FabSize,
  {
    container: string;
    radius: string;
    icon: string;
    extended: string;
  }
> = {
  sm: {
    container: "h-10 w-10",
    radius: "rounded-shape-md",
    icon: "h-6 w-6",
    extended: "",
  },
  md: {
    container: "h-14 w-14",
    radius: "rounded-shape-lg",
    icon: "h-6 w-6",
    extended: "h-14 w-auto px-4 gap-3",
  },
  lg: {
    container: "h-24 w-24",
    radius: "rounded-shape-xl",
    icon: "h-9 w-9",
    extended: "",
  },
};

/**
 * Elevation classes per resting/hover/pressed. M3 spec:
 *   default: rest=3, hover=4, pressed=3
 *   lowered: rest=1, hover=2, pressed=1
 */
export const elevationClasses = {
  default:
    "shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-3",
  lowered:
    "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
} as const;

/**
 * Disabled override applied to all variants. M3 spec calls for an
 * on-surface@12% container with on-surface@38% content; we approximate
 * that with the surface-variant role plus a 38% opacity fade so the
 * FAB still has a visible container shape (token-driven, no rgba
 * literals).
 */
export const disabledClasses = [
  "bg-surface-variant text-on-surface-variant",
  "opacity-[0.38]",
  "shadow-elevation-0 hover:shadow-elevation-0 active:shadow-elevation-0",
].join(" ");
