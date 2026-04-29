import type { SliderSize } from "./types";

/**
 * Slider anatomy slot → Tailwind class string. Token-driven only.
 *
 * Shapes the M3 Expressive slider:
 *   - Active track: primary role
 *   - Inactive track: secondary-container role
 *   - Handle: pill-shaped (rounded-shape-full) primary fill
 *   - Stop indicators on discrete variant
 *   - Value bubble (primary-container) appears while interacting
 *   - State-layer paints on-primary at hover/focus/pressed/dragged
 */
export const anatomy = {
  root: "relative inline-flex w-full flex-col gap-2 font-sans select-none",
  header: "flex items-center justify-between gap-3",
  label: "text-label-l text-on-surface-variant",
  valueText: "text-label-m text-on-surface-variant tabular-nums",
  field: "relative flex w-full items-center gap-3",
  leadingIcon:
    "inline-flex shrink-0 items-center justify-center text-on-surface-variant",
  trailingIcon:
    "inline-flex shrink-0 items-center justify-center text-on-surface-variant",
  /** Click/drag surface. Spans the full width and contains track + handle. */
  trackWrapper:
    "relative flex flex-1 items-center cursor-pointer touch-none select-none",
  /** Inactive track painted under the active fill. */
  trackInactive:
    "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-secondary-container rounded-shape-full",
  /** Active track painted from min to current value. */
  trackActive:
    "absolute left-0 top-1/2 -translate-y-1/2 bg-primary rounded-shape-full transition-[width] duration-short4 ease-standard",
  /** Stop indicators rendered on the inactive section of a discrete track. */
  stop:
    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-shape-full bg-on-secondary-container",
  /** Pill handle. */
  handle: [
    "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full bg-primary",
    "outline-none focus-visible:ring-0",
    "transition-[width,height] duration-short4 ease-emphasized",
  ].join(" "),
  /** State layer painted on/around the handle. */
  handleStateLayer: [
    "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full bg-primary",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Value bubble that appears above the handle while focused/dragged. */
  valueBubble: [
    "pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full",
    "bg-primary rounded-shape-full px-3 py-1",
    "text-label-m text-on-primary tabular-nums",
    "shadow-elevation-2",
  ].join(" "),
  /** Visually-hidden native range input that owns keyboard + form value. */
  nativeInput: [
    "absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0",
    "appearance-none focus:outline-none focus-visible:outline-none",
    "disabled:cursor-not-allowed",
  ].join(" "),
  helperText: "px-1 text-body-s text-on-surface-variant",
} as const;

interface SizeSpec {
  /** Total interactive height of the slider (44dp default per M3 spec). */
  field: string;
  /** Active + inactive track thickness. M3 Expressive = 16dp. */
  trackHeight: string;
  /** Stop indicator size. */
  stopSize: string;
  /** Handle width × height (pill). */
  handleWidth: string;
  handleHeight: string;
  /** Pressed/dragged handle width override (M3 Expressive shape morph). */
  handlePressedWidth: string;
  /** State-layer footprint around the handle. */
  stateLayerSize: string;
}

/**
 * M3 Expressive density:
 *   sm = 32dp container, 12dp track, 4×24dp handle
 *   md = 44dp container, 16dp track, 4×44dp handle (default spec)
 *   lg = 56dp container, 20dp track, 4×56dp handle
 */
export const sizeSpec: Record<SliderSize, SizeSpec> = {
  sm: {
    field: "h-8",
    trackHeight: "h-3",
    stopSize: "h-1 w-1",
    handleWidth: "w-1",
    handleHeight: "h-6",
    handlePressedWidth: "w-2",
    stateLayerSize: "h-10 w-10",
  },
  md: {
    field: "h-11",
    trackHeight: "h-4",
    stopSize: "h-1.5 w-1.5",
    handleWidth: "w-1",
    handleHeight: "h-11",
    handlePressedWidth: "w-2.5",
    stateLayerSize: "h-14 w-14",
  },
  lg: {
    field: "h-14",
    trackHeight: "h-5",
    stopSize: "h-2 w-2",
    handleWidth: "w-1.5",
    handleHeight: "h-14",
    handlePressedWidth: "w-3",
    stateLayerSize: "h-16 w-16",
  },
};
