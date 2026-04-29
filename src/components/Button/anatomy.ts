import type { ButtonSize, ButtonVariant } from "./types";

/**
 * Button anatomy slot → Tailwind class string. Every value comes from
 * an M3 token utility (no hex literals, no raw px). The Playwright
 * spec verifies the resulting computed styles against the M3 spec.
 */
export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "rounded-shape-full font-medium outline-none",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center",
  icon: "relative z-[1] inline-flex items-center",
} as const;

export const variantClasses: Record<ButtonVariant, string> = {
  filled: [
    "bg-primary text-on-primary",
    "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    "disabled:shadow-elevation-0",
  ].join(" "),
  tonal: [
    "bg-secondary-container text-on-secondary-container",
    "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
  ].join(" "),
  outlined: [
    "bg-transparent text-primary border border-outline",
    "hover:border-primary",
    "disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
  ].join(" "),
  text: ["bg-transparent text-primary", "disabled:text-on-surface/[0.38]"].join(
    " ",
  ),
  elevated: [
    "bg-surface-container-low text-primary",
    "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
    "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    "disabled:shadow-elevation-0",
  ].join(" "),
};

/**
 * State-layer color per variant. M3 paints the layer in the on-color
 * role over the container. For text/outlined, the layer sits on the
 * primary role since those variants have transparent containers.
 */
export const stateLayerClasses: Record<ButtonVariant, string> = {
  filled: "bg-on-primary",
  tonal: "bg-on-secondary-container",
  outlined: "bg-primary",
  text: "bg-primary",
  elevated: "bg-primary",
};

export const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-m gap-1.5",
  md: "h-10 px-6 text-label-l gap-2",
  lg: "h-14 px-8 text-title-m gap-2.5",
};
