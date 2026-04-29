import type { ChipSize, ChipVariant } from "./types";

/**
 * Chip anatomy. M3 Expressive characteristic = a shape morph from
 * shape-sm (8dp) to shape-full (pill) when the chip becomes selected,
 * driven by the medium2 (300ms) emphasized easing token. State layer
 * mirrors the input library so hover paints 0.08, focus 0.10, pressed
 * 0.10 of the on-color role.
 *
 * Implements M3 chip per https://m3.material.io/components/chips/specs.
 */
export const anatomy = {
  /** Visible chip surface. */
  root: [
    "relative inline-flex items-center justify-center",
    "whitespace-nowrap select-none font-medium",
    "outline-none cursor-pointer overflow-hidden",
    "transition-[box-shadow,background-color,border-color,color,opacity,border-radius,transform]",
    "duration-medium2 ease-emphasized origin-center",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
  ].join(" "),
  /** Force the chip into the disabled visual + interaction state. */
  disabled: "opacity-[0.38] cursor-not-allowed pointer-events-none",
  /** State layer overlay (hover/focus/pressed paint). */
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  label: "relative z-[1] inline-flex items-center leading-none",
  iconLeading:
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  iconTrailing:
    "relative z-[1] inline-flex shrink-0 items-center justify-center",
  /** Trailing dismiss affordance (input chip). */
  deleteButton: [
    "relative z-[2] inline-flex shrink-0 items-center justify-center",
    "rounded-shape-full outline-none cursor-pointer",
    "transition-colors duration-short4 ease-standard",
    "hover:bg-on-surface/10 focus-visible:ring-2 focus-visible:ring-primary",
  ].join(" "),
} as const;

/**
 * Color matrix per M3 chip spec. Unselected = outlined surface (or
 * elevated when `elevated` prop is set). Selected morphs to the
 * appropriate filled container for that variant.
 *
 * Per M3:
 *   - assist:     unselected = outline + on-surface; selected = primary-container
 *   - filter:     unselected = outline + on-surface-variant; selected = secondary-container
 *   - input:      unselected = outline + on-surface; selected = secondary-container
 *   - suggestion: unselected = outline + on-surface-variant; selected = secondary-container
 */
export const variantClasses: Record<
  ChipVariant,
  { rest: string; selected: string; stateLayer: string }
> = {
  assist: {
    rest: "bg-transparent text-on-surface border border-outline",
    selected:
      "bg-primary-container text-on-primary-container border border-transparent",
    stateLayer: "bg-on-surface",
  },
  filter: {
    rest: "bg-transparent text-on-surface-variant border border-outline",
    selected:
      "bg-secondary-container text-on-secondary-container border border-transparent",
    stateLayer: "bg-on-surface",
  },
  input: {
    rest: "bg-transparent text-on-surface border border-outline",
    selected:
      "bg-secondary-container text-on-secondary-container border border-transparent",
    stateLayer: "bg-on-surface",
  },
  suggestion: {
    rest: "bg-transparent text-on-surface-variant border border-outline",
    selected:
      "bg-secondary-container text-on-secondary-container border border-transparent",
    stateLayer: "bg-on-surface",
  },
};

/**
 * Elevated container override. M3 elevated chip swaps the outlined
 * surface for surface-container-low + an elevation-1 drop-shadow.
 * The selected style still wins when both `elevated` and `selected`
 * are set.
 */
export const elevatedClasses: Record<ChipVariant, string> = {
  assist: "bg-surface-container-low text-on-surface border border-transparent shadow-elevation-1",
  filter: "bg-surface-container-low text-on-surface-variant border border-transparent shadow-elevation-1",
  input: "bg-surface-container-low text-on-surface border border-transparent shadow-elevation-1",
  suggestion: "bg-surface-container-low text-on-surface-variant border border-transparent shadow-elevation-1",
};

/**
 * Sizes. md = M3 default chip (32dp tall). sm/lg are companion
 * densities for compact vs. emphasized layouts.
 */
export const sizeClasses: Record<
  ChipSize,
  {
    container: string;
    text: string;
    gap: string;
    iconBox: string;
    deleteBox: string;
    paddingX: string;
    paddingXWithLeading: string;
    paddingXWithTrailing: string;
  }
> = {
  sm: {
    container: "h-6",
    text: "text-label-s",
    gap: "gap-1",
    iconBox: "h-3.5 w-3.5",
    deleteBox: "h-4 w-4",
    paddingX: "px-2",
    paddingXWithLeading: "pl-1.5 pr-2",
    paddingXWithTrailing: "pl-2 pr-1",
  },
  md: {
    container: "h-8",
    text: "text-label-l",
    gap: "gap-2",
    iconBox: "h-4 w-4",
    deleteBox: "h-[18px] w-[18px]",
    paddingX: "px-4",
    paddingXWithLeading: "pl-2 pr-4",
    paddingXWithTrailing: "pl-4 pr-2",
  },
  lg: {
    container: "h-10",
    text: "text-label-l",
    gap: "gap-2",
    iconBox: "h-5 w-5",
    deleteBox: "h-5 w-5",
    paddingX: "px-5",
    paddingXWithLeading: "pl-3 pr-5",
    paddingXWithTrailing: "pl-5 pr-3",
  },
};

/**
 * Shape: M3 chip default = shape-sm (8dp). M3 Expressive morphs to
 * shape-full (pill) when the chip is selected — we drive that morph
 * over the medium2 (300ms) emphasized easing token.
 */
export const shapeClasses = {
  rest: "rounded-shape-sm",
  selected: "rounded-shape-full",
} as const;
