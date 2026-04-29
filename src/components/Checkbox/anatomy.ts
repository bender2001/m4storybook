import type { CheckboxSize, CheckboxVariant } from "./types";

/**
 * M3 Checkbox anatomy → Tailwind class strings. Token-driven only;
 * no hardcoded colors / radii / durations.
 *
 * https://m3.material.io/components/checkbox/specs
 *  - Container box: 18dp × 18dp, 2dp corner radius (shape-xs).
 *  - Hit target / state-layer: 40dp circular surface around the box.
 *  - Resting (unchecked) outline: on-surface-variant, 2dp.
 *  - Selected fill: primary; checkmark stroke: on-primary.
 *  - Indeterminate: horizontal bar in on-primary on a primary fill.
 *  - Error: outline + fill swap to error role.
 *  - Disabled: 38% opacity tint of on-surface for both outline and fill.
 *  - State-layer opacities: hover 0.08, focus/pressed 0.10.
 */
export const anatomy = {
  /** Outer label-row: positions box + label + optional icons. */
  root: [
    "inline-flex items-center gap-3",
    "text-on-surface",
    "select-none cursor-pointer",
  ].join(" "),
  /** Wraps the input + state-layer + visual box. Receives the click. */
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
  /** State layer painted under the box. */
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** The 18dp box that shows the outline / fill / checkmark. */
  box: [
    "relative inline-flex items-center justify-center",
    "rounded-shape-xs",
    "border-2",
    "transition-[background-color,border-color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Wrapper for the SVG checkmark / indeterminate bar. */
  glyphWrapper: [
    "absolute inset-0 flex items-center justify-center",
    "pointer-events-none",
  ].join(" "),
  /** Label text next to the box. */
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
 * Per-size measurements: state-layer / hit target, the visual 18dp box,
 * label type role and ring offset.
 *
 * - sm: state-layer 32dp, box 16dp, label-l (14px)
 * - md: state-layer 40dp, box 18dp, body-l (16px)   (M3 default)
 * - lg: state-layer 48dp, box 24dp, title-m (16px+)
 */
export const sizeClasses: Record<
  CheckboxSize,
  { control: string; box: string; label: string; glyph: string }
> = {
  sm: {
    control: "h-8 w-8",
    box: "h-4 w-4",
    label: "text-label-l",
    glyph: "h-3 w-3",
  },
  md: {
    control: "h-10 w-10",
    box: "h-[18px] w-[18px]",
    label: "text-body-l",
    glyph: "h-3.5 w-3.5",
  },
  lg: {
    control: "h-12 w-12",
    box: "h-6 w-6",
    label: "text-title-m",
    glyph: "h-5 w-5",
  },
};

interface VariantBoxStyles {
  /** Border + bg classes when unchecked. */
  rest: string;
  /** Border + bg classes when checked or indeterminate. */
  selected: string;
  /** Class for the glyph stroke / fill. */
  glyph: string;
  /** Background of the state-layer. */
  stateLayer: string;
  /** Color of the label when this variant is in error state. */
  label: string;
}

/**
 * Variant → state classes. `default` uses primary; `error` uses error.
 * Disabled treatment is added on top by the component when needed.
 */
export const variantClasses: Record<CheckboxVariant, VariantBoxStyles> = {
  default: {
    rest: "border-on-surface-variant bg-transparent",
    selected: "border-primary bg-primary",
    glyph: "text-on-primary",
    stateLayer: "bg-on-surface",
    label: "text-on-surface",
  },
  error: {
    rest: "border-error bg-transparent",
    selected: "border-error bg-error",
    glyph: "text-on-error",
    stateLayer: "bg-error",
    label: "text-error",
  },
};

/** Disabled overrides applied to box + label regardless of variant. */
export const disabledClasses = {
  control: "cursor-not-allowed",
  box: "border-on-surface/[0.38] bg-transparent",
  selectedBox: "border-on-surface/[0.38] bg-on-surface/[0.38]",
  glyph: "text-surface",
  label: "text-on-surface/[0.38]",
} as const;
