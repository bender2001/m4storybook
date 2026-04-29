import type {
  TooltipPlacement,
  TooltipSize,
  TooltipVariant,
} from "./types";

/**
 * Tooltip anatomy. M3 spec
 * (https://m3.material.io/components/tooltips/specs):
 *  - Plain tooltip: container `inverse-surface`, text
 *    `inverse-on-surface`, body-s (12px / weight 500), shape-xs
 *    (4dp), height 24dp, padding 8dp × 4dp.
 *  - Rich tooltip: container `surface-container`, text
 *    `on-surface`, subhead `title-s`, supporting `body-m`,
 *    shape-sm (8dp), elevation-2, 280dp max width, 16dp padding.
 *  - Motion: emphasized-decelerate fade + scale on enter,
 *    standard-accelerate on exit.
 */
export const anatomy = {
  /** Inline-block trigger wrapper. */
  trigger: "relative inline-flex max-w-fit",
  /** Floating panel root (positioned absolutely relative to trigger). */
  panel: [
    "pointer-events-none absolute z-50",
    "origin-center select-none",
  ].join(" "),
  /** Plain tooltip container. */
  plain: [
    "rounded-shape-xs bg-inverse-surface text-inverse-on-surface",
    "text-body-s font-medium leading-none",
    "whitespace-nowrap",
  ].join(" "),
  /** Rich tooltip container. */
  rich: [
    "rounded-shape-sm bg-surface-container text-on-surface",
    "shadow-elevation-2",
    "flex flex-col gap-2",
  ].join(" "),
  /** Rich subhead (title-s). */
  subhead: "text-title-s text-on-surface",
  /** Rich supporting text (body-m). */
  supporting: "text-body-m text-on-surface-variant",
  /** Rich action slot. */
  action: "mt-1 flex items-center justify-end",
} as const;

/**
 * Plain tooltip size scale. The plain tooltip is intentionally
 * compact: only horizontal padding scales meaningfully — the text
 * size is locked to body-s per the M3 spec.
 *  - sm : 24dp height (M3 default), 8dp / 4dp padding
 *  - md : 28dp height, 12dp / 6dp padding
 *  - lg : 32dp height, 16dp / 8dp padding
 */
export const plainSize: Record<
  TooltipSize,
  { padding: string; minHeight: string }
> = {
  sm: { padding: "px-2 py-1", minHeight: "min-h-[24px]" },
  md: { padding: "px-3 py-1.5", minHeight: "min-h-[28px]" },
  lg: { padding: "px-4 py-2", minHeight: "min-h-[32px]" },
};

/**
 * Rich tooltip size scale. Padding + max-width scale together to
 * support short / standard / wide rich tooltips.
 */
export const richSize: Record<
  TooltipSize,
  { padding: string; maxWidth: string }
> = {
  sm: { padding: "p-3", maxWidth: "max-w-[200px]" },
  md: { padding: "p-4", maxWidth: "max-w-[280px]" },
  lg: { padding: "p-5", maxWidth: "max-w-[360px]" },
};

/**
 * Resolve placement → absolute-positioning utilities. The 8dp
 * gap between the trigger and the tooltip mirrors the M3 spec.
 */
export const placementClass: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
};

/**
 * Default hide-delay differs by variant. Plain tooltips dismiss
 * 1500ms after the pointer leaves, matching the M3 dwell guidance.
 * Rich tooltips dismiss instantly because they support pointer
 * entry to the panel itself for action buttons.
 */
export const defaultHideDelay: Record<TooltipVariant, number> = {
  plain: 1500,
  rich: 0,
};
