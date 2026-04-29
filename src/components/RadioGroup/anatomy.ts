import type { RadioSize, RadioVariant } from "./types";

/**
 * M3 Radio anatomy → Tailwind class strings. Token-driven only;
 * no hardcoded colors / radii / durations.
 *
 * https://m3.material.io/components/radio-button/specs
 *  - Outer circle: 20dp, 2dp ring stroke.
 *  - State-layer / hit target: 40dp circular surface.
 *  - Resting (unselected) ring: on-surface-variant.
 *  - Selected: primary ring + 10dp filled inner dot in primary.
 *  - Error: ring + dot swap to error role.
 *  - Disabled: 38% opacity tint of on-surface for both ring and dot.
 *  - State-layer opacities: hover 0.08, focus/pressed 0.10.
 */
export const anatomy = {
  /** The whole group container — fieldset-like. */
  group: ["inline-flex flex-col gap-2"].join(" "),
  /** Group legend rendered above the options. */
  legend: ["text-label-l text-on-surface-variant"].join(" "),
  /** Helper text under the legend. */
  groupHelper: ["text-body-s text-on-surface-variant"].join(" "),
  /** Wrapper for the rendered options. Direction is set by component. */
  options: ["inline-flex gap-1"].join(" "),
  /** Outer label-row: positions box + label + optional icons. */
  root: [
    "inline-flex items-center gap-3",
    "text-on-surface",
    "select-none cursor-pointer",
  ].join(" "),
  /** Wraps the input + state-layer + visual circle. Receives the click. */
  control: [
    "relative flex items-center justify-center shrink-0",
    "rounded-shape-full",
    "transition-[background-color] duration-medium2 ease-emphasized",
    "cursor-pointer",
  ].join(" "),
  /** Visually-hidden native input for accessibility. */
  input: [
    "peer absolute inset-0 m-0 h-full w-full cursor-pointer",
    "appearance-none opacity-0",
    "disabled:cursor-not-allowed",
  ].join(" "),
  /** State layer painted under the circle. */
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** The 20dp ring that shows the outline / selected ring. */
  circle: [
    "relative inline-flex items-center justify-center",
    "rounded-shape-full",
    "border-2 bg-transparent",
    "transition-[border-color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** The inner dot rendered when selected. */
  dot: [
    "rounded-shape-full",
    "transition-[background-color,transform] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Label text next to the circle. */
  label: [
    "text-body-l text-on-surface",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  /** Label/helper-text column when helper-text is present. */
  labelColumn: "flex flex-col",
  /** Helper text under the label. */
  helper: "text-body-s text-on-surface-variant",
  icon: "inline-flex shrink-0 items-center justify-center",
} as const;

/**
 * Per-size measurements: state-layer / hit target, the visual circle,
 * inner dot, and label type role.
 *
 * - sm: state-layer 32dp, circle 16dp, dot 8dp, label-l (14px)
 * - md: state-layer 40dp, circle 20dp, dot 10dp, body-l (16px)   (M3 default)
 * - lg: state-layer 48dp, circle 24dp, dot 12dp, title-m (16px+)
 */
export const sizeClasses: Record<
  RadioSize,
  { control: string; circle: string; dot: string; label: string }
> = {
  sm: {
    control: "h-8 w-8",
    circle: "h-4 w-4",
    dot: "h-2 w-2",
    label: "text-label-l",
  },
  md: {
    control: "h-10 w-10",
    circle: "h-5 w-5",
    dot: "h-2.5 w-2.5",
    label: "text-body-l",
  },
  lg: {
    control: "h-12 w-12",
    circle: "h-6 w-6",
    dot: "h-3 w-3",
    label: "text-title-m",
  },
};

interface VariantStyles {
  /** Border classes when unselected. */
  rest: string;
  /** Border classes when selected. */
  selected: string;
  /** Inner dot fill color. */
  dot: string;
  /** Background of the state-layer. */
  stateLayer: string;
  /** Color of the label when this variant signals error. */
  label: string;
}

/**
 * Variant → state classes. `default` uses primary; `error` uses error.
 * Disabled treatment is added on top by the component when needed.
 */
export const variantClasses: Record<RadioVariant, VariantStyles> = {
  default: {
    rest: "border-on-surface-variant",
    selected: "border-primary",
    dot: "bg-primary",
    stateLayer: "bg-on-surface",
    label: "text-on-surface",
  },
  error: {
    rest: "border-error",
    selected: "border-error",
    dot: "bg-error",
    stateLayer: "bg-error",
    label: "text-error",
  },
};

/** Disabled overrides applied to circle + label regardless of variant. */
export const disabledClasses = {
  control: "cursor-not-allowed",
  circle: "border-on-surface/[0.38]",
  selectedCircle: "border-on-surface/[0.38]",
  dot: "bg-on-surface/[0.38]",
  label: "text-on-surface/[0.38]",
} as const;
