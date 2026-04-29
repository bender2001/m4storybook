import type { RatingSize, RatingVariant } from "./types";

/**
 * Rating anatomy → Tailwind class strings. Token-driven only; no
 * hardcoded colors / radii / durations.
 *
 * M3 has no native Rating spec, so this is the MUI fallback re-skinned
 * with M3 tokens:
 *  - Active symbol = primary role (or tertiary in `accent` variant).
 *  - Empty symbol = on-surface-variant.
 *  - Hover/focus/pressed state-layers at M3 opacities (0.08 / 0.10 / 0.10).
 *  - Symbols animate scale on press with the springy preset.
 *  - Disabled fades the whole row to opacity 0.38.
 */
export const anatomy = {
  /** Outer wrapper — provides label + row + helper text. */
  group: ["inline-flex flex-col gap-1.5"].join(" "),
  /** Optional group label rendered above the row. */
  label: ["text-label-l text-on-surface-variant"].join(" "),
  /** Helper text under the row. */
  helper: ["text-body-s text-on-surface-variant"].join(" "),
  /** The actual row of symbols. */
  row: ["inline-flex items-center"].join(" "),
  /** Each symbol slot. Hosts both half + full inputs and the visual icon. */
  item: [
    "relative inline-flex items-center justify-center shrink-0",
    "rounded-shape-full",
    "transition-[background-color] duration-medium2 ease-emphasized",
  ].join(" "),
  /** Visually-hidden native radio input that drives selection. */
  input: [
    "absolute inset-0 m-0 h-full w-full appearance-none opacity-0",
    "cursor-pointer disabled:cursor-not-allowed",
  ].join(" "),
  /** Half-symbol input — covers the left half of the slot. */
  inputHalf: [
    "absolute inset-y-0 left-0 m-0 h-full w-1/2 appearance-none opacity-0",
    "cursor-pointer disabled:cursor-not-allowed",
  ].join(" "),
  /** State-layer painted under the icon. */
  stateLayer: [
    "pointer-events-none absolute inset-0 rounded-[inherit]",
    "transition-opacity duration-short4 ease-standard",
  ].join(" "),
  /** Wrapper around the icon — drives color + scale animation. */
  iconWrap: [
    "relative inline-flex items-center justify-center",
    "transition-colors duration-medium2 ease-emphasized",
  ].join(" "),
  /** The empty (background) icon — always rendered behind the half-clip. */
  emptyIcon: [
    "absolute inset-0 inline-flex items-center justify-center",
    "text-on-surface-variant",
    "transition-colors duration-medium2 ease-emphasized",
  ].join(" "),
  /** The filled icon (clipped to halve when precision=0.5). */
  filledIcon: [
    "absolute inset-0 inline-flex items-center justify-center",
    "transition-colors duration-medium2 ease-emphasized",
  ].join(" "),
} as const;

/**
 * Per-size measurements: hit target (state-layer) and icon glyph.
 *
 *  - sm: 32dp hit / 18dp icon, label-m caption type.
 *  - md: 40dp hit / 24dp icon, body-l caption type.   (default)
 *  - lg: 48dp hit / 32dp icon, title-m caption type.
 */
export const sizeClasses: Record<
  RatingSize,
  { item: string; icon: string; iconPx: number; label: string }
> = {
  sm: {
    item: "h-8 w-8",
    icon: "h-[18px] w-[18px]",
    iconPx: 18,
    label: "text-label-m",
  },
  md: {
    item: "h-10 w-10",
    icon: "h-6 w-6",
    iconPx: 24,
    label: "text-body-l",
  },
  lg: {
    item: "h-12 w-12",
    icon: "h-8 w-8",
    iconPx: 32,
    label: "text-title-m",
  },
};

interface VariantStyles {
  /** Color of the filled icon. */
  filled: string;
  /** Background of the state-layer. */
  stateLayer: string;
}

export const variantClasses: Record<RatingVariant, VariantStyles> = {
  default: {
    filled: "text-primary",
    stateLayer: "bg-on-surface",
  },
  accent: {
    filled: "text-tertiary",
    stateLayer: "bg-tertiary",
  },
};
