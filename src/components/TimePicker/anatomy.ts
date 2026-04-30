import type {
  TimePickerShape,
  TimePickerSize,
  TimePickerVariant,
} from "./types";

/**
 * TimePicker anatomy + token bindings.
 *
 * Spec references (re-skinned MUI X TimePicker onto M3):
 *   - MUI X Time Picker      https://mui.com/x/react-date-pickers/time-picker/
 *   - M3 Time Picker docs    https://m3.material.io/components/time-pickers/specs
 *   - M3 color roles         https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale         https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens    https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens  https://m3.material.io/foundations/interaction/states
 *
 * The selection blob is a shared `layoutId` motion span that springs
 * between hour / minute positions. Its shape morphs from `shape-xs` to
 * the selected `shape` token via motion/react springs — the same M3
 * Expressive selection morph used by DatePicker / Tabs / Stepper /
 * Pagination / Data Grid.
 *
 * NOTE (Tailwind opacity gotcha): `bg-{role}/[opacity]` silently
 * no-ops with our `var()` color roles, so state-layers paint as a
 * dedicated overlay span whose opacity is animated from React state.
 */
export const anatomy = {
  /** Outermost host that wraps trigger + supporting text + panel. */
  root: [
    "relative inline-flex flex-col gap-1",
    "outline-none",
    "text-on-surface",
  ].join(" "),
  /** Disabled wash. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Trigger surface (the input-shaped button that opens the panel). */
  trigger: [
    "relative isolate inline-flex w-full items-center gap-2",
    "outline-none",
    "transition-[background-color,box-shadow,border-color,color]",
    "duration-medium2 ease-emphasized",
    "select-none cursor-pointer",
    "focus-visible:outline-none",
  ].join(" "),
  /** Trigger label paint. */
  triggerLabel: [
    "text-body-s text-on-surface-variant",
    "leading-none",
  ].join(" "),
  /** Trigger value paint. */
  triggerValue: [
    "block min-w-0 truncate",
    "text-body-l text-on-surface",
    "tabular-nums",
  ].join(" "),
  /** Trigger placeholder paint. */
  triggerPlaceholder: "text-on-surface-variant",
  /** Trigger icon slot wrap. */
  triggerIcon: [
    "inline-flex h-6 w-6 shrink-0 items-center justify-center",
    "text-on-surface-variant",
  ].join(" "),
  /** Supporting text below the trigger. */
  supporting: [
    "block text-body-s",
    "px-3",
  ].join(" "),
  supportingDefault: "text-on-surface-variant",
  supportingError: "text-error",
  /** State-layer overlay (used on the trigger + dial cells). */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-[1]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Panel surface (the floating clock). */
  panel: [
    "absolute left-0 top-full z-[20] mt-2",
    "min-w-[328px] w-[328px]",
    "bg-surface-container-high text-on-surface",
    "shadow-elevation-3",
    "outline-none",
    "transform-gpu",
    "p-6 flex flex-col gap-6",
  ].join(" "),
  /** Eyebrow line: "Select time". */
  panelEyebrow: "text-label-l text-on-surface-variant",
  /** Time field row: HH : MM + (optional) AM/PM column. */
  panelTimeRow: [
    "flex items-stretch gap-2",
    "select-none",
  ].join(" "),
  /** A single time field (hours or minutes). */
  timeField: [
    "relative isolate flex h-[80px] w-[96px] items-center justify-center",
    "rounded-shape-sm",
    "outline-none cursor-pointer",
    "transition-[background-color,color,box-shadow] duration-short4 ease-standard",
    "focus-visible:outline-none",
  ].join(" "),
  /** Default-state time field paint. */
  timeFieldDefault: "bg-surface-container-highest text-on-surface",
  /** Active time field paint (the one whose dial is showing). */
  timeFieldActive: [
    "bg-primary-container text-on-primary-container",
    "ring-2 ring-primary",
  ].join(" "),
  /** Time field digit. */
  timeFieldDigit: [
    "relative z-[2] text-display-m tabular-nums",
    "leading-none font-light",
  ].join(" "),
  /** ":" separator between HH and MM. */
  timeColon: [
    "flex items-center justify-center",
    "px-1 text-display-m text-on-surface tabular-nums",
    "leading-none font-light",
  ].join(" "),
  /** AM/PM toggle column wrapper. */
  ampmColumn: [
    "flex flex-col items-stretch overflow-hidden",
    "rounded-shape-sm border border-outline",
    "ml-1",
  ].join(" "),
  /** Single AM / PM cell. */
  ampmCell: [
    "relative isolate flex h-10 w-[48px] items-center justify-center",
    "outline-none cursor-pointer",
    "text-label-l text-on-surface",
    "transition-[background-color,color] duration-short4 ease-standard",
    "focus-visible:outline-none",
  ].join(" "),
  ampmCellSelected: "bg-tertiary-container text-on-tertiary-container",
  /** Dial section (clock face). */
  dialFrame: [
    "relative mx-auto flex items-center justify-center",
    "rounded-shape-full",
    "bg-surface-container-highest",
  ].join(" "),
  /** A single hour / minute cell on the dial. */
  dialCell: [
    "absolute z-[2] flex h-10 w-10 items-center justify-center",
    "-translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full",
    "outline-none cursor-pointer",
    "text-body-l text-on-surface tabular-nums",
    "transition-[color] duration-short4 ease-standard",
    "focus-visible:outline-none",
    "select-none",
  ].join(" "),
  dialCellSelected: "text-on-primary",
  dialCellDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Dial center pivot dot. */
  dialPivot: [
    "absolute left-1/2 top-1/2 z-[1] h-[6px] w-[6px]",
    "-translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full bg-primary",
  ].join(" "),
  /** Selection blob (shape-morphing motion span). */
  dialBlob: [
    "pointer-events-none absolute z-[1] h-10 w-10",
    "-translate-x-1/2 -translate-y-1/2",
    "bg-primary",
  ].join(" "),
  /** Selection stroke connecting pivot → blob. */
  dialStroke: [
    "pointer-events-none absolute z-[1] h-[2px] origin-left",
    "-translate-y-1/2",
    "bg-primary",
  ].join(" "),
  /** Footer row (Cancel / OK). */
  panelActions: [
    "flex items-center justify-end gap-2",
    "pt-2",
  ].join(" "),
  actionButton: [
    "relative inline-flex h-10 items-center justify-center",
    "px-3 rounded-shape-full",
    "text-label-l text-primary",
    "outline-none",
    "transition-colors duration-short4 ease-standard",
    "focus-visible:outline-none",
    "cursor-pointer",
  ].join(" "),
  actionDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
} as const;

