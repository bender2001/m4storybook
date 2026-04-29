import type { IconButtonSize, IconButtonVariant } from "./types";

/**
 * M3 Icon Button anatomy → Tailwind class strings. All values flow
 * from the M3 token layer; no hex literals or raw px.
 *
 * https://m3.material.io/components/icon-buttons/specs
 *  - State-layer opacities: hover 0.08, focus 0.10, pressed 0.10
 *  - Sizes (container/icon):
 *      Small:   32dp / 18dp
 *      Default: 40dp / 24dp
 *      Large:   56dp / 28dp
 *  - Shape: circular (shape-full) at rest. M3 Expressive toggle
 *    morphs to a squircle (shape-md/lg per size) when selected.
 */
export const anatomy = {
  root: [
    "relative inline-flex select-none items-center justify-center",
    "outline-none",
    "transition-[background-color,color,border-color,border-radius]",
    "duration-medium2 ease-emphasized",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "focus-visible:ring-offset-surface",
    "disabled:cursor-not-allowed",
  ].join(" "),
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  icon: "relative z-[1] inline-flex items-center justify-center",
} as const;

interface VariantStyles {
  /** Container background + content color in the unselected state. */
  rest: string;
  /** Container background + content color in the selected state. */
  selected: string;
  /** State-layer fill — painted in the on-color of the role. */
  stateLayer: string;
  /** Selected-state state-layer fill (when different from rest). */
  selectedStateLayer: string;
}

/**
 * Variant styles for both rest and selected (toggle) states. M3 spec:
 *  - filled   rest=surface-container-highest/on-surface-variant; selected=primary/on-primary
 *  - tonal    rest=surface-container-highest/on-surface-variant; selected=secondary-container/on-secondary-container
 *  - outlined rest=transparent/on-surface-variant + outline; selected=inverse-surface/inverse-on-surface
 *  - standard rest=transparent/on-surface-variant; selected=transparent/primary
 */
export const variantClasses: Record<IconButtonVariant, VariantStyles> = {
  filled: {
    rest: "bg-surface-container-highest text-on-surface-variant border border-transparent",
    selected: "bg-primary text-on-primary border border-transparent",
    stateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-on-primary",
  },
  tonal: {
    rest: "bg-surface-container-highest text-on-surface-variant border border-transparent",
    selected:
      "bg-secondary-container text-on-secondary-container border border-transparent",
    stateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-on-secondary-container",
  },
  outlined: {
    rest: "bg-transparent text-on-surface-variant border border-outline",
    selected:
      "bg-inverse-surface text-inverse-on-surface border border-transparent",
    stateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-inverse-on-surface",
  },
  standard: {
    rest: "bg-transparent text-on-surface-variant border border-transparent",
    selected: "bg-transparent text-primary border border-transparent",
    stateLayer: "bg-on-surface-variant",
    selectedStateLayer: "bg-primary",
  },
};

/**
 * Per-size dimensions: container, icon, and the squircle radius used
 * when the button is selected (M3 Expressive shape morph). Rest radius
 * is always shape-full (circular).
 */
export const sizeClasses: Record<
  IconButtonSize,
  {
    container: string;
    icon: string;
    /** Selected-state shape (morph target). */
    selectedRadius: string;
  }
> = {
  sm: {
    container: "h-8 w-8",
    icon: "h-[18px] w-[18px]",
    selectedRadius: "rounded-shape-sm",
  },
  md: {
    container: "h-10 w-10",
    icon: "h-6 w-6",
    selectedRadius: "rounded-shape-md",
  },
  lg: {
    container: "h-14 w-14",
    icon: "h-7 w-7",
    selectedRadius: "rounded-shape-lg",
  },
};

/**
 * Disabled override applied to all variants. M3 spec calls for an
 * on-surface@12% container with on-surface@38% content; we
 * approximate via opaque token roles plus a 38% opacity fade so the
 * disabled icon still has a visible silhouette (token-driven, no
 * rgba literals — `bg-{role}/[0.12]` silently no-ops in this Tailwind
 * config because the var()-based palette has no <alpha-value> slot).
 */
export const disabledClasses = [
  "bg-transparent text-on-surface-variant border-transparent",
  "opacity-[0.38]",
].join(" ");

/**
 * Disabled override for filled / tonal variants — these ones keep a
 * visible container in M3 spec (on-surface@12%); we render with the
 * surface-variant role at 38% to match.
 */
export const disabledFilledClasses = [
  "bg-surface-variant text-on-surface-variant border-transparent",
  "opacity-[0.38]",
].join(" ");
