import type { TextFieldSize, TextFieldVariant } from "./types";

/**
 * M3 Text Field anatomy → Tailwind class strings. Token-driven only.
 *
 * Spec at https://m3.material.io/components/text-fields/specs.
 *
 * Filled variant
 *  - 56dp container at md, rounded-t-shape-xs (4dp top corners only).
 *  - Tray paints surface-container-highest.
 *  - Bottom indicator: 1dp on-surface-variant; morphs to 2dp primary
 *    on focus, 2dp error on error.
 *  - Floating label: body-l resting → label-m floated above the tray.
 *  - State-layer: rounded-t-shape-xs, on-surface fill at hover 0.08 /
 *    focus 0.10 / pressed 0.10.
 *
 * Outlined variant
 *  - 56dp container at md, rounded-shape-xs (4dp all corners).
 *  - 1dp outline border; morphs to 2dp primary on focus, 2dp error on
 *    error. Floating label cuts through the outline at the top edge.
 *  - State-layer: rounded-shape-xs, primary fill at the M3 opacities.
 */
export const anatomy = {
  /** Outer wrapper holding the field column + helper text row. */
  root: "relative inline-flex w-full flex-col gap-1 font-sans",
  /** Field tray. Holds the floating label, input, icons, state layer. */
  field: [
    "relative flex w-full items-center",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "cursor-text text-left",
  ].join(" "),
  /** State-layer painted across the field on hover/focus/press. */
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Native `<input>`. */
  input: [
    "relative z-[1] w-full bg-transparent outline-none",
    "text-on-surface caret-primary",
    "placeholder:text-on-surface-variant placeholder:opacity-70",
    "disabled:cursor-not-allowed",
  ].join(" "),
  /** Floating label (animates between resting and floating positions). */
  label: [
    "absolute z-[1] origin-left cursor-text",
    "transition-[transform,color,font-size,top] duration-medium2 ease-emphasized",
    "select-none",
  ].join(" "),
  /** Leading icon slot. */
  leadingIcon:
    "relative z-[1] inline-flex shrink-0 items-center justify-center text-on-surface-variant",
  /** Trailing icon slot. */
  trailingIcon:
    "relative z-[1] inline-flex shrink-0 items-center justify-center text-on-surface-variant",
  /** Helper text row beneath the field. Color is set per-instance. */
  helperText: "px-4 text-body-s",
} as const;

interface VariantClasses {
  /** Field tray classes (radius + background + border). */
  field: string;
  /** State-layer fill class. */
  stateLayer: string;
}

export const variantClasses: Record<TextFieldVariant, VariantClasses> = {
  filled: {
    field: [
      "rounded-t-shape-xs bg-surface-container-highest",
      "border-b border-on-surface-variant",
      "[&[data-focused=true]]:border-primary",
      "[&[data-focused=true]]:border-b-2",
      "[&[data-error=true]]:border-error",
    ].join(" "),
    stateLayer: "bg-on-surface rounded-t-shape-xs",
  },
  outlined: {
    field: [
      "rounded-shape-xs bg-transparent",
      "border border-outline",
      "[&[data-focused=true]]:border-primary",
      "[&[data-focused=true]]:border-2",
      "[&[data-error=true]]:border-error",
    ].join(" "),
    stateLayer: "bg-primary rounded-shape-xs",
  },
};

interface SizeSpec {
  /** Height class on the field tray. */
  field: string;
  /** Horizontal padding on the tray. */
  paddingX: string;
  /** Inline padding for the native input (drives Y centering). */
  inputPadding: string;
  /** Type role for the input itself. */
  inputType: string;
  /** Resting label class — does NOT set `left`. */
  label: string;
  /** Floating label class — does NOT set `left`. */
  labelFloating: string;
  /** Resting label `left-*` when there is no leading icon. */
  labelLeft: string;
  /** Resting label `left-*` when there is a leading icon. */
  labelLeftWithIcon: string;
  /** Floating label `left-*` (always anchored to the field edge). */
  labelLeftFloating: string;
  /** 24dp/20dp/28dp icon-box class. */
  iconBox: string;
  /** Right margin on the leading icon (gap to input). */
  leadingIconMargin: string;
  /** Left margin on the trailing icon (gap to input). */
  trailingIconMargin: string;
}

export const sizeSpec: Record<TextFieldSize, SizeSpec> = {
  sm: {
    field: "h-10",
    paddingX: "px-3",
    inputPadding: "py-2",
    inputType: "text-body-m",
    label: "top-1/2 -translate-y-1/2 text-body-m",
    labelFloating: "-top-1.5 text-label-s bg-background px-1 -translate-y-0",
    labelLeft: "left-3",
    labelLeftWithIcon: "left-10",
    labelLeftFloating: "left-3",
    iconBox: "h-5 w-5",
    leadingIconMargin: "mr-2",
    trailingIconMargin: "ml-2",
  },
  md: {
    field: "h-14",
    paddingX: "px-4",
    inputPadding: "py-4",
    inputType: "text-body-l",
    label: "top-1/2 -translate-y-1/2 text-body-l",
    labelFloating: "-top-2 text-label-m bg-background px-1 -translate-y-0",
    labelLeft: "left-4",
    labelLeftWithIcon: "left-14",
    labelLeftFloating: "left-4",
    iconBox: "h-6 w-6",
    leadingIconMargin: "mr-3",
    trailingIconMargin: "ml-3",
  },
  lg: {
    field: "h-[72px]",
    paddingX: "px-5",
    inputPadding: "py-5",
    inputType: "text-title-m",
    label: "top-1/2 -translate-y-1/2 text-body-l",
    labelFloating: "-top-2 text-label-m bg-background px-1 -translate-y-0",
    labelLeft: "left-5",
    labelLeftWithIcon: "left-16",
    labelLeftFloating: "left-5",
    iconBox: "h-7 w-7",
    leadingIconMargin: "mr-4",
    trailingIconMargin: "ml-4",
  },
};
