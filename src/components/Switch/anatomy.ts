import type { SwitchSize } from "./types";

/**
 * M3 Expressive Switch anatomy → Tailwind class strings. Token-driven only;
 * no hardcoded colors / radii / durations.
 *
 * https://m3.material.io/components/switch/specs
 *  - Track: 52dp × 32dp at md density, shape-full pill.
 *  - Selected: track = primary; handle slides right; handle = on-primary.
 *  - Unselected: track = surface-container-highest; outline border (2dp).
 *  - Handle morphs by state:
 *      * unselected = 16dp circle, fill = outline.
 *      * selected   = 24dp circle, fill = on-primary.
 *      * pressed    = 28dp circle (the M3 Expressive squish).
 *  - State-layer: 40dp circle around the handle, hover 0.08, focus 0.10,
 *    pressed 0.10.
 *  - Disabled: 0.12 track / 0.38 outline / 0.38 handle.
 *  - Optional handle icon (e.g. Check / Minus).
 */
export const anatomy = {
  /** Outer label-row: positions track + label. */
  root: [
    "inline-flex items-center gap-3",
    "text-on-surface",
    "select-none",
  ].join(" "),
  /** Track container. Holds the track background, handle, native input. */
  control: [
    "relative inline-flex shrink-0 items-center",
    "rounded-shape-full",
    "transition-[background-color,border-color] duration-medium2 ease-emphasized",
    "border-2",
    "cursor-pointer",
  ].join(" "),
  /** Visually-hidden native input that owns the keyboard + form value. */
  input: [
    "peer absolute inset-0 m-0 h-full w-full cursor-pointer",
    "appearance-none opacity-0",
    "disabled:cursor-not-allowed",
  ].join(" "),
  /** The moving handle pill. */
  handle: [
    "absolute top-1/2 inline-flex items-center justify-center",
    "rounded-shape-full",
    "pointer-events-none",
  ].join(" "),
  /** State layer painted around the handle. */
  stateLayer: [
    "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "rounded-shape-full",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Optional icon inside the handle. */
  icon: [
    "inline-flex items-center justify-center",
    "pointer-events-none",
  ].join(" "),
  /** Label/helper-text column. */
  labelColumn: "flex flex-col",
  /** Label text next to the track. */
  label: [
    "text-body-l text-on-surface",
    "transition-colors duration-short4 ease-standard",
  ].join(" "),
  /** Helper text under the label. */
  helper: "text-body-s text-on-surface-variant",
} as const;

/**
 * Per-size measurements: track width × height, handle widths per state,
 * and the state-layer footprint. All values in pixels (dp).
 *
 *  - sm: track 40×24, handle 12 → 18 → 22, state-layer 32dp
 *  - md: track 52×32, handle 16 → 24 → 28, state-layer 40dp  (M3 default)
 *  - lg: track 64×40, handle 20 → 30 → 36, state-layer 48dp
 */
export interface SizeSpec {
  /** Track width × height as Tailwind classes (h × w). */
  track: string;
  /** Track width in px (matches `track` class). */
  trackWidth: number;
  /** Track height in px. */
  trackHeight: number;
  /** Handle size by state, in px. */
  handle: { unselected: number; selected: number; pressed: number };
  /** Inner padding (dp) between track edge and handle when at rest. */
  innerPadding: number;
  /** State-layer footprint (px). */
  stateLayer: number;
  /** Icon size class. */
  icon: string;
  /** Label type role class. */
  label: string;
}

export const sizeSpec: Record<SwitchSize, SizeSpec> = {
  sm: {
    track: "h-6 w-10",
    trackWidth: 40,
    trackHeight: 24,
    handle: { unselected: 12, selected: 18, pressed: 22 },
    innerPadding: 4,
    stateLayer: 32,
    icon: "h-2 w-2",
    label: "text-label-l",
  },
  md: {
    track: "h-8 w-[52px]",
    trackWidth: 52,
    trackHeight: 32,
    handle: { unselected: 16, selected: 24, pressed: 28 },
    innerPadding: 4,
    stateLayer: 40,
    icon: "h-3.5 w-3.5",
    label: "text-body-l",
  },
  lg: {
    track: "h-10 w-16",
    trackWidth: 64,
    trackHeight: 40,
    handle: { unselected: 20, selected: 30, pressed: 36 },
    innerPadding: 4,
    stateLayer: 48,
    icon: "h-4 w-4",
    label: "text-title-m",
  },
};

interface VariantStyles {
  /** Track classes when selected. */
  trackSelected: string;
  /** Track classes when unselected. */
  trackUnselected: string;
  /** Track border classes when selected. */
  borderSelected: string;
  /** Track border classes when unselected. */
  borderUnselected: string;
  /** Handle fill when selected. */
  handleSelected: string;
  /** Handle fill when unselected. */
  handleUnselected: string;
  /** Icon stroke when selected. */
  iconSelected: string;
  /** Icon stroke when unselected. */
  iconUnselected: string;
  /** State-layer fill when selected. */
  stateLayerSelected: string;
  /** State-layer fill when unselected. */
  stateLayerUnselected: string;
}

export const variantClasses: Record<"filled" | "outlined", VariantStyles> = {
  filled: {
    trackSelected: "bg-primary",
    trackUnselected: "bg-surface-container-highest",
    borderSelected: "border-primary",
    borderUnselected: "border-outline",
    handleSelected: "bg-on-primary",
    handleUnselected: "bg-outline",
    iconSelected: "text-on-primary-container",
    iconUnselected: "text-surface-container-highest",
    stateLayerSelected: "bg-primary",
    stateLayerUnselected: "bg-on-surface",
  },
  outlined: {
    trackSelected: "bg-primary",
    trackUnselected: "bg-transparent",
    borderSelected: "border-primary",
    borderUnselected: "border-outline",
    handleSelected: "bg-on-primary",
    handleUnselected: "bg-on-surface-variant",
    iconSelected: "text-on-primary-container",
    iconUnselected: "text-surface",
    stateLayerSelected: "bg-primary",
    stateLayerUnselected: "bg-on-surface",
  },
};

export const errorClasses: VariantStyles = {
  trackSelected: "bg-error",
  trackUnselected: "bg-error-container",
  borderSelected: "border-error",
  borderUnselected: "border-error",
  handleSelected: "bg-on-error",
  handleUnselected: "bg-error",
  iconSelected: "text-on-error",
  iconUnselected: "text-error-container",
  stateLayerSelected: "bg-error",
  stateLayerUnselected: "bg-error",
};

export const disabledClasses = {
  control: "cursor-not-allowed opacity-[0.38]",
  trackSelected: "bg-on-surface/[0.12]",
  trackUnselected: "bg-surface-container-highest",
  borderSelected: "border-on-surface/[0.12]",
  borderUnselected: "border-on-surface/[0.12]",
  handleSelected: "bg-surface",
  handleUnselected: "bg-on-surface",
  label: "text-on-surface/[0.38]",
} as const;
