import type { SelectSize, SelectVariant } from "./types";

/**
 * Select anatomy slot → Tailwind class string. Token-driven only.
 *
 * M3 has no Expressive Select spec, so this builds on the M3 Text
 * Field anatomy (filled / outlined) plus an M3 Menu popup. The
 * trigger is a `combobox` / `aria-haspopup=listbox` button (not a
 * native `<select>`), so the dropdown can be styled and animated
 * with M3 tokens. A hidden native `<select>` is rendered alongside
 * for native form submission.
 */
export const anatomy = {
  root: "relative inline-flex w-full flex-col gap-1 font-sans",
  field: [
    "relative flex w-full items-center",
    "transition-[box-shadow,background-color,border-color,color]",
    "duration-medium2 ease-emphasized",
    "cursor-pointer text-left",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  trigger: [
    "relative z-[1] flex w-full items-center bg-transparent text-left outline-none",
    "disabled:cursor-not-allowed",
  ].join(" "),
  /** Visible value text — paints `on-surface`. Empty when nothing is selected. */
  value: ["flex-1 truncate text-on-surface"].join(" "),
  /** Placeholder shown when no option is selected. */
  placeholder: ["flex-1 truncate text-on-surface-variant opacity-70"].join(" "),
  /** Floating label, drives the M3 outlined-cutout effect when focused/filled. */
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
  list: "max-h-60 overflow-auto outline-none",
  option: [
    "relative flex cursor-pointer select-none items-center",
    "px-4 text-body-l text-on-surface",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  optionStateLayer:
    "pointer-events-none absolute inset-0 transition-opacity duration-short4 ease-standard bg-on-surface",
  empty: "px-4 py-3 text-body-m text-on-surface-variant",
  /** Visually-hidden native select that mirrors the value for forms. */
  nativeSelect:
    "sr-only pointer-events-none absolute inset-0 h-px w-px overflow-hidden opacity-0",
} as const;

export const variantFieldClasses: Record<SelectVariant, string> = {
  filled: [
    "rounded-t-shape-xs bg-surface-container-highest",
    "border-b border-on-surface-variant",
    "[&[data-open=true]]:border-primary",
    "[&[data-error=true]]:border-error",
  ].join(" "),
  outlined: [
    "rounded-shape-xs bg-transparent",
    "border border-outline",
    "[&[data-open=true]]:border-primary [&[data-open=true]]:border-2",
    "[&[data-error=true]]:border-error",
  ].join(" "),
};

export const variantStateLayerClasses: Record<SelectVariant, string> = {
  filled: "bg-on-surface rounded-t-shape-xs",
  outlined: "bg-primary rounded-shape-xs",
};

interface SizeSpec {
  field: string;
  paddingX: string;
  trigger: string;
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
  iconBox: string;
  popupOption: string;
}

/**
 * M3 Text Field heights: sm = 40dp (compact), md = 56dp (default
 * spec), lg = 72dp (comfortable).
 */
export const sizeSpec: Record<SelectSize, SizeSpec> = {
  sm: {
    field: "h-10",
    paddingX: "px-3",
    trigger: "py-2 text-body-m",
    label: "top-1/2 -translate-y-1/2 text-body-m text-on-surface-variant",
    labelFloating:
      "-top-1.5 text-label-s bg-background px-1 -translate-y-0 text-primary",
    labelLeft: "left-3",
    labelLeftWithIcon: "left-11",
    labelLeftFloating: "left-3",
    iconBox: "h-5 w-5",
    popupOption: "h-10",
  },
  md: {
    field: "h-14",
    paddingX: "px-4",
    trigger: "py-4 text-body-l",
    label: "top-1/2 -translate-y-1/2 text-body-l text-on-surface-variant",
    labelFloating:
      "-top-2 text-label-m bg-background px-1 -translate-y-0 text-primary",
    labelLeft: "left-4",
    labelLeftWithIcon: "left-14",
    labelLeftFloating: "left-4",
    iconBox: "h-6 w-6",
    popupOption: "h-12",
  },
  lg: {
    field: "h-[72px]",
    paddingX: "px-5",
    trigger: "py-5 text-title-m",
    label: "top-1/2 -translate-y-1/2 text-body-l text-on-surface-variant",
    labelFloating:
      "-top-2 text-label-m bg-background px-1 -translate-y-0 text-primary",
    labelLeft: "left-5",
    labelLeftWithIcon: "left-16",
    labelLeftFloating: "left-5",
    iconBox: "h-7 w-7",
    popupOption: "h-14",
  },
};
