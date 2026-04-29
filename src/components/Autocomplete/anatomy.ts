import type { AutocompleteSize, AutocompleteVariant } from "./types";

/**
 * Autocomplete anatomy slot → Tailwind class string. Every value comes
 * from an M3 token utility (no hex literals, no raw px). M3 has no
 * dedicated Autocomplete spec, so the field re-uses the M3 Text Field
 * spec (outlined / filled) with an M3 Menu popup for the option list.
 */
export const anatomy = {
  root: "relative inline-flex w-full flex-col gap-1 font-sans",
  field: [
    "relative flex w-full items-center",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "cursor-text",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  input: [
    "relative z-[1] w-full bg-transparent outline-none",
    "placeholder:text-on-surface-variant placeholder:opacity-70",
    "disabled:cursor-not-allowed",
  ].join(" "),
  label: [
    "pointer-events-none absolute z-[1] origin-left",
    "transition-[transform,color,font-size] duration-medium2 ease-emphasized",
    "select-none",
  ].join(" "),
  leadingIcon: "relative z-[1] inline-flex shrink-0 items-center justify-center",
  trailingIcon:
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  helperText: "px-4 text-body-s text-on-surface-variant",
  popup: [
    "absolute left-0 right-0 z-50 mt-1 origin-top",
    "rounded-shape-xs bg-surface-container shadow-elevation-2",
    "overflow-hidden py-2",
  ].join(" "),
  list: "max-h-60 overflow-auto",
  option: [
    "relative flex cursor-pointer select-none items-center",
    "px-4 text-body-l text-on-surface",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  optionStateLayer:
    "pointer-events-none absolute inset-0 transition-opacity duration-short4 ease-standard",
  empty: "px-4 py-3 text-body-m text-on-surface-variant",
} as const;

/**
 * Per-variant container styling. Filled = surface-container-highest fill
 * with bottom border; outlined = transparent fill with a full outline.
 */
export const variantFieldClasses: Record<AutocompleteVariant, string> = {
  filled: [
    "rounded-t-shape-xs bg-surface-container-highest",
    "border-b border-on-surface-variant",
    "focus-within:border-primary",
    "[&[data-error=true]]:border-error",
  ].join(" "),
  outlined: [
    "rounded-shape-xs bg-transparent",
    "border border-outline",
    "focus-within:border-primary focus-within:border-2",
    "[&[data-error=true]]:border-error",
  ].join(" "),
};

/**
 * State-layer color per variant. The on-color sits over the container
 * for filled; outlined paints the layer in primary since the container
 * is transparent.
 */
export const variantStateLayerClasses: Record<AutocompleteVariant, string> = {
  filled: "bg-on-surface rounded-t-shape-xs",
  outlined: "bg-primary rounded-shape-xs",
};

interface SizeSpec {
  field: string;
  paddingX: string;
  input: string;
  label: string;
  labelFloating: string;
  iconBox: string;
  popupOption: string;
}

/**
 * M3 Text Field heights: sm = 40dp (compact density), md = 56dp
 * (default M3 spec), lg = 72dp (comfortable density).
 */
export const sizeSpec: Record<AutocompleteSize, SizeSpec> = {
  sm: {
    field: "h-10",
    paddingX: "px-3",
    input: "py-2 text-body-m",
    label: "left-3 top-1/2 -translate-y-1/2 text-body-m text-on-surface-variant",
    labelFloating:
      "left-3 -top-1.5 text-label-s bg-background px-1 -translate-y-0 text-primary",
    iconBox: "h-5 w-5",
    popupOption: "h-10",
  },
  md: {
    field: "h-14",
    paddingX: "px-4",
    input: "py-4 text-body-l",
    label: "left-4 top-1/2 -translate-y-1/2 text-body-l text-on-surface-variant",
    labelFloating:
      "left-4 -top-2 text-label-m bg-background px-1 -translate-y-0 text-primary",
    iconBox: "h-6 w-6",
    popupOption: "h-12",
  },
  lg: {
    field: "h-[72px]",
    paddingX: "px-5",
    input: "py-5 text-title-m",
    label: "left-5 top-1/2 -translate-y-1/2 text-body-l text-on-surface-variant",
    labelFloating:
      "left-5 -top-2 text-label-m bg-background px-1 -translate-y-0 text-primary",
    iconBox: "h-7 w-7",
    popupOption: "h-14",
  },
};
