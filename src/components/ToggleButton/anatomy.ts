import type { ToggleButtonSize, ToggleButtonVariant } from "./types";

/**
 * Toggle Button anatomy: a single button that toggles selection state.
 * M3 Expressive characteristic = shape morph on toggle (rest = shape-full,
 * selected = shape-md) plus a swap from the surface role to the
 * secondary-container role. Ties to the M3 Button + Button Group specs:
 *   https://m3.material.io/components/buttons/specs
 *   https://m3.material.io/components/segmented-buttons/specs
 */
export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "outline-none cursor-pointer font-medium",
    "transition-[box-shadow,background-color,border-color,color,border-radius]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed disabled:opacity-[0.38]",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center",
  icon: "relative z-[1] inline-flex items-center",
} as const;

/**
 * Per-variant rest + selected styles. Selected always swaps to the
 * secondary-container role (M3's segmented-button-active treatment),
 * except for `filled` which goes to full secondary for higher contrast.
 */
export const variantClasses: Record<
  ToggleButtonVariant,
  { rest: string; selected: string; stateLayer: string }
> = {
  filled: {
    rest: [
      "bg-primary text-on-primary",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
    ].join(" "),
    stateLayer: "bg-on-primary",
  },
  tonal: {
    rest: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-0 hover:shadow-elevation-1 active:shadow-elevation-0",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: [
      "bg-secondary text-on-secondary",
      "shadow-elevation-0 hover:shadow-elevation-1",
    ].join(" "),
    stateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: [
      "bg-transparent text-on-surface border border-outline",
      "hover:border-primary",
      "disabled:text-on-surface/[0.38] disabled:border-on-surface/[0.12]",
    ].join(" "),
    selected: [
      "bg-secondary-container text-on-secondary-container border border-outline",
    ].join(" "),
    stateLayer: "bg-on-surface",
  },
  text: {
    rest: [
      "bg-transparent text-on-surface-variant",
      "disabled:text-on-surface/[0.38]",
    ].join(" "),
    selected: ["bg-secondary-container text-on-secondary-container"].join(" "),
    stateLayer: "bg-primary",
  },
  elevated: {
    rest: [
      "bg-surface-container-low text-on-surface",
      "shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
      "disabled:bg-on-surface/[0.12] disabled:text-on-surface/[0.38] disabled:shadow-elevation-0",
    ].join(" "),
    selected: [
      "bg-secondary-container text-on-secondary-container",
      "shadow-elevation-1",
    ].join(" "),
    stateLayer: "bg-primary",
  },
};

/**
 * Toggle Button shares the standard M3 Button height tokens:
 * sm 32dp / md 40dp / lg 56dp.
 */
export const sizeClasses: Record<ToggleButtonSize, string> = {
  sm: "h-8 px-3 text-label-m gap-1.5 min-w-8",
  md: "h-10 px-6 text-label-l gap-2 min-w-10",
  lg: "h-14 px-8 text-title-m gap-2.5 min-w-14",
};

/**
 * M3 Expressive shape morph: at rest the button is fully rounded (pill),
 * once selected it morphs to the medium shape token (shape-md = 12dp)
 * for tactile feedback. Both states animate over the medium2 (300ms)
 * emphasized easing token.
 */
export const shapeClasses = {
  rest: "rounded-shape-full",
  selected: "rounded-shape-md",
} as const;
