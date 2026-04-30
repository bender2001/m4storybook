import type {
  DatePickerShape,
  DatePickerSize,
  DatePickerVariant,
} from "./types";

/**
 * DatePicker anatomy + token bindings.
 *
 * Spec references (re-skinned MUI X DatePicker onto M3):
 *   - MUI X Date Picker      https://mui.com/x/react-date-pickers/date-picker/
 *   - M3 Date Picker docs    https://m3.material.io/components/date-pickers/specs
 *   - M3 color roles         https://m3.material.io/styles/color/the-color-system/color-roles
 *   - M3 shape scale         https://m3.material.io/styles/shape/shape-scale-tokens
 *   - M3 elevation tokens    https://m3.material.io/styles/elevation/tokens
 *   - M3 state-layer tokens  https://m3.material.io/foundations/interaction/states
 *
 * The selected-day indicator is a shared `layoutId` motion span that
 * springs between days. Its shape morphs from `shape-xs` to the
 * selected `shape` token via motion/react springs — the same M3
 * Expressive selection morph used by Tabs / Stepper / Pagination /
 * Data Grid.
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
  /** Supporting text default color. */
  supportingDefault: "text-on-surface-variant",
  /** Supporting text in the error role. */
  supportingError: "text-error",
  /** State-layer overlay (used on the trigger + day cells). */
  stateLayer: [
    "pointer-events-none absolute inset-0 z-[1]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Panel surface (the floating calendar). */
  panel: [
    "absolute left-0 top-full z-[20] mt-2",
    "min-w-[320px]",
    "bg-surface-container-high text-on-surface",
    "shadow-elevation-3",
    "outline-none",
    "transform-gpu",
  ].join(" "),
  /** Panel header (supporting line + headline). */
  panelHeader: [
    "flex flex-col gap-1 px-6 pt-4 pb-3",
    "border-b border-outline-variant",
  ].join(" "),
  /** "Select date" supporting line. */
  panelHeaderEyebrow: "text-label-l text-on-surface-variant",
  /** Headline date in the header. */
  panelHeadline: [
    "text-headline-l text-on-surface",
    "tabular-nums",
  ].join(" "),
  /** Month nav row (prev / month-year / next). */
  panelNav: [
    "flex items-center justify-between",
    "px-3 pt-3 pb-1",
  ].join(" "),
  /** Month + year label between the nav buttons. */
  panelNavLabel: [
    "text-label-l text-on-surface",
    "select-none",
  ].join(" "),
  /** Prev/next buttons in the nav row. */
  panelNavButton: [
    "relative inline-flex h-10 w-10 items-center justify-center",
    "rounded-shape-full",
    "outline-none",
    "transition-colors duration-short4 ease-standard",
    "text-on-surface-variant",
    "focus-visible:outline-none",
    "cursor-pointer",
  ].join(" "),
  /** Day-of-week header row inside the panel grid. */
  weekdayRow: [
    "grid grid-cols-7 gap-0",
    "px-3 pb-1",
  ].join(" "),
  /** A single day-of-week cell inside the weekday row. */
  weekdayCell: [
    "flex h-10 items-center justify-center",
    "text-body-s font-medium text-on-surface-variant",
    "select-none",
  ].join(" "),
  /** Day grid (7 cols × up to 6 rows). */
  dayGrid: [
    "grid grid-cols-7 gap-0",
    "px-3 pb-3",
  ].join(" "),
  /** A day cell host (interactive button). */
  dayCell: [
    "relative isolate inline-flex items-center justify-center",
    "outline-none",
    "transition-[background-color,color] duration-short4 ease-standard",
    "select-none",
    "focus-visible:outline-none",
    "cursor-pointer",
    "rounded-shape-full",
  ].join(" "),
  /** Day cell that lives in an adjacent month (visually muted). */
  dayCellOutside: "text-on-surface-variant opacity-[0.6]",
  /** Disabled day. */
  dayCellDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** Today affordance — outlined ring on the day cell when not selected. */
  dayCellToday: [
    "ring-1 ring-primary text-primary",
  ].join(" "),
  /** Selected-day paint (token-driven; sits beneath the cursor span). */
  dayCellSelected: "text-on-primary",
  /** Day cell label (lives above the state layer + cursor). */
  dayCellLabel: "relative z-[2] text-body-l tabular-nums",
  /** Selected-day cursor (shape-morphing motion span). */
  dayCursor: [
    "pointer-events-none absolute inset-0 z-[1]",
    "bg-primary",
  ].join(" "),
  /** Footer row (Cancel / OK). */
  panelActions: [
    "flex items-center justify-end gap-2",
    "px-3 pb-3 pt-1",
  ].join(" "),
  /** Action button (Cancel / OK). */
  actionButton: [
    "relative inline-flex h-10 items-center justify-center",
    "px-3 rounded-shape-full",
    "text-label-l text-primary",
    "outline-none",
    "transition-colors duration-short4 ease-standard",
    "focus-visible:outline-none",
    "cursor-pointer",
  ].join(" "),
  /** Action button disabled wash. */
  actionDisabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
} as const;

interface VariantStyles {
  /** Trigger surface paint. */
  trigger: string;
  /** Trigger height adjustment when needed (currently unused per variant). */
  triggerExtra: string;
}

/** Variant matrix. */
export const variantClasses: Record<DatePickerVariant, VariantStyles> = {
  filled: {
    trigger: "bg-surface-container-highest border border-transparent",
    triggerExtra: "",
  },
  tonal: {
    trigger: "bg-secondary-container text-on-secondary-container",
    triggerExtra: "",
  },
  outlined: {
    trigger: "bg-transparent border border-outline",
    triggerExtra: "",
  },
  text: {
    trigger: "bg-transparent border border-transparent",
    triggerExtra: "",
  },
  elevated: {
    trigger:
      "bg-surface-container-low border border-transparent shadow-elevation-1",
    triggerExtra: "",
  },
};

interface SizeBlock {
  /** Trigger min-height. */
  triggerHeight: string;
  /** Trigger horizontal padding. */
  triggerPadding: string;
  /** Day cell width / height. */
  daySize: string;
  /** Headline font role on the panel header. */
  headlineSize: string;
}

/**
 * Density scale.
 *
 *   sm : 40dp trigger / 32dp day cell  (compact)
 *   md : 56dp trigger / 40dp day cell  (M3 default)
 *   lg : 64dp trigger / 48dp day cell  (comfortable)
 */
export const sizeClasses: Record<DatePickerSize, SizeBlock> = {
  sm: {
    triggerHeight: "min-h-[40px]",
    triggerPadding: "px-3 py-1",
    daySize: "h-8 w-8",
    headlineSize: "text-headline-m",
  },
  md: {
    triggerHeight: "min-h-[56px]",
    triggerPadding: "px-4 py-2",
    daySize: "h-10 w-10",
    headlineSize: "text-headline-l",
  },
  lg: {
    triggerHeight: "min-h-[64px]",
    triggerPadding: "px-5 py-3",
    daySize: "h-12 w-12",
    headlineSize: "text-headline-l",
  },
};

/**
 * Panel + selection-indicator shape mapping.
 *
 * The panel container takes the shape token directly. The day cells
 * always paint `shape-full` (circular) per M3 — only the selection
 * cursor morphs from `shape-xs` to the shape token via `layoutId`.
 */
export const shapeClasses: Record<DatePickerShape, string> = {
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