interface VariantStyles {
  trigger: string;
}

/** Variant matrix — the trigger surface paint. */
export const variantClasses: Record<TimePickerVariant, VariantStyles> = {
  filled: {
    trigger: "bg-surface-container-highest border border-transparent",
  },
  tonal: {
    trigger: "bg-secondary-container text-on-secondary-container",
  },
  outlined: {
    trigger: "bg-transparent border border-outline",
  },
  text: {
    trigger: "bg-transparent border border-transparent",
  },
  elevated: {
    trigger:
      "bg-surface-container-low border border-transparent shadow-elevation-1",
  },
};

interface SizeBlock {
  /** Trigger min-height. */
  triggerHeight: string;
  /** Trigger horizontal padding. */
  triggerPadding: string;
  /** Dial frame width / height. */
  dialSize: string;
  /** Distance (px) from dial center to the cell center along the radius. */
  dialRadius: number;
}

/**
 * Density scale.
 *
 *   sm : 40dp trigger / 224dp dial   (compact)
 *   md : 56dp trigger / 256dp dial   (M3 default)
 *   lg : 64dp trigger / 288dp dial   (comfortable)
 */
export const sizeClasses: Record<TimePickerSize, SizeBlock> = {
  sm: {
    triggerHeight: "min-h-[40px]",
    triggerPadding: "px-3 py-1",
    dialSize: "h-[224px] w-[224px]",
    dialRadius: 92,
  },
  md: {
    triggerHeight: "min-h-[56px]",
    triggerPadding: "px-4 py-2",
    dialSize: "h-[256px] w-[256px]",
    dialRadius: 104,
  },
  lg: {
    triggerHeight: "min-h-[64px]",
    triggerPadding: "px-5 py-3",
    dialSize: "h-[288px] w-[288px]",
    dialRadius: 120,
  },
};

/** Panel + blob shape mapping. */
export const shapeClasses: Record<TimePickerShape, string> = {
  none: "rounded-shape-none",
  xs: "rounded-shape-xs",
  sm: "rounded-shape-sm",
  md: "rounded-shape-md",
  lg: "rounded-shape-lg",
  xl: "rounded-shape-xl",
  full: "rounded-shape-full",
};

/**
 * Trigger shape. The trigger uses a fixed `shape-xs` corner per the
 * M3 text-field anatomy — independent from the panel `shape` token.
 */
export const triggerShape = "rounded-shape-xs";
