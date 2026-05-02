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
 *  - Floating label: body-l resting → body-s floated inside the tray.
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
    "placeholder:text-on-surface-variant placeholder:opacity-100",
    "disabled:cursor-not-allowed disabled:text-on-surface disabled:opacity-[0.38]",
  ].join(" "),
  /** Floating label (animates between resting and floating positions). */
  label: [
    "absolute z-[1] origin-left cursor-text",
    "transition-[transform,color,font-size,top] duration-medium2 ease-emphasized",
    "select-none",
  ].join(" "),
  /** Prefix/suffix text painted with the input text token family. */
  affixText:
    "relative z-[1] shrink-0 text-body-l text-on-surface-variant transition-colors duration-medium2 ease-emphasized",
  /** Leading icon slot. */
  leadingIcon:
    "relative z-[1] inline-flex shrink-0 items-center justify-center text-on-surface-variant [&>svg]:h-full [&>svg]:w-full",
  /** Trailing icon slot. */
  trailingIcon:
    "relative z-[1] inline-flex shrink-0 items-center justify-center text-on-surface-variant [&>svg]:h-full [&>svg]:w-full",
  /** Supporting text row beneath the field. Color is set per-instance. */
  supportingRow: "flex min-h-4 items-start gap-3 px-4 text-body-s",
  supportingText: "min-w-0 flex-1 text-body-s",
  counter: "shrink-0 whitespace-nowrap text-body-s text-on-surface-variant",
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
      "[&[data-disabled=true]]:border-on-surface",
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
      "[&[data-disabled=true]]:border-on-surface",
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
  /** Inline padding when a label is present. */
  inputPaddingWithLabel: string;
  /** Type role for the input itself. */
  inputType: string;
  /** Type role for prefix/suffix text. */
  affixType: string;
  /** Resting label class — does NOT set `left`. */
  label: string;
  /** Filled floating label class — does NOT set `left`. */
  labelFloatingFilled: string;
  /** Outlined floating label class — does NOT set `left`. */
  labelFloatingOutlined: string;
  /** Resting label `left-*` when there is no leading icon. */
  labelLeft: string;
  /** Resting label `left-*` when there is a leading icon. */
  labelLeftWithIcon: string;
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
    inputPaddingWithLabel: "pt-[18px] pb-1",
    inputType: "text-body-m",
    affixType: "text-body-m",
    label: "top-1/2 -translate-y-1/2 text-body-m",
    labelFloatingFilled: "top-1 text-body-s -translate-y-0",
    labelFloatingOutlined: "-top-2 text-body-s bg-background px-1 -translate-y-0",
    labelLeft: "left-3",
    labelLeftWithIcon: "left-10",
    iconBox: "h-5 w-5",
    leadingIconMargin: "mr-2",
    trailingIconMargin: "ml-2",
  },
  md: {
    field: "h-14",
    paddingX: "px-4",
    inputPadding: "py-4",
    inputPaddingWithLabel: "pt-6 pb-1.5",
    inputType: "text-body-l",
    affixType: "text-body-l",
    label: "top-1/2 -translate-y-1/2 text-body-l",
    labelFloatingFilled: "top-2 text-body-s -translate-y-0",
    labelFloatingOutlined: "-top-2 text-body-s bg-background px-1 -translate-y-0",
    labelLeft: "left-4",
    labelLeftWithIcon: "left-14",
    iconBox: "h-6 w-6",
    leadingIconMargin: "mr-3",
    trailingIconMargin: "ml-3",
  },
  lg: {
    field: "h-[72px]",
    paddingX: "px-5",
    inputPadding: "py-5",
    inputPaddingWithLabel: "pt-8 pb-2",
    inputType: "text-title-m",
    affixType: "text-title-m",
    label: "top-1/2 -translate-y-1/2 text-body-l",
    labelFloatingFilled: "top-2.5 text-body-s -translate-y-0",
    labelFloatingOutlined: "-top-2 text-body-s bg-background px-1 -translate-y-0",
    labelLeft: "left-5",
    labelLeftWithIcon: "left-16",
    iconBox: "h-7 w-7",
    leadingIconMargin: "mr-4",
    trailingIconMargin: "ml-4",
  },
};
